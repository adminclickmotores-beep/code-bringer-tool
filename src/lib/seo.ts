import { useEffect } from 'react';

export const SITE_NAME = 'ClickMotores';
export const SITE_URL = 'https://clickmotores.lovable.app';

export interface SeoData {
  title: string;
  description: string;
}

const DEFAULT_SEO: SeoData = {
  title: 'ClickMotores | Consignación y Venta Profesional de Motos y Carros en Colombia',
  description:
    'Compra y vende carros y motos multimarca 100% verificados en Colombia. Consignación profesional, financiación, SOAT y traspaso legal garantizado.',
};

export const PAGE_SEO: Record<string, SeoData> = {
  '/': DEFAULT_SEO,
  '/catalogo': {
    title: 'Inventario de Carros y Motos Verificados | ClickMotores',
    description:
      'Explora el inventario de ClickMotores: carros y motos multimarca verificados, con fotos reales, precios transparentes e historial legal.',
  },
  '/vender': {
    title: 'Vende tu Carro o Moto | Consignación y Compra Directa | ClickMotores',
    description:
      'Vende tu vehículo en Colombia: publicación gratis, compra directa de contado o consignación profesional con ClickMotores.',
  },
  '/financiacion': {
    title: 'Financiación de Carros y Motos en Colombia | ClickMotores',
    description:
      'Simula tu crédito y financia tu carro o moto con las principales entidades aliadas de ClickMotores en Colombia.',
  },
  '/contacto': {
    title: 'Contacto y WhatsApp | ClickMotores Colombia',
    description:
      'Habla con ClickMotores por WhatsApp o visítanos en Yumbo, Valle del Cauca. Asesoría para comprar, vender o financiar tu vehículo.',
  },
  '/terminos': {
    title: 'Términos y Condiciones | ClickMotores',
    description:
      'Términos y condiciones de la plataforma ClickMotores, operada legalmente por JG Motors.',
  },
  '/habeas-data': {
    title: 'Política de Habeas Data | ClickMotores',
    description:
      'Política de tratamiento y protección de datos personales de la plataforma ClickMotores (operada por JG Motors).',
  },
  '/admin': {
    title: 'Panel Administrativo | ClickMotores',
    description: 'Panel interno de ClickMotores para inventario, leads y ventas.',
  },
  '/cms': {
    title: 'CMS Privado | ClickMotores',
    description: 'Panel privado de ClickMotores para inventario, leads y chatbot.',
  },
  '/reset-password': {
    title: 'Restablecer contraseña | ClickMotores',
    description: 'Restablece tu contraseña del panel de ClickMotores.',
  },
};

export function pageSeo(path: string): SeoData {
  return PAGE_SEO[path] ?? DEFAULT_SEO;
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string): void {
  const selector = `meta[${attr}="${key}"]`;
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href: string): void {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/** Metadatos de una ruta para el `head()` de TanStack Router (SSR + navegación). */
export function routeHead(path: string, opts?: { noindex?: boolean }) {
  const { title, description } = pageSeo(path);
  const url = `${SITE_URL}${path}`;
  const meta: Record<string, string>[] = [
    { title },
    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: url },
    { name: 'twitter:card', content: 'summary_large_image' },
  ];
  if (opts?.noindex) meta.push({ name: 'robots', content: 'noindex' });
  return { meta, links: [{ rel: 'canonical', href: url }] };
}

/** Refuerzo en cliente: actualiza título, descripción, OG y canonical al montar la página. */
export function useSeo(path: string): void {
  useEffect(() => {
    const { title, description } = pageSeo(path);
    const url = `${SITE_URL}${path}`;
    document.title = title;
    upsertMeta('name', 'description', description);
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', url);
    upsertCanonical(url);
  }, [path]);
}
