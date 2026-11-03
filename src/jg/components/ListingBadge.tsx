import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { renewListing } from '@/jg/lib/listing-renewal.functions';
import { listingStatus, type PlanId } from '@/jg/lib/plans';

const LABELS = {
  activo: { text: 'Activo', cls: 'text-green-400' },
  por_vencer: { text: 'Por vencer', cls: 'text-yellow-400' },
  expirado: { text: 'Expirado', cls: 'text-red-400' },
} as const;

export function ListingBadge({
  vehicle,
  onRenewed,
}: {
  vehicle: { id: string; listing_owner?: string | null; expires_at?: string | null };
  onRenewed: () => Promise<void>;
}) {
  const renew = useServerFn(renewListing);
  const [busy, setBusy] = useState(false);
  const status = listingStatus(vehicle);
  if (status === 'permanente') return null;
  const label = LABELS[status];

  const handle = async (planId: PlanId) => {
    if (!window.confirm('¿Confirmas que validaste el pago de este plan?')) return;
    setBusy(true);
    try {
      await renew({ data: { vehicleId: vehicle.id, planId } });
      await onRenewed();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'No se pudo renovar.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-1 text-[11px]">
      <span className={`font-semibold ${label.cls}`}>
        Tercero · {label.text} · vence{' '}
        {vehicle.expires_at ? new Date(vehicle.expires_at).toLocaleDateString('es-CO') : '—'}
      </span>
      <div className="mt-1 flex flex-wrap gap-1.5">
        <button
          type="button"
          disabled={busy}
          onClick={() => handle('renovacion_simple')}
          className="rounded bg-gray-800 px-2 py-1 font-semibold text-gray-100 transition hover:bg-gray-700 disabled:opacity-50"
        >
          Renovar +30 días
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => handle('destacado_90')}
          className="rounded bg-jg-red px-2 py-1 font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
        >
          Renovar +90 días
        </button>
      </div>
    </div>
  );
}
