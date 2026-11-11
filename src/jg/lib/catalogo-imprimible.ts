import { formatCOP, type Vehicle } from '@/jg/lib/supabase';
import { catalogRank } from '@/jg/lib/plans';

export type OpcionesCatalogo = {
  titulo: string;
  subtitulo?: string;
  logoUrl?: string | null;
  contacto?: string;
  ciudad?: string | null;
  vehiculos: Vehicle[];
};

const MAPA_HTML: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

function esc(valor: unknown): string {
  return String(valor ?? '').replace(/[&<>"']/g, (c) => MAPA_HTML[c] ?? c);
}

function urlSegura(url: string | null | undefined): string {
  return url && /^https?:\/\//i.test(url) ? esc(url) : '';
}

function etiquetaEstado(v: Vehicle): string {
  if (v.status === 'vendido') return 'Vendido';
  if (v.status === 'no_disponible') return 'No disponible';
  if (catalogRank(v) === 2) return 'Anuncio vencido';
  return 'Disponible';
}

function fichaTecnica(v: Vehicle): Array<[string, string]> {
  const filas: Array<[string, string | null]> = [
    ['Tipo', v.type === 'moto' ? 'Moto' : 'Carro'],
    ['Marca', v.brand || null],
    ['Modelo', v.model || null],
    ['Año', v.year ? String(v.year) : null],
    ['Kilometraje', v.mileage != null ? `${Number(v.mileage).toLocaleString('es-CO')} km` : null],
    ['Cilindraje', v.displacement ? String(v.displacement) : null],
    ['Combustible', v.fuel || null],
    ['Transmisión', v.transmission || null],
    ['Ciudad', v.ciudad || null],
  ];
  return filas.filter((f): f is [string, string] => Boolean(f[1]));
}

function tarjeta(v: Vehicle): string {
  const fotos = (v.image_urls ?? []).map(urlSegura).filter(Boolean);
  const principal = fotos[0];
  const miniaturas = fotos.slice(1, 4);
  const disponible = catalogRank(v) === 0;
  const filas = fichaTecnica(v)
    .map(([k, val]) => `<tr><th>${esc(k)}</th><td>${esc(val)}</td></tr>`)
    .join('');
  const descripcion = v.description ? `<p class="desc">${esc(v.description).slice(0, 420)}</p>` : '';
  return `
  <article class="tarjeta ${disponible ? '' : 'apagada'}">
    <div class="foto">
      ${principal ? `<img src="${principal}" alt="${esc(v.title)}" />` : '<div class="sinfoto">Sin foto</div>'}
      <span class="estado ${disponible ? 'ok' : 'no'}">${esc(etiquetaEstado(v))}</span>
    </div>
    ${miniaturas.length ? `<div class="minis">${miniaturas.map((m) => `<img src="${m}" alt="" />`).join('')}</div>` : ''}
    <div class="cuerpo">
      <h3>${esc(v.title)}</h3>
      <p class="precio">${esc(formatCOP(v.price))}</p>
      <table>${filas}</table>
      ${descripcion}
    </div>
  </article>`;
}

function seccion(titulo: string, lista: Vehicle[]): string {
  if (lista.length === 0) return '';
  return `<section><h2>${esc(titulo)} <span>${lista.length}</span></h2><div class="grilla">${lista.map(tarjeta).join('')}</div></section>`;
}

export function generarHtmlCatalogo(o: OpcionesCatalogo): string {
  const ordenados = [...o.vehiculos].sort((a, b) => catalogRank(a) - catalogRank(b));
  const disponibles = ordenados.filter((v) => catalogRank(v) === 0);
  const otros = ordenados.filter((v) => catalogRank(v) !== 0);
  const logo = urlSegura(o.logoUrl);
  const fecha = new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(o.titulo)} | Catálogo</title>
<style>
  @page { size: A4; margin: 12mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: 'Helvetica Neue', Arial, sans-serif; color: #111; background: #f4f4f5; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .barra { position: sticky; top: 0; z-index: 5; display: flex; gap: 12px; align-items: center; justify-content: space-between; padding: 12px 20px; background: #111; color: #fff; font-size: 14px; }
  .barra button { background: #e11d2e; color: #fff; border: 0; border-radius: 8px; padding: 10px 18px; font-size: 15px; font-weight: 700; cursor: pointer; }
  .pagina { max-width: 1000px; margin: 0 auto; padding: 24px 20px 48px; }
  header.portada { display: flex; align-items: center; gap: 20px; padding: 24px; border-radius: 16px; background: #111; color: #fff; margin-bottom: 28px; border-bottom: 5px solid #e11d2e; }
  header.portada img { height: 72px; max-width: 180px; object-fit: contain; background: #fff; border-radius: 10px; padding: 6px; }
  header.portada h1 { margin: 0; font-size: 28px; line-height: 1.15; }
  header.portada p { margin: 4px 0 0; font-size: 13px; color: #d4d4d8; }
  section h2 { font-size: 20px; margin: 28px 0 14px; padding-bottom: 8px; border-bottom: 2px solid #e11d2e; display: flex; align-items: center; gap: 10px; }
  section h2 span { font-size: 12px; background: #e11d2e; color: #fff; border-radius: 99px; padding: 2px 10px; }
  .grilla { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
  .tarjeta { background: #fff; border-radius: 14px; overflow: hidden; border: 1px solid #e4e4e7; break-inside: avoid; page-break-inside: avoid; }
  .tarjeta.apagada .foto img, .tarjeta.apagada .minis img { filter: grayscale(1); opacity: .6; }
  .foto { position: relative; aspect-ratio: 4 / 3; background: #e4e4e7; }
  .foto img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .sinfoto { display: flex; height: 100%; align-items: center; justify-content: center; color: #71717a; }
  .estado { position: absolute; top: 10px; left: 10px; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 99px; color: #fff; }
  .estado.ok { background: #16a34a; } .estado.no { background: #52525b; }
  .minis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; background: #fff; }
  .minis img { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; display: block; }
  .cuerpo { padding: 14px 16px 16px; }
  .cuerpo h3 { margin: 0; font-size: 17px; }
  .precio { margin: 4px 0 10px; font-size: 22px; font-weight: 800; color: #e11d2e; }
  table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
  th { text-align: left; font-weight: 600; color: #52525b; padding: 4px 0; width: 38%; }
  td { padding: 4px 0; text-align: right; font-weight: 600; }
  tr + tr { border-top: 1px solid #f0f0f2; }
  .desc { margin: 10px 0 0; font-size: 12px; line-height: 1.5; color: #3f3f46; }
  footer { margin-top: 32px; text-align: center; font-size: 12px; color: #71717a; }
  @media (max-width: 640px) { .grilla { grid-template-columns: 1fr; } header.portada { flex-direction: column; align-items: flex-start; } }
  @media print { body { background: #fff; } .barra { display: none; } .pagina { padding: 0; max-width: none; } .grilla { grid-template-columns: repeat(2, 1fr); } }
</style></head>
<body>
  <div class="barra"><span>Vista previa del catálogo. Para guardarlo como PDF elige "Guardar como PDF".</span><button onclick="window.print()">Descargar / Imprimir PDF</button></div>
  <div class="pagina">
    <header class="portada">
      ${logo ? `<img src="${logo}" alt="Logo" />` : ''}
      <div>
        <h1>${esc(o.titulo)}</h1>
        <p>${esc(o.subtitulo ?? 'Catálogo de vehículos')}${o.ciudad ? ` · ${esc(o.ciudad)}` : ''}</p>
        ${o.contacto ? `<p>WhatsApp: ${esc(o.contacto)}</p>` : ''}
        <p>Actualizado el ${esc(fecha)}</p>
      </div>
    </header>
    ${seccion('Disponibles', disponibles)}
    ${seccion('No disponibles y vendidos', otros)}
    <footer>Catálogo generado en ClickMotores. Precios y disponibilidad sujetos a cambio sin previo aviso.</footer>
  </div>
</body></html>`;
}

/** Abre el catálogo en una pestaña nueva, listo para imprimir o guardar como PDF. */
export function abrirCatalogoImprimible(o: OpcionesCatalogo): boolean {
  const ventana = window.open('', '_blank');
  if (!ventana) return false;
  ventana.document.open();
  ventana.document.write(generarHtmlCatalogo(o));
  ventana.document.close();
  return true;
}
