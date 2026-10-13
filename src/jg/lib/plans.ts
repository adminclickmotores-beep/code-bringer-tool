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

export const EXPIRING_SOON_DAYS = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

export function normalizePlate(plate: string): string {
  return plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export type ListingStatus = 'permanente' | 'activo' | 'por_vencer' | 'expirado';

export function listingStatus(
  v: { listing_owner?: string | null; expires_at?: string | null },
  now: Date = new Date(),
): ListingStatus {
  if (v.listing_owner !== 'tercero' || !v.expires_at) return 'permanente';
  const left = new Date(v.expires_at).getTime() - now.getTime();
  if (left <= 0) return 'expirado';
  if (left <= EXPIRING_SOON_DAYS * DAY_MS) return 'por_vencer';
  return 'activo';
}

/** New expiry = max(now, current expiry) + plan days. */
export function renewedExpiry(current: string | null, days: number, now: Date = new Date()): Date {
  const base = Math.max(now.getTime(), current ? new Date(current).getTime() : 0);
  return new Date(base + days * DAY_MS);
}

export const PLATE_USED_MESSAGE =
  'Esta placa ya usó su periodo gratuito. Para volver a publicarla elige un plan (desde $20.000 COP).';
