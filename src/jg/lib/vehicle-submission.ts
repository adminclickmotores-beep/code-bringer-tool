import { z } from 'zod';

export const MAX_VEHICLE_PHOTOS = 8;
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export function minimumPhotos(vehicleType: 'moto' | 'carro') {
  return vehicleType === 'moto' ? 3 : 5;
}

const currentYear = 2070;

export const vehicleSubmissionSchema = z.object({
  saleMode: z.enum(['publicar_gratis', 'directa', 'consignacion']),
  name: z.string().trim().min(2, 'Escribe tu nombre completo.').max(100),
  phone: z.string().trim().regex(/^[0-9+()\s-]{7,20}$/, 'Escribe un número de WhatsApp válido.'),
  vehicleType: z.enum(['moto', 'carro']),
  brand: z.string().trim().min(2, 'Escribe la marca.').max(60),
  model: z.string().trim().min(1, 'Escribe el modelo.').max(80),
  year: z.coerce.number().int(),
  displacement: z.string().trim().max(30),
  mileage: z.number().int().min(0).max(2_000_000),
  city: z.string().trim().min(2, 'Escribe la ciudad.').max(80),
  plate: z.string().trim().toUpperCase().regex(/^[A-Z0-9-]{3,10}$/, 'Escribe una placa válida.'),
  condition: z.string().trim().max(120),
  askingPrice: z.number().min(0).max(10_000_000_000),
  description: z.string().trim().max(1200),
  photoUrls: z.array(z.string().url()).max(MAX_VEHICLE_PHOTOS),
  propertyCardPaths: z.tuple([
    z.string().regex(/^property-cards\/[0-9a-f-]{36}\/front-[0-9a-f-]{36}\.(?:jpg|jpeg|png|webp)$/),
    z.string().regex(/^property-cards\/[0-9a-f-]{36}\/back-[0-9a-f-]{36}\.(?:jpg|jpeg|png|webp)$/),
  ]),
  acceptedPrivacy: z.literal(true),
}).superRefine((data, ctx) => {
  const required = minimumPhotos(data.vehicleType);
  if (data.photoUrls.length < required) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['photoUrls'],
      message: `Sube mínimo ${required} fotos del vehículo.`,
    });
  }
  const frontGroup = data.propertyCardPaths[0].split('/')[1];
  const backGroup = data.propertyCardPaths[1].split('/')[1];
  if (frontGroup !== backGroup) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['propertyCardPaths'],
      message: 'El frente y el reverso deben pertenecer a la misma solicitud.',
    });
  }
});

export type VehicleSubmissionPayload = z.infer<typeof vehicleSubmissionSchema>;

type ComparableVehicle = {
  type: 'moto' | 'carro';
  brand: string;
  model: string;
  year: number;
  price: number;
};

export function suggestedVehiclePrice(
  input: Pick<ComparableVehicle, 'type' | 'brand' | 'model' | 'year'>,
  vehicles: ComparableVehicle[],
): number | null {
  const normalizedBrand = input.brand.trim().toLocaleLowerCase('es-CO');
  const normalizedModel = input.model.trim().toLocaleLowerCase('es-CO');
  const sameModel = vehicles.filter((vehicle) =>
    vehicle.type === input.type
    && vehicle.brand.trim().toLocaleLowerCase('es-CO') === normalizedBrand
    && vehicle.model.trim().toLocaleLowerCase('es-CO') === normalizedModel
    && vehicle.price > 0,
  );
  const sameBrand = vehicles.filter((vehicle) =>
    vehicle.type === input.type
    && vehicle.brand.trim().toLocaleLowerCase('es-CO') === normalizedBrand
    && vehicle.price > 0,
  );
  const candidates = sameModel.length > 0 ? sameModel : sameBrand;
  if (candidates.length === 0) return null;

  const adjusted = candidates.map((vehicle) => {
    const yearDifference = input.year - vehicle.year;
    return vehicle.price * Math.pow(0.92, -yearDifference);
  });
  const average = adjusted.reduce((sum, value) => sum + value, 0) / adjusted.length;
  return Math.max(500_000, Math.round(average / 100_000) * 100_000);
}