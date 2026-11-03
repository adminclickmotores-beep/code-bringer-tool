import { formatCOP, type Vehicle } from '@/jg/lib/supabase';

/** Enlace directo a la ficha del vehículo (abre el catálogo con el modal). */
export function enlaceVehiculo(id: string): string {
  const base =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://clickmotores.lovable.app';
  return `${base}/catalogo?vehiculo=${encodeURIComponent(id)}`;
}

export function textoCompartir(vehicle: Vehicle): string {
  return `${vehicle.title} · ${formatCOP(vehicle.price)} · ClickMotores`;
}

type ResultadoCompartir = 'compartido' | 'copiado' | 'error';

/**
 * Comparte un vehículo: usa el menú nativo del celular/computador cuando
 * existe (WhatsApp, Facebook, etc.) y si no, copia el enlace al portapapeles.
 */
export async function compartirVehiculo(
  vehicle: Vehicle,
): Promise<ResultadoCompartir> {
  const url = enlaceVehiculo(String(vehicle.id));
  const texto = `${textoCompartir(vehicle)}\n${url}`;
  const nav = navigator as Navigator & {
    share?: (data: { title?: string; text?: string; url?: string }) => Promise<void>;
  };

  if (typeof nav.share === 'function') {
    try {
      await nav.share({ title: vehicle.title, text: textoCompartir(vehicle), url });
      return 'compartido';
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return 'compartido';
      }
    }
  }

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(texto);
      return 'copiado';
    }
  } catch {
    /* intenta el método alternativo */
  }

  try {
    const area = document.createElement('textarea');
    area.value = texto;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    document.body.removeChild(area);
    return 'copiado';
  } catch {
    return 'error';
  }
}
