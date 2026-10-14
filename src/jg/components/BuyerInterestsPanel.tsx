import { useEffect, useState } from 'react';
import { Loader2, Trash2, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type Interest = {
  id: string;
  buyer_name: string;
  buyer_phone: string;
  vehicle_title: string | null;
  vehicle_plate: string | null;
  contact_target: string;
  status: string;
  created_at: string;
};

export function followUpLink(i: Pick<Interest, 'buyer_name' | 'buyer_phone' | 'vehicle_title'>) {
  const msg = `Hola ${i.buyer_name}, te saluda ClickMotores. Vimos tu interés en ${i.vehicle_title ?? 'uno de nuestros vehículos'}. ¿Aún lo estás buscando? Con gusto te ayudamos.`;
  return `https://wa.me/57${i.buyer_phone}?text=${encodeURIComponent(msg)}`;
}

export function BuyerInterestsPanel() {
  const [rows, setRows] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('buyer_interests').select('*').order('created_at', { ascending: false });
    setRows((data as Interest[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const setStatus = async (id: string, status: string) => {
    await supabase.from('buyer_interests').update({ status }).eq('id', id);
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));
  };
  const remove = async (id: string) => {
    if (!confirm('¿Eliminar este interesado?')) return;
    await supabase.from('buyer_interests').delete().eq('id', id);
    setRows((r) => r.filter((x) => x.id !== id));
  };
  const exportCsv = () => {
    const head = ['Fecha', 'Nombre', 'WhatsApp', 'Vehículo', 'Placa', 'Contactó a', 'Estado'];
    const lines = rows.map((r) => [new Date(r.created_at).toLocaleString('es-CO'), r.buyer_name, r.buyer_phone, r.vehicle_title ?? '', r.vehicle_plate ?? '', r.contact_target === 'owner' ? 'Propietario' : 'ClickMotores', r.status]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','));
    const blob = new Blob(['\ufeff' + [head.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'interesados.csv';
    a.click();
  };

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold">Interesados</h2>
          <p className="text-sm text-gray-400">Personas que pidieron contacto por WhatsApp desde un vehículo.</p>
        </div>
        <button type="button" onClick={exportCsv} className="flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-2 text-sm hover:bg-gray-700">
          <Download className="h-4 w-4" /> Exportar a Excel (.csv)
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-jg-red" /></div>
      ) : rows.length === 0 ? (
        <p className="py-12 text-center text-gray-400">Aún no hay interesados registrados.</p>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <article key={r.id} className="flex flex-col gap-3 rounded-xl border border-gray-800 bg-gray-950 p-4 md:flex-row md:items-center md:justify-between">
              <div className="text-sm">
                <p className="font-semibold">{r.buyer_name} · {r.buyer_phone}</p>
                <p className="text-gray-400">{r.vehicle_title ?? '—'} {r.vehicle_plate ? `· ${r.vehicle_plate}` : ''}</p>
                <p className="text-xs text-gray-500">{new Date(r.created_at).toLocaleString('es-CO')} · Contactó a {r.contact_target === 'owner' ? 'propietario' : 'ClickMotores'}</p>
              </div>
              <div className="flex items-center gap-2">
                <select value={r.status} onChange={(e) => setStatus(r.id, e.target.value)} className="rounded-lg border border-gray-700 bg-gray-900 px-2 py-1.5 text-sm">
                  <option value="nuevo">Nuevo</option>
                  <option value="contactado">Contactado</option>
                  <option value="negociando">Negociando</option>
                  <option value="cerrado">Venta cerrada</option>
                  <option value="descartado">Descartado</option>
                </select>
                <a href={followUpLink(r)} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-green-700">
                  Seguimiento WhatsApp
                </a>
                <button type="button" onClick={() => remove(r.id)} aria-label="Eliminar" className="rounded-lg p-2 text-gray-400 hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
