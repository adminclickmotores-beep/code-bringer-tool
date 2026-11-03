import { supabase as typedClient } from '@/integrations/supabase/client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = typedClient as any;
const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

export type Vehicle = {
  id: string;
  title: string;
  type: 'moto' | 'carro';
  brand: string;
  model: string;
  year: number;
  displacement: string | null;
  price: number;
  status: 'disponible' | 'no_disponible' | 'vendido' | 'aliado';
  description: string | null;
  image_urls: string[];
  mileage: number | null;
  transmission: string | null;
  fuel: string | null;
  featured: boolean;
  created_at: string;
  tag: 'recien_ingresado' | 'precio_rebajado' | 'separado' | 'vendido' | null;
  instagram_url: string | null;
  consignado: boolean;
  original_price: number | null;
  placa_completa: string | null;
  ciudad: string | null;
  property_card_urls: string[] | null;
  listing_owner?: 'jg' | 'tercero' | null;
  expires_at?: string | null;
  featured_until?: string | null;
  plan_type?: string | null;
  internal_status?: 'reservado' | 'propio' | 'consignacion' | 'retirado' | null;
  owner_name?: string | null;
  owner_phone?: string | null;
  ally_name?: string | null;
};

export type VehicleInput = Omit<Vehicle, 'id' | 'created_at'>;

export type VehicleAdminInput = Pick<
  Vehicle,
  'title' | 'type' | 'brand' | 'model' | 'year' | 'price' | 'status'
> &
  Partial<
    Omit<
      Vehicle,
      'id' | 'created_at' | 'title' | 'type' | 'brand' | 'model' | 'year' | 'price' | 'status'
    >
  >;

export type VehicleSubmission = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  vehicle_type: 'moto' | 'carro';
  brand: string;
  model: string;
  year: number | null;
  displacement: string | null;
  mileage: number | null;
  condition: string | null;
  asking_price: number | null;
  description: string | null;
  image_urls: string[];
  instagram_url: string | null;
  status: 'pendiente' | 'aprobado' | 'rechazado';
  created_at: string;
  placa_completa: string | null;
  ciudad: string | null;
  property_card_urls: string[] | null;
  modalidad: string | null;
};

export type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  related_id: string | null;
  created_at: string;
};

export type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  vehicle_type: 'moto' | 'carro';
  mode: 'compra_directa' | 'consignacion';
  brand: string;
  model: string;
  year: number | null;
  displacement: string | null;
  mileage: number | null;
  condition: string | null;
  asking_price: number | null;
  description: string | null;
  image_urls: string[];
  instagram_url: string | null;
  status: 'nuevo_lead' | 'en_negociacion' | 'cita_inspeccion' | 'aprobado' | 'descartado';
  notes: string | null;
  created_at: string;
  placa_completa: string | null;
  ciudad: string | null;
  property_card_urls: string[] | null;
  modalidad: string | null;
};

export type Consulta = {
  id: string;
  type: 'whatsapp_click' | 'retoma' | 'cotizacion_tramite' | 'cita' | 'cotizacion_seguro';
  vehicle_title: string | null;
  contact: string | null;
  notes: string | null;
  created_at: string;
};

export type Sale = {
  id: string;
  vehicle_title: string;
  sale_type: 'directa' | 'consignacion';
  sale_price: number;
  commission_amount: number;
  commission_rate: number;
  tramites_income: number;
  net_income: number;
  sale_date: string;
  created_at: string;
};

export const WHATSAPP_NUMBER = '573332765584';
export const WHATSAPP_DISPLAY = '+57 333 276 5584';
export const FACEBOOK_URL = 'https://www.facebook.com/share/1EeoLKUdhk/';
export const INSTAGRAM_URL = 'https://www.instagram.com/jgmotors_co/';
export const INSTAGRAM_HANDLE = '@jgmotors_co';

export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/** Normaliza un teléfono colombiano a formato wa.me (57 + 10 dígitos). */
export function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `57${digits}`;
  if (digits.length === 12 && digits.startsWith('57')) return digits;
  return null;
}

export function whatsappLinkTo(phone: string | null | undefined, message: string): string {
  const target = normalizePhone(phone) ?? WHATSAPP_NUMBER;
  return `https://wa.me/${target}?text=${encodeURIComponent(message)}`;
}

