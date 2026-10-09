import { describe, expect, it } from 'vitest';
import { minimumPhotos, vehicleSubmissionSchema } from '@/jg/lib/vehicle-submission';

const base = {
  saleMode: 'publicar_gratis' as const,
  name: 'Persona de prueba', phone: '300 123 4567', vehicleType: 'moto' as const,
  brand: 'Yamaha', model: 'FZ', year: 2024, displacement: '150cc', mileage: 1000,
  city: 'Cali', plate: 'ABC12D', condition: 'Bueno', askingPrice: 10_000_000,
  description: '', propertyCardPaths: ['property-cards/front.jpg', 'property-cards/back.jpg'],
  acceptedPrivacy: true as const,
};

describe('reglas de fotos del formulario', () => {
  it('exige mínimo 3 fotos para motos', () => {
    expect(minimumPhotos('moto')).toBe(3);
    expect(vehicleSubmissionSchema.safeParse({ ...base, photoUrls: ['https://x.co/1', 'https://x.co/2'] }).success).toBe(false);
  });

  it('exige mínimo 5 fotos para carros', () => {
    expect(minimumPhotos('carro')).toBe(5);
    expect(vehicleSubmissionSchema.safeParse({ ...base, vehicleType: 'carro', photoUrls: ['https://x.co/1', 'https://x.co/2', 'https://x.co/3', 'https://x.co/4'] }).success).toBe(false);
  });
});