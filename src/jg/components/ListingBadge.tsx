import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { renewListing } from '@/jg/lib/listing-renewal.functions';
import { listingStatus, PUBLICATION_PLANS, type PlanId } from '@/jg/lib/plans';

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
        {new Date(vehicle.expires_at!).toLocaleDateString('es-CO')}
      </span>
      <select
        disabled={busy}
        value=""
        onChange={(e) => e.target.value && handle(e.target.value as PlanId)}
        className="mt-1 block rounded border border-gray-700 bg-gray-900 px-1 py-0.5 text-gray-200"
      >
        <option value="">Renovar…</option>
        {PUBLICATION_PLANS.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} (+{p.days} días)
          </option>
        ))}
      </select>
    </div>
  );
}
