import { z } from 'zod';
import { formatCOP } from './supabase';

const phone = z.string().trim().regex(/^3\d{9}$/, 'Escribe un celular de 10 dígitos que empiece por 3.');

export const directPurchaseSchema = z.object({
  kind: z.literal('directa'),
  name: z.string().trim().min(2, 'Escribe tu nombre.').max(100),
  phone,
  vehicleType: z.enum(['moto', 'carro']),
  brand: z.string().trim().min(2, 'Escribe la marca.').max(60),
  year: z.number().int().min(1950, 'Revisa el año.').max(2050, 'Revisa el año.'),
  version: z.string().trim().min(1, 'Escribe la referencia o versión.').max(80),
  transmission: z.enum(['automatico', 'mecanico']),
  traction: z.enum(['4x2', '4x4']).nullable(),
  mileage: z.number().int().min(0).max(2_000_000),
  color: z.string().trim().min(2, 'Escribe el color.').max(40),
  city: z.string().trim().min(2, 'Escribe la ciudad.').max(80),
  plate: z.string().trim().toUpperCase().regex(/^[A-Z0-9-]{3,10}$/, 'Escribe una placa válida.'),
  documentsUpToDate: z.boolean(),
  hasLien: z.boolean(),
  askingPrice: z.number().min(0).max(10_000_000_000),
  photoUrls: z.array(z.string().url()).min(4, 'Sube mínimo 4 fotos.').max(8),
  acceptedPrivacy: z.literal(true),
});

export const consignmentSchema = z.object({
  kind: z.literal('consignacion'),
  name: z.string().trim().min(2, 'Escribe tu nombre.').max(100),
  phone,
  vehicleType: z.enum(['moto', 'carro']),
  brand: z.string().trim().min(2, 'Escribe la marca.').max(60),
  model: z.string().trim().min(1, 'Escribe el modelo.').max(80),
  year: z.number().int().min(1950, 'Revisa el año.').max(2050, 'Revisa el año.'),
  city: z.string().trim().min(2, 'Escribe la ciudad.').max(80),
  acceptedPrivacy: z.literal(true),
});

export const commercialLeadSchema = z.discriminatedUnion('kind', [directPurchaseSchema, consignmentSchema]);

export type DirectPurchasePayload = z.infer<typeof directPurchaseSchema>;
export type ConsignmentPayload = z.infer<typeof consignmentSchema>;
export type CommercialLeadPayload = z.infer<typeof commercialLeadSchema>;

export function directPurchaseSheet(d: DirectPurchasePayload): string {
  const lines = [
    `Ficha técnica - ${d.vehicleType === 'moto' ? 'Moto' : 'Carro'}`,
    `Marca: ${d.brand}`,
    `Modelo (año): ${d.year}`,
    `Referencia/versión: ${d.version}`,
    `Caja: ${d.transmission === 'automatico' ? 'Automática' : 'Mecánica'}`,
    ...(d.traction ? [`Tracción: ${d.traction}`] : []),
    `Kilometraje: ${d.mileage.toLocaleString('es-CO')} km`,
    `Color: ${d.color}`,
    `Ciudad: ${d.city}`,
    `Placa: ${d.plate}`,
    `SOAT y Tecno al día: ${d.documentsUpToDate ? 'Sí' : 'No'}`,
    `Prenda bancaria: ${d.hasLien ? 'Sí' : 'No'}`,
    `Expectativa de precio: ${d.askingPrice ? formatCOP(d.askingPrice) : 'A convenir'}`,
    `Fotos cargadas: ${d.photoUrls.length}`,
  ];
  return lines.join('\n');
}