export function formatCOP(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function maskPlaca(placa: string | null): string {
  if (!placa) return 'N/A';
  const trimmed = placa.trim();
  if (trimmed.length === 0) return 'N/A';
  const last = trimmed.slice(-1).toUpperCase();
  return `Placa terminada en: ${last}`;
}

export const STATUS_CONFIG: Record<
  Vehicle['status'],
  { label: string; class: string; dot: string }
> = {
  disponible: {
    label: 'Disponible',
    class: 'bg-green-500/15 text-green-700 border border-green-500/30',
    dot: 'bg-green-500',
  },
  no_disponible: {
    label: 'No disponible',
    class: 'bg-yellow-500/15 text-yellow-700 border border-yellow-500/30',
    dot: 'bg-yellow-500',
  },
  vendido: {
    label: 'Vendido',
    class: 'bg-gray-500/15 text-gray-300 border border-gray-500/30',
    dot: 'bg-gray-500',
  },
  aliado: {
    label: 'Aliado',
    class: 'bg-blue-500/15 text-blue-700 border border-blue-500/30',
    dot: 'bg-blue-500',
  },
};

export const TAG_CONFIG: Record<
  NonNullable<Vehicle['tag']>,
  { label: string; class: string }
> = {
  recien_ingresado: {
    label: 'Recién Ingresado',
    class: 'bg-blue-500/90 text-white',
  },
  precio_rebajado: {
    label: 'Precio Rebajado',
    class: 'bg-jg-red/90 text-white',
  },
  separado: {
    label: 'Separado',
    class: 'bg-yellow-500/90 text-black',
  },
  vendido: {
    label: 'Vendido',
    class: 'bg-gray-700/90 text-white',
  },
};

/** Opciones de combustible según el tipo de vehículo. */
export function fuelOptions(type: 'moto' | 'carro'): string[] {
  return type === 'moto'
    ? ['Gasolina', 'Eléctrico']
    : ['Gasolina', 'Diésel', 'Eléctrico', 'Híbrido', 'Gasolina / gas', 'Otro'];
}

const WATERMARK_TEXT = 'ClickMotores';

function loadImageSource(file: File): Promise<CanvasImageSource & { width: number; height: number; close?: () => void }> {
  if (typeof createImageBitmap === 'function') {
    return createImageBitmap(file);
  }
  const url = URL.createObjectURL(file);
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('No se pudo leer la imagen.'));
    };
    image.src = url;
  });
}

/** Dibuja la marca de agua "ClickMotores" sobre la foto y devuelve un File listo para subir. */
async function withClickMotoresWatermark(file: File): Promise<File> {
  try {
    const source = await loadImageSource(file);
    const width = source.width as number;
    const height = source.height as number;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(source, 0, 0);
    if (typeof source.close === 'function') source.close();

    const fontSize = Math.max(18, Math.round(width * 0.055));
    ctx.font = `800 ${fontSize}px 'Plus Jakarta Sans', Arial, sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    const x = width - Math.round(width * 0.03);
    const y = height - Math.round(height * 0.035);
    ctx.globalAlpha = 0.8;
    ctx.lineWidth = Math.max(2, Math.round(fontSize * 0.12));
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.strokeText(WATERMARK_TEXT, x, y);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText(WATERMARK_TEXT, x, y);
    ctx.globalAlpha = 1;

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.92),
    );
    if (!blob) return file;
    const base = file.name.replace(/\.[a-z0-9]+$/i, '') || 'foto';
    return new File([blob], `${base}.jpg`, { type: 'image/jpeg' });
  } catch {
    return file;
  }
}

export async function uploadVehiclePhoto(file: File): Promise<string> {
  const watermarked = await withClickMotoresWatermark(file);
  const ext = watermarked.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from('vehicle-photos')
    .upload(fileName, watermarked, { cacheControl: '3600', upsert: false });
  if (uploadError) throw uploadError;

  const { data, error: urlError } = await supabase.storage
    .from('vehicle-photos')
    .createSignedUrl(fileName, TEN_YEARS);
  if (urlError) throw urlError;
  if (!data?.signedUrl) {
    throw new Error('Supabase no devolvió la dirección de la fotografía.');
  }

  return data.signedUrl;
}

export async function uploadPropertyCard(
  file: File,
  uploadGroupId: string,
  side: 'front' | 'back',
): Promise<string | null> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${uploadGroupId}/${side}-${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from('property-cards')
    .upload(fileName, file, { cacheControl: '3600', upsert: false });
  if (error) return null;
  return `property-cards/${fileName}`;
}

export async function logConsulta(
  type: Consulta['type'],
  vehicleTitle?: string,
  contact?: string,
  notes?: string
): Promise<void> {
  await supabase.from('consultas').insert({
    type,
    vehicle_title: vehicleTitle || null,
    contact: contact || null,
    notes: notes || null,
  });
}
