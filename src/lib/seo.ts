import { useEffect } from 'react';

export const SITE_NAME = 'ClickMotores';
export const SITE_URL = 'https://clickmotores.lovable.app';

export const OG_IMAGE = `${SITE_URL}/og-image.svg`;

export interface SeoData {
  title: string;
  description: string;
}

const DEFAULT_SEO: SeoData = {
  title: 'ClickMotores | Compra y Vende Carros y Motos Usados en Colombia',
  description:
    'Compra, vende o consigna tu carro o moto en Colombia. Vehículos verificados, financiación, SOAT y traspaso. Publica gratis 20 días. Cali y Yumbo.',
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
  '/compraventas': {
    title: 'Publica gratis tus carros y comparte tu catálogo | Compra-Venta | ClickMotores',
    description:
      'Compra-Venta: publica tus vehículos gratis en ClickMotores con el nombre de tu negocio y comparte tu propio catálogo con tus clientes.',
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
  if (path.startsWith('/tienda/')) {
    return {
      title: 'Catálogo de vehículos de compraventa | ClickMotores',
      description: 'Catálogo de carros y motos de una compraventa aliada, publicado en ClickMotores.',
    };
  }
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

const KEYWORDS =
  'comprar carro usado Colombia, vender carro, vender moto, motos usadas Cali, carros usados Cali, consignación de vehículos, compraventa de carros, financiación de vehículos, SOAT, traspaso de vehículos, ClickMotores, JG Motors, Yumbo';

export const FAQ_HOME: { q: string; a: string }[] = [
  {
    q: '¿Qué es ClickMotores?',
    a: 'ClickMotores es una vitrina virtual de carros y motos usados en Colombia, operada por JG Motors desde Yumbo, Valle del Cauca. Aquí compras, vendes o financias tu vehículo con acompañamiento.',
  },
  {
    q: '¿Cuánto cuesta publicar mi vehículo?',
    a: 'Publicar tu vehículo es gratis durante 20 días. Después puedes elegir un plan desde $20.000, $35.000 o $50.000 para mantenerlo visible.',
  },
  {
    q: '¿Cómo funciona la consignación?',
    a: 'Dejas tu carro o moto con nosotros y nos encargamos de promocionarlo y venderlo. Se paga una pauta de $100.000 más una comisión del 3% en carros o del 5% en motos, solo cuando se vende.',
  },
  {
    q: '¿Puedo financiar un vehículo?',
    a: 'Sí. Te ayudamos a simular tu crédito con entidades aliadas para que compres tu carro o moto con cuotas que se ajusten a tu presupuesto.',
  },
  {
    q: '¿Cómo los contacto?',
    a: 'Escríbenos por WhatsApp al +57 333 276 5584 o visítanos en Yumbo, Valle del Cauca.',
  },
];

function businessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    '@id': `${SITE_URL}/#negocio`,
    name: SITE_NAME,
    alternateName: 'JG Motors',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.svg`,
    image: OG_IMAGE,
    description: DEFAULT_SEO.description,
    telephone: '+573332765584',
    priceRange: '$$',
    areaServed: { '@type': 'Country', name: 'Colombia' },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Yumbo',
      addressRegion: 'Valle del Cauca',
      addressCountry: 'CO',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+573332765584',
      contactType: 'customer service',
      availableLanguage: 'Spanish',
    },
  };
}

function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: 'es-CO',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/catalogo`,
      'query-input': 'required name=search_term_string',
    },
  };
}

function faqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_HOME.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

function breadcrumbJsonLd(path: string, title: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: title.split('|')[0]?.trim() ?? title, item: `${SITE_URL}${path}` },
    ],
  };
}

/** Metadatos de una ruta para el `head()` de TanStack Router (SSR + navegación). */
export function routeHead(path: string, opts?: { noindex?: boolean }) {
  const { title, description } = pageSeo(path);
  const url = `${SITE_URL}${path}`;
  const meta: Record<string, string>[] = [
    { title },
    { name: 'description', content: description },
    { name: 'keywords', content: KEYWORDS },
    { name: 'robots', content: opts?.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: url },
    { property: 'og:locale', content: 'es_CO' },
    { property: 'og:site_name', content: SITE_NAME },
    { property: 'og:image', content: OG_IMAGE },
    { property: 'og:image:alt', content: 'ClickMotores: carros y motos verificados en Colombia' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: OG_IMAGE },
  ];
  const scripts: { type: string; children: string }[] = [];
  if (!opts?.noindex) {
    if (path === '/') {
      scripts.push(
        { type: 'application/ld+json', children: JSON.stringify(businessJsonLd()) },
        { type: 'application/ld+json', children: JSON.stringify(websiteJsonLd()) },
        { type: 'application/ld+json', children: JSON.stringify(faqJsonLd()) },
      );
    } else {
      scripts.push({ type: 'application/ld+json', children: JSON.stringify(breadcrumbJsonLd(path, title)) });
    }
  }
  return { meta, links: [{ rel: 'canonical', href: url }], scripts };
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
    upsertMeta('property', 'og:image', OG_IMAGE);
    upsertMeta('name', 'twitter:image', OG_IMAGE);
    upsertCanonical(url);
  }, [path]);
}
