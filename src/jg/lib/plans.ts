export const FREE_PUBLICATION_DAYS = 20;

export type PlanId = 'renovacion_simple' | 'destacado_30' | 'destacado_90';

export interface PublicationPlan {
  id: PlanId;
  name: string;
  days: number;
  price: number;
  featured: boolean;
}

export const PUBLICATION_PLANS: PublicationPlan[] = [
  { id: 'renovacion_simple', name: 'Renovación Simple', days: 30, price: 20000, featured: false },
  { id: 'destacado_30', name: 'Plan Destacado', days: 30, price: 35000, featured: true },
  { id: 'destacado_90', name: 'Trimestral Destacado', days: 90, price: 50000, featured: true },
];

export const PAYMENT_METHODS = [
  { label: 'Breve', value: '@1130674978' },
  { label: 'Nequi / Daviplata', value: '3332765584' },
];

export const PAYMENT_HOLDER = 'Jhonathan González Cortés - Representante Legal';

export function planWhatsappMessage(plan: PublicationPlan, owner = '', plate = ''): string {
  return [
    'Hola ClickMotores, quiero activar un plan de publicación.',
    `Plan: ${plan.name} (${plan.days} días) - $${plan.price.toLocaleString('es-CO')} COP`,
    `Nombre del propietario: ${owner || '________'}`,
    `Placa: ${plate || '________'}`,
    `Adjunto el comprobante de transferencia a nombre de ${PAYMENT_HOLDER}.`,
  ].join('\n');
}
