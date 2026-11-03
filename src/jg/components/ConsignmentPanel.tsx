import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { AlertCircle, Camera, CheckCircle2, FileCheck2, Loader2, Megaphone, PhoneCall, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { whatsappLink } from '@/jg/lib/supabase';
import { consignmentSchema } from '@/jg/lib/commercial-lead';
import { submitCommercialLead } from '@/jg/lib/commercial-lead.functions';

const benefits = [
  { icon: Camera, title: 'Fotografía profesional', desc: 'Contenido de calidad que destaca tu vehículo.' },
  { icon: Megaphone, title: 'Pauta multicanal', desc: 'TuCarro, Marketplace, Instagram, Facebook y nuestra red de clientes.' },
  { icon: ShieldCheck, title: 'Filtro de seguridad', desc: 'Perfilamos y validamos a cada interesado. Sin desconocidos en tu casa.' },
  { icon: FileCheck2, title: 'Cierre y trámites', desc: 'Te acompañamos en la negociación, traspaso y documentos.' },
];

const initial = { name: '', phone: '', vehicleType: 'carro' as 'moto' | 'carro', brand: '', model: '', year: new Date().getFullYear(), city: '', acceptedPrivacy: false };

export function ConsignmentPanel() {
  const submit = useServerFn(submitCommercialLead);
  const [f, setF] = useState(initial);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null);
    const parsed = consignmentSchema.safeParse({ ...f, kind: 'consignacion', phone: f.phone.replace(/\D/g, '') });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? 'Revisa los datos.'); return; }
    setSending(true);
    try { await submit({ data: parsed.data }); setDone(true); }
    catch (err) { setError(err instanceof Error ? err.message : 'No pudimos enviar la solicitud.'); }
    finally { setSending(false); }
  };

  const field = (id: 'name' | 'phone' | 'brand' | 'model' | 'city', label: string, ph = '') => (
    <div><label className="label-field" htmlFor={`cs-${id}`}>{label}</label>
      <input id={`cs-${id}`} className="input-field" maxLength={100} placeholder={ph} value={f[id]} onChange={(e) => setF({ ...f, [id]: e.target.value })} /></div>
  );

  return (
    <div className="space-y-6 p-5 sm:p-8">
      <div><h2 className="text-xl font-bold text-jg-text-dark">Vendemos tu vehículo por ti</h2>
        <p className="mt-1 text-sm text-jg-text-muted">Consigue el mejor precio sin lidiar con desconocidos ni perder tiempo. Nuestro equipo comercial se encarga de todo el proceso de principio a fin.</p></div>
      <div className="grid gap-3 sm:grid-cols-2">
        {benefits.map((b) => (
          <div key={b.title} className="flex gap-3 rounded-lg border border-jg-silver p-4">
            <b.icon className="h-5 w-5 shrink-0 text-jg-red" />
            <div><p className="font-semibold text-jg-text-dark">{b.title}</p><p className="text-sm text-jg-text-muted">{b.desc}</p></div>
          </div>
        ))}
      </div>
      {done ? (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-6 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" />
          <p className="mt-2 font-semibold text-jg-text-dark">¡Listo! Un asesor comercial te llamará pronto.</p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-jg-silver p-5">
          <p className="font-semibold text-jg-text-dark">Solicita una llamada de asesoría comercial</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {field('name', 'Nombre completo *')}
            {field('phone', 'Celular / WhatsApp *', '3001234567')}
            <div><label className="label-field" htmlFor="cs-type">Tipo *</label>
              <select id="cs-type" className="input-field" value={f.vehicleType} onChange={(e) => setF({ ...f, vehicleType: e.target.value as 'moto' | 'carro' })}>
                <option value="carro">Carro</option><option value="moto">Moto</option></select></div>
            {field('brand', 'Marca *', 'Ej. Mazda')}
            {field('model', 'Modelo / referencia *', 'Ej. CX-30')}
            <div><label className="label-field" htmlFor="cs-year">Año *</label>
              <input id="cs-year" type="number" min={1950} max={2050} className="input-field" value={f.year} onChange={(e) => setF({ ...f, year: Number(e.target.value) })} /></div>
            {field('city', 'Ciudad *', 'Ej. Cali')}
          </div>
          <label className="flex cursor-pointer items-start gap-3"><input type="checkbox" checked={f.acceptedPrivacy} onChange={(e) => setF({ ...f, acceptedPrivacy: e.target.checked })} className="mt-1 h-4 w-4 accent-jg-red" /><span className="text-sm text-jg-text-muted">Autorizo a JG Motors, operador de ClickMotores, a tratar mis datos para contactarme (Habeas Data).</span></label>
          {error && <div role="alert" className="flex gap-2 rounded-lg border border-jg-red/30 bg-jg-red/10 p-3 text-sm text-jg-red"><AlertCircle className="h-5 w-5 shrink-0" />{error}</div>}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" className="flex-1 bg-jg-red text-white hover:bg-jg-red-dark" disabled={sending || !f.acceptedPrivacy}>
              {sending ? <Loader2 className="animate-spin" /> : <PhoneCall />} Quiero que vendan mi vehículo
            </Button>
            <Button type="button" variant="outline" className="flex-1" asChild>
              <a href={whatsappLink('Hola ClickMotores, quiero información sobre la consignación comercial de mi vehículo.')} target="_blank" rel="noopener noreferrer">Escribir por WhatsApp</a>
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
