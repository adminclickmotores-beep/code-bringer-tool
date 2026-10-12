import { useState } from 'react';
import { Check, Copy, MessageCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCOP, whatsappLink } from '@/jg/lib/supabase';
import {
  FREE_PUBLICATION_DAYS, PAYMENT_HOLDER, PAYMENT_METHODS, PUBLICATION_PLANS,
  planWhatsappMessage, type PlanId,
} from '@/jg/lib/plans';

export function PlansSection() {
  const [selected, setSelected] = useState<PlanId>('destacado_30');
  const [copied, setCopied] = useState('');
  const plan = PUBLICATION_PLANS.find((p) => p.id === selected)!;

  const copy = async (value: string) => {
    try { await navigator.clipboard.writeText(value); setCopied(value); setTimeout(() => setCopied(''), 1500); } catch { /* ignore */ }
  };

  return (
    <section className="py-14">
      <div className="text-center">
        <span className="badge border border-jg-red/30 bg-jg-red/10 text-jg-red">Publicar Gratis</span>
        <h2 className="mt-3 text-2xl font-bold text-jg-text-dark sm:text-3xl">Tus primeros {FREE_PUBLICATION_DAYS} días son gratis</h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-jg-text-muted">
          Al terminar, mantén tu aviso visible o destácalo con uno de nuestros planes. Cada placa usa el periodo gratis una sola vez.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {PUBLICATION_PLANS.map((p) => {
          const active = p.id === selected;
          return (
            <button key={p.id} type="button" onClick={() => setSelected(p.id)}
              className={`card p-6 text-left transition ${active ? 'border-jg-red ring-2 ring-jg-red/20' : ''}`}>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-jg-text-dark">{p.name}</h3>
                {p.featured && <Star className="h-4 w-4 fill-jg-red text-jg-red" />}
              </div>
              <p className="mt-3 font-display text-3xl font-bold text-jg-red">{formatCOP(p.price)}</p>
              <p className="text-sm text-jg-text-muted">{p.days} días{p.featured ? ' · aviso destacado' : ' · visibilidad normal'}</p>
              <p className="mt-4 flex items-center gap-1 text-xs font-semibold text-jg-text-dark">
                {active ? <><Check className="h-4 w-4 text-jg-red" /> Seleccionado</> : 'Elegir plan'}
              </p>
            </button>
          );
        })}
      </div>

      <div className="card mt-6 grid gap-6 p-6 md:grid-cols-2">
        <div>
          <h3 className="font-bold text-jg-text-dark">Paga por transferencia</h3>
          <p className="mt-1 text-xs text-jg-text-muted">A nombre de {PAYMENT_HOLDER}</p>
          <ul className="mt-4 space-y-2">
            {PAYMENT_METHODS.map((m) => (
              <li key={m.label} className="flex items-center justify-between rounded-lg border border-jg-silver px-3 py-2 text-sm">
                <span><span className="text-jg-text-muted">{m.label}: </span><strong className="text-jg-text-dark">{m.value}</strong></span>
                <button type="button" onClick={() => copy(m.value)} className="text-jg-red" aria-label={`Copiar ${m.label}`}>
                  {copied === m.value ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-sm text-jg-text-muted">Después de pagar <strong className="text-jg-text-dark">{plan.name}</strong> ({formatCOP(plan.price)}), envíanos el comprobante con tu nombre y placa.</p>
          <Button asChild className="mt-4">
            <a href={whatsappLink(planWhatsappMessage(plan))} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" /> Enviar comprobante por WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
