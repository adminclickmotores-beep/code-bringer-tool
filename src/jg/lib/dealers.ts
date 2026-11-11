import { useEffect, useState } from 'react';
import { supabase, normalizeVehicle, type Vehicle } from '@/jg/lib/supabase';
import { SITE_URL } from '@/lib/seo';

export type DealerProfile = {
  id: string;
  user_id: string;
  business_name: string;
  slug: string;
  phone: string;
  city: string | null;
  description: string | null;
  created_at: string;
};

export type DealerProfileInput = {
  business_name: string;
  phone: string;
  city: string;
  description: string;
};

export type DealerVehicleInput = {
  type: 'moto' | 'carro';
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel: string;
  transmission: string;
  ciudad: string;
  description: string;
  image_urls: string[];
};

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

export function dealerCatalogUrl(slug: string): string {
  return `${SITE_URL}/tienda/${slug}`;
}

export async function fetchDealerBySlug(slug: string): Promise<DealerProfile | null> {
  const { data, error } = await supabase.from('dealer_profiles').select('*').eq('slug', slug).maybeSingle();
  if (error) throw error;
  return (data as DealerProfile | null) ?? null;
}

export async function fetchMyDealer(userId: string): Promise<DealerProfile | null> {
  const { data, error } = await supabase.from('dealer_profiles').select('*').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return (data as DealerProfile | null) ?? null;
}

export async function createDealer(userId: string, input: DealerProfileInput): Promise<DealerProfile> {
  const base = slugify(input.business_name) || 'compraventa';
  for (let intento = 0; intento < 5; intento++) {
    const slug = intento === 0 ? base : `${base}-${Math.floor(100 + Math.random() * 900)}`;
    const { data, error } = await supabase
      .from('dealer_profiles')
      .insert({
        user_id: userId,
        business_name: input.business_name.trim(),
        slug,
        phone: input.phone,
        city: input.city.trim() || null,
        description: input.description.trim() || null,
      })
      .select('*')
      .single();
    if (!error) return data as DealerProfile;
    if ((error as { code?: string }).code !== '23505') throw error;
    // 23505 = el enlace ya existe; si el usuario ya tiene perfil se avisa abajo
    const existente = await fetchMyDealer(userId);
    if (existente) return existente;
  }
  throw new Error('No pudimos crear el enlace de tu catálogo. Intenta con otro nombre de negocio.');
}

export async function updateDealer(id: string, input: DealerProfileInput): Promise<DealerProfile> {
  const { data, error } = await supabase
    .from('dealer_profiles')
    .update({
      business_name: input.business_name.trim(),
      phone: input.phone,
      city: input.city.trim() || null,
      description: input.description.trim() || null,
    })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as DealerProfile;
}

export async function fetchDealerVehicles(dealerId: string): Promise<Vehicle[]> {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('dealer_id', dealerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return ((data as Vehicle[] | null) ?? []).map(normalizeVehicle);
}

export async function publishDealerVehicle(dealer: DealerProfile, v: DealerVehicleInput): Promise<void> {
  const { error } = await supabase.from('vehicles').insert({
    title: `${v.brand.trim()} ${v.model.trim()} ${v.year}`,
    type: v.type,
    brand: v.brand.trim(),
    model: v.model.trim(),
    year: v.year,
    price: v.price,
    mileage: v.mileage,
    fuel: v.fuel,
    transmission: v.transmission || null,
    ciudad: v.ciudad.trim() || dealer.city,
    description: v.description.trim() || null,
    image_urls: v.image_urls,
    status: 'disponible',
    listing_owner: 'tercero',
    internal_status: 'propio',
    consignado: false,
    featured: false,
    owner_name: dealer.business_name,
    owner_phone: dealer.phone,
    dealer_id: dealer.id,
  });
  if (error) throw error;
}

export async function setDealerVehicleStatus(id: string, status: 'disponible' | 'vendido'): Promise<void> {
  const { error } = await supabase.from('vehicles').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function deleteDealerVehicle(id: string): Promise<void> {
  const { error } = await supabase.from('vehicles').delete().eq('id', id);
  if (error) throw error;
}

/** true si la cuenta es de una compraventa; null mientras se consulta. */
export function useEsCompraventa(userId: string | null): boolean | null {
  const [valor, setValor] = useState<boolean | null>(null);
  useEffect(() => {
    if (!userId) {
      setValor(false);
      return;
    }
    let vivo = true;
    setValor(null);
    void supabase
      .from('dealer_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }: { data: unknown }) => {
        if (vivo) setValor(Boolean(data));
      });
    return () => {
      vivo = false;
    };
  }, [userId]);
  return valor;
}
