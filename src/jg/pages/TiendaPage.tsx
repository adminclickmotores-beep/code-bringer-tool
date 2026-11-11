import { useEffect, useMemo, useState } from 'react';
import { Check, FileText, ImageIcon, MapPin, Search, Share2, Store } from 'lucide-react';
import { useJg } from '@/jg/JgApp';
import { GrillaPorEstado } from '@/jg/components/GrillaPorEstado';
import { abrirCatalogoImprimible } from '@/jg/lib/catalogo-imprimible';
import { catalogRank } from '@/jg/lib/plans';
import { whatsappLinkTo } from '@/jg/lib/supabase';
import { dealerCatalogUrl, fetchDealerBySlug, type DealerProfile } from '@/jg/lib/dealers';

export function TiendaPage({ slug }: { slug: string }) {
  const j = useJg();
  const [dealer, setDealer] = useState<DealerProfile | null>(null);
  const [estado, setEstado] = useState<'cargando' | 'ok' | 'noexiste'>('cargando');
  const [busqueda, setBusqueda] = useState('');
  const [tipo, setTipo] = useState<'all' | 'carro' | 'moto'>('all');
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    let vivo = true;
    setEstado('cargando');
    fetchDealerBySlug(slug)
      .then((d) => {
        if (!vivo) return;
        setDealer(d);
        setEstado(d ? 'ok' : 'noexiste');
        if (d) document.title = `${d.business_name} | Catálogo de vehículos | ClickMotores`;
      })
      .catch(() => { if (vivo) setEstado('noexiste'); });
    return () => { vivo = false; };
  }, [slug]);

  const lista = useMemo(() => {
    if (!dealer) return [];
    const q = busqueda.trim().toLowerCase();
    return j.vehicles
      .filter((v) => v.dealer_id === dealer.id)
      .filter((v) => tipo === 'all' || v.type === tipo)
      .filter((v) => !q || [v.title, v.brand, v.model, String(v.year)].join(' ').toLowerCase().includes(q))
      .sort((a, b) => catalogRank(a) - catalogRank(b));
  }, [dealer, j.vehicles, busqueda, tipo]);

  const compartir = async () => {
    if (!dealer) return;
    const url = dealerCatalogUrl(dealer.slug);
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({ title: dealer.business_name, text: `Catálogo de ${dealer.business_name}`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* el usuario canceló */
    }
  };

  if (estado === 'cargando') {
    return <div className="mx-auto max-w-7xl px-4 py-16 text-sm text-gray-400">Cargando catálogo...</div>;
  }
  if (estado === 'noexiste' || !dealer) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <Store className="h-10 w-10 text-gray-500" />
        <h1 className="mt-3 font-display text-xl font-bold text-jg-text-dark">No encontramos este catálogo</h1>
        <p className="mt-1 text-sm text-gray-400">Revisa que el enlace esté completo o mira todo el inventario.</p>
        <button onClick={() => j.navigate('catalog')} className="btn-primary mt-4">Ver inventario</button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="border-b border-jg-silver/50 bg-jg-carbon/50 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 sm:px-6 lg:px-8 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            {dealer.logo_url && (
              <img src={dealer.logo_url} alt={`Logo de ${dealer.business_name}`} className="mb-3 h-16 max-w-[12rem] rounded-lg object-contain" />
            )}
            <p className="text-xs font-semibold uppercase tracking-wide text-jg-red">Compraventa aliada</p>
            <h1 className="break-words font-display text-3xl font-bold text-jg-text-dark sm:text-4xl">{dealer.business_name}</h1>
            {dealer.city && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-400"><MapPin className="h-4 w-4" /> {dealer.city}</p>
            )}
            {dealer.description && <p className="mt-2 max-w-2xl break-words text-sm text-gray-400">{dealer.description}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={whatsappLinkTo(dealer.phone, `Hola ${dealer.business_name}, vi su catálogo en ClickMotores y quiero información.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary !py-2.5"
            >
              Escribir por WhatsApp
            </a>
            <button
              onClick={() => {
                const ok = abrirCatalogoImprimible({
                  titulo: dealer.business_name,
                  logoUrl: dealer.logo_url,
                  contacto: dealer.phone,
                  ciudad: dealer.city,
                  vehiculos: lista,
                });
                if (!ok) window.alert('Tu navegador bloqueó la ventana. Permite las ventanas emergentes e intenta de nuevo.');
              }}
              className="btn-secondary !py-2.5"
            >
              <FileText className="h-4 w-4" /> Generar catálogo
            </button>
            <button onClick={() => void compartir()} className="btn-secondary !py-2.5">
              {copiado ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
              {copiado ? 'Enlace copiado' : 'Compartir'}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por marca, modelo o año..." className="input-field pl-11" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {([['all', 'Todos'], ['carro', 'Carros'], ['moto', 'Motos']] as const).map(([valor, etiqueta]) => (
              <button
                key={valor}
                onClick={() => setTipo(valor)}
                className={`rounded-lg border px-3 py-2.5 text-sm font-medium ${tipo === valor ? 'border-jg-red bg-jg-red/10 text-jg-red' : 'border-jg-silver text-gray-400'}`}
              >
                {etiqueta}
              </button>
            ))}
          </div>
        </div>

        {j.loading ? (
          <p className="text-sm text-gray-400">Cargando vehículos...</p>
        ) : lista.length > 0 ? (
          <GrillaPorEstado vehiculos={lista} onAbrir={j.openVehicle} />
        ) : (
          <div className="flex flex-col items-center py-16 text-center">
            <ImageIcon className="h-10 w-10 text-gray-500" />
            <p className="mt-3 text-sm text-gray-400">Por ahora no hay vehículos publicados en este catálogo.</p>
          </div>
        )}
      </div>
    </div>
  );
}
