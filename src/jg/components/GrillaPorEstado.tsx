import type { Vehicle } from '@/jg/lib/supabase';
import { catalogRank } from '@/jg/lib/plans';
import { VehicleCard } from '@/jg/components/VehicleCard';

/** Muestra primero los disponibles y, al final, los no disponibles / vendidos. */
export function GrillaPorEstado({ vehiculos, onAbrir }: { vehiculos: Vehicle[]; onAbrir: (v: Vehicle) => void }) {
  const disponibles = vehiculos.filter((v) => catalogRank(v) === 0);
  const otros = vehiculos.filter((v) => catalogRank(v) !== 0);

  const grilla = (lista: Vehicle[]) => (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {lista.map((v) => (
        <VehicleCard key={v.id} vehicle={v} onClick={() => onAbrir(v)} />
      ))}
    </div>
  );

  return (
    <div className="space-y-10">
      {disponibles.length > 0 && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-jg-text-dark">
            Disponibles
            <span className="rounded-full bg-jg-red/15 px-2.5 py-0.5 text-xs font-semibold text-jg-red">{disponibles.length}</span>
          </h2>
          {grilla(disponibles)}
        </section>
      )}
      {otros.length > 0 && (
        <section>
          <h2 className="mb-1 flex items-center gap-2 font-display text-xl font-bold text-gray-400">
            No disponibles y vendidos
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-gray-400">{otros.length}</span>
          </h2>
          <p className="mb-4 text-xs text-gray-500">Se muestran al final como referencia. Escríbenos si buscas algo parecido.</p>
          {grilla(otros)}
        </section>
      )}
    </div>
  );
}
