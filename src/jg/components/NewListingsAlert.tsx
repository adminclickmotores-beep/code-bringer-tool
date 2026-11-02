import { useCallback, useEffect, useState } from 'react';
import { BellRing, EyeOff, Pencil, X } from 'lucide-react';
import { supabase } from '@/jg/lib/supabase';
import type { Notification, Vehicle } from '@/jg/lib/supabase';

type Props = {
  vehicles: Vehicle[];
  onEdit: (vehicle: Vehicle) => void;
  onTakeDown: (id: string) => Promise<void>;
};

/** Avisos de "Publicar Gratis" que entraron directo al inventario y aún no se revisan. */
export function NewListingsAlert({ vehicles, onEdit, onTakeDown }: Props) {
  const [items, setItems] = useState<Notification[]>([]);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('type', 'published')
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(20);
    setItems((data ?? []) as Notification[]);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const dismiss = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setItems((prev) => prev.filter((n) => n.id !== id));
  };

  if (items.length === 0) return null;

  return (
    <section className="mb-6 rounded-xl border border-jg-yellow/40 bg-jg-yellow/10 p-4">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-jg-yellow">
        <BellRing className="h-4 w-4" /> Nuevos clasificados publicados ({items.length})
      </h2>
      <ul className="space-y-2">
        {items.map((n) => {
          const vehicle = vehicles.find((v) => String(v.id) === n.related_id);
          return (
            <li key={n.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-800 bg-gray-900 p-3 text-sm">
              <div>
                <p className="font-semibold text-white">{n.message}</p>
                <p className="text-xs text-gray-400">
                  {n.created_at ? new Date(n.created_at).toLocaleString('es-CO') : ''}
                  {vehicle && vehicle.status !== 'disponible' ? ' · Dado de baja' : ''}
                </p>
              </div>
              <div className="flex gap-2">
                {vehicle && (
                  <>
                    <button type="button" onClick={() => onEdit(vehicle)} className="flex items-center gap-1 rounded-md border border-gray-700 px-3 py-1.5 text-xs text-white hover:bg-gray-800">
                      <Pencil className="h-3.5 w-3.5" /> Editar
                    </button>
                    {vehicle.status === 'disponible' && (
                      <button type="button" onClick={async () => { await onTakeDown(String(vehicle.id)); await dismiss(n.id); }} className="flex items-center gap-1 rounded-md bg-jg-red px-3 py-1.5 text-xs font-semibold text-white">
                        <EyeOff className="h-3.5 w-3.5" /> Dar de baja
                      </button>
                    )}
                  </>
                )}
                <button type="button" onClick={() => dismiss(n.id)} aria-label="Marcar como revisado" className="rounded-md border border-gray-700 px-2 py-1.5 text-xs text-gray-300 hover:bg-gray-800">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
