import { describe, expect, it } from 'vitest';
import { meetsPhotoResolution, minimumPhotos, vehicleSubmissionSchema } from '@/jg/lib/vehicle-submission';

const base = {
  saleMode: 'publicar_gratis' as const,
  name: 'Persona de prueba', phone: '300 123 4567', vehicleType: 'moto' as const,
  brand: 'Yamaha', model: 'FZ', year: 2024, displacement: '150cc', mileage: 1000,
  city: 'Cali', plate: 'ABC12D', condition: 'Bueno', askingPrice: 10_000_000,
  description: '', propertyCardPaths: [
    'property-cards/123e4567-e89b-12d3-a456-426614174000/front-123e4567-e89b-12d3-a456-426614174001.jpg',
    'property-cards/123e4567-e89b-12d3-a456-426614174000/back-123e4567-e89b-12d3-a456-426614174002.jpg',
  ] as const,
  acceptedPrivacy: true as const,
};

describe('reglas de fotos del formulario', () => {
  it('exige mínimo 4 fotos para motos', () => {
    expect(minimumPhotos('moto')).toBe(4);
    expect(vehicleSubmissionSchema.safeParse({ ...base, photoUrls: ['https://x.co/1', 'https://x.co/2'] }).success).toBe(false);
  });

  it('exige mínimo 5 fotos para carros', () => {
    expect(minimumPhotos('carro')).toBe(5);
    expect(vehicleSubmissionSchema.safeParse({ ...base, vehicleType: 'carro', photoUrls: ['https://x.co/1', 'https://x.co/2', 'https://x.co/3', 'https://x.co/4'] }).success).toBe(false);
  });

  it('acepta máximo 8 fotos y rechaza 9', () => {
    const photos = Array.from({ length: 8 }, (_, index) => `https://x.co/${index}`);
    expect(vehicleSubmissionSchema.safeParse({ ...base, photoUrls: photos }).success).toBe(true);
    expect(vehicleSubmissionSchema.safeParse({ ...base, photoUrls: [...photos, 'https://x.co/9'] }).success).toBe(false);
  });

  it('exige frente y reverso dentro de la misma carpeta privada', () => {
    const wrongBack = 'property-cards/123e4567-e89b-12d3-a456-426614174999/back-123e4567-e89b-12d3-a456-426614174002.jpg';
    expect(vehicleSubmissionSchema.safeParse({ ...base, photoUrls: ['https://x.co/1', 'https://x.co/2', 'https://x.co/3'], propertyCardPaths: [base.propertyCardPaths[0], wrongBack] }).success).toBe(false);
  });
});
describe('resolución mínima de fotos', () => {
  it('acepta 1200x800 y rechaza 1199x800', () => {
    expect(meetsPhotoResolution(1200, 800)).toBe(true);
    expect(meetsPhotoResolution(800, 1200)).toBe(true);
    expect(meetsPhotoResolution(1199, 800)).toBe(false);
    expect(meetsPhotoResolution(1200, 799)).toBe(false);
  });
});
