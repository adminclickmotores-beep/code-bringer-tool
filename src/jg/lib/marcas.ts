export const MARCAS_MOTO: string[] = [
  'AKT', 'Auteco', 'Bajaj', 'Benelli', 'BMW', 'Ducati', 'Hero', 'Honda', 'Kawasaki', 'KTM',
  'Kymco', 'Pulsar', 'Royal Enfield', 'Suzuki', 'SYM', 'TVS', 'Triumph', 'Vespa', 'Victory', 'Yamaha',
];

export const MARCAS_CARRO: string[] = [
  'Audi', 'BMW', 'BYD', 'Chery', 'Chevrolet', 'Citroën', 'Dodge', 'Ford', 'Honda', 'Hyundai',
  'Jeep', 'JAC', 'Kia', 'Land Rover', 'Mazda', 'Mercedes-Benz', 'Mitsubishi', 'Nissan', 'Peugeot',
  'Renault', 'Seat', 'Skoda', 'Subaru', 'Suzuki', 'Toyota', 'Volkswagen', 'Volvo',
];

export function marcasPorTipo(tipo: 'moto' | 'carro' | 'all'): string[] {
  if (tipo === 'moto') return MARCAS_MOTO;
  if (tipo === 'carro') return MARCAS_CARRO;
  return Array.from(new Set([...MARCAS_MOTO, ...MARCAS_CARRO])).sort((a, b) => a.localeCompare(b, 'es'));
}
