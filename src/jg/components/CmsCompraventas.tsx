import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type FilaCompraventa = {
  id: string;
  business_name: string;
  city: string | null;
  phone: string;
  aprobada: boolean;
  created_at: string;
};

export function CmsCompraventas() {
  const [filas, setFilas] = useState<FilaCompraventa[]>([]);
  const [cargando, setCargando] = useState(true);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cargar = async () => {
    setCargando(true);
    const { data, error: e } = await supabase
      .from('dealer_profiles')
      .select('id,business_name,city,phone,aprobada,created_at')
      .order('created_at', { ascending: false });
    if (e) setError('No se pudieron cargar las compraventas.');
    else setFilas((data ?? []) as FilaCompraventa[]);
    setCargando(false);
  };

  useEffect(() => {
    void cargar();
  }, []);

  const cambiarAprobacion = async (fila: FilaCompraventa) => {
    setOcupado(fila.id);
    setError(null);
    const { error: e } = await supabase
      .from('dealer_profiles')
      .update({ aprobada: !fila.aprobada })
      .eq('id', fila.id);
    if (e) setError('No se pudo cambiar el estado. Intenta de nuevo.');
    else setFilas((prev) => prev.map((f) => (f.id === fila.id ? { ...f, aprobada: !f.aprobada } : f)));
    setOcupado(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-bold text-white">Compraventas</h2>
        <p className="mt-1 text-sm text-gray-400">
          Las compraventas nuevas entran pendientes. Apruébalas para que puedan publicar gratis.
        </p>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {cargando ? (
        <p className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Cargando...
        </p>
      ) : filas.length === 0 ? (
        <p className="text-sm text-gray-400">Todavía no hay compraventas registradas.</p>
      ) : (
        <ul className="space-y-3">
          {filas.map((fila) => (
            <li
              key={fila.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 p-4"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-white">{fila.business_name}</p>
                <p className="text-sm text-gray-400">
                  WhatsApp: {fila.phone}
                  {fila.city ? ` · ${fila.city}` : ''}
                </p>
                <p className={`mt-1 text-xs font-semibold ${fila.aprobada ? 'text-green-400' : 'text-yellow-400'}`}>
                  {fila.aprobada ? 'Aprobada' : 'Pendiente de aprobación'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void cambiarAprobacion(fila)}
                disabled={ocupado === fila.id}
                className={`min-h-[44px] rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60 ${
                  fila.aprobada
                    ? 'border border-white/20 text-gray-300'
                    : 'bg-[#FF1E27] text-white'
                }`}
              >
                {fila.aprobada ? 'Quitar aprobación' : 'Aprobar'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
