import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Vehicle, formatCOP, maskPlaca } from '@/jg/lib/supabase';

interface Props {
  vehicle: Vehicle;
  target: 'jg' | 'owner';
  whatsappHref: string;
  onClose: () => void;
}

export function InterestCaptureModal({ vehicle, target, whatsappHref, onClose }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const cleanPhone = phone.replace(/\D/g, '');
    if (name.trim().length < 2) return setError('Escribe tu nombre.');
    if (!/^3\d{9}$/.test(cleanPhone)) return setError('Escribe un celular colombiano de 10 dígitos (empieza por 3).');
    if (!accepted) return setError('Debes autorizar el tratamiento de datos.');
    setError('');
    setSaving(true);
    // Open WhatsApp synchronously-ish to avoid popup blockers
    const win = window.open('', '_blank');
    await supabase.from('buyer_interests').insert({
      buyer_name: name.trim().slice(0, 100),
      buyer_phone: cleanPhone,
      vehicle_id: vehicle.id,
      vehicle_title: vehicle.title,
      vehicle_plate: vehicle.placa_completa ?? null,
      contact_target: target,
    });
    setSaving(false);
    if (win) win.location.href = whatsappHref;
    else window.location.href = whatsappHref;
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => { e.stopPropagation(); onClose(); }}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-jg-surface p-5 shadow-2xl"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-jg-text">Antes de chatear</h3>
            <p className="text-xs text-jg-text-muted">Déjanos tus datos para atenderte mejor.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="text-jg-text-muted">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mb-4 flex items-center gap-3 rounded-lg bg-jg-surface-2 p-2">
          {vehicle.image_urls?.[0] && (
            <img src={vehicle.image_urls[0]} alt={vehicle.title} className="h-12 w-16 rounded object-cover" />
          )}
          <div className="text-xs">
            <p className="font-semibold text-jg-text">{vehicle.title}</p>
            <p className="text-jg-text-muted">{formatCOP(vehicle.price)} · {maskPlaca(vehicle.placa_completa)}</p>
          </div>
        </div>
        <label className="mb-1 block text-xs font-medium text-jg-text">Nombre</label>
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={100}
          className="mb-3 w-full rounded-lg border border-jg-border-light px-3 py-2 text-sm" placeholder="Tu nombre" />
        <label className="mb-1 block text-xs font-medium text-jg-text">WhatsApp</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="numeric" maxLength={13}
          className="mb-3 w-full rounded-lg border border-jg-border-light px-3 py-2 text-sm" placeholder="3001234567" />
        <label className="mb-3 flex items-start gap-2 text-xs text-jg-text-muted">
          <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-0.5" />
          <span>Autorizo a ClickMotores el tratamiento de mis datos según la <a href="/habeas-data" target="_blank" className="underline">política de Habeas Data</a>.</span>
        </label>
        {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
        <button type="submit" disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-3 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-60">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Continuar a WhatsApp
        </button>
      </form>
    </div>
  );
}
