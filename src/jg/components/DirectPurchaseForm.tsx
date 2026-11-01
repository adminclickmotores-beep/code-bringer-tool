import { useRef, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { AlertCircle, Bike, Car, CheckCircle2, Loader2, MessageCircle, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadVehiclePhoto, whatsappLink } from '@/jg/lib/supabase';
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES, MAX_VEHICLE_PHOTOS } from '@/jg/lib/vehicle-submission';
import { directPurchaseSchema, directPurchaseSheet } from '@/jg/lib/commercial-lead';
import { submitCommercialLead } from '@/jg/lib/commercial-lead.functions';

const initial = {
  name: '', phone: '', vehicleType: 'carro' as 'moto' | 'carro', brand: '',
  year: new Date().getFullYear(), version: '', transmission: 'mecanico' as 'automatico' | 'mecanico',
  traction: '4x2' as '4x2' | '4x4', mileage: 0, color: '', city: '', plate: '',
  documentsUpToDate: true, hasLien: false, askingPrice: 0, photoUrls: [] as string[], acceptedPrivacy: false,
};

export function DirectPurchaseForm() {
  const submit = useServerFn(submitCommercialLead);
  const [f, setF] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const set = <K extends keyof typeof initial>(k: K, v: (typeof initial)[K]) => setF((p) => ({ ...p, [k]: v }));

  const onFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, MAX_VEHICLE_PHOTOS - f.photoUrls.length);
    e.target.value = '';
    if (!files.length) return;
    if (files.some((x) => !ALLOWED_IMAGE_TYPES.includes(x.type as (typeof ALLOWED_IMAGE_TYPES)[number]) || x.size > MAX_UPLOAD_BYTES)) {
      setError('Cada foto debe ser JPG, PNG o WebP y pesar máximo 10 MB.');
      return;
    }
    setUploading(true); setError(null);
    try {
      const urls: string[] = [];
      for (const file of files) urls.push(await uploadVehiclePhoto(file));
      setF((p) => ({ ...p, photoUrls: [...p.photoUrls, ...urls] }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las fotos.');
    } finally { setUploading(false); }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null);
    const parsed = directPurchaseSchema.safeParse({
      ...f, kind: 'directa', traction: f.vehicleType === 'carro' ? f.traction : null,
      phone: f.phone.replace(/\D/g, ''),
    });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? 'Revisa los datos.'); return; }
    const win = window.open('', '_blank');
    setSending(true);
    try {
      await submit({ data: parsed.data });
      const url = whatsappLink(`Hola ClickMotores, quiero una oferta de compra para mi vehículo.\n\n${directPurchaseSheet(parsed.data)}\n\nNombre: ${parsed.data.name}`);
      if (win) win.location.href = url; else window.location.href = url;
      setDone(true);
    } catch (err) {
      win?.close();
      setError(err instanceof Error ? err.message : 'No pudimos enviar la solicitud.');
    } finally { setSending(false); }
  };

  if (done) return (
    <div className="px-5 py-14 text-center">
      <CheckCircle2 className="mx-auto h-14 w-14 text-green-600" />
      <h2 className="mt-4 text-2xl font-bold text-jg-text-dark">Solicitud recibida</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm text-jg-text-muted">Te enviaremos una oferta formal en menos de 24 horas por WhatsApp.</p>
      <Button type="button" variant="outline" className="mt-6" onClick={() => { setF(initial); setDone(false); }}>Enviar otro vehículo</Button>
    </div>
  );

  const input = (id: keyof typeof initial, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div><label className="label-field" htmlFor={`dp-${id}`}>{label}</label>
      <input id={`dp-${id}`} className="input-field" value={String(f[id] || (props.type === 'number' ? '' : f[id]))}
        onChange={(e) => set(id, (props.type === 'number' ? Number(e.target.value) : e.target.value) as never)} {...props} /></div>
  );

  return (
    <form onSubmit={onSubmit} className="space-y-5 p-5 sm:p-8">
      <div><h2 className="text-xl font-bold text-jg-text-dark">Ficha de tu vehículo</h2><p className="mt-1 text-sm text-jg-text-muted">Un solo paso. Te respondemos con una oferta formal.</p></div>
      <div className="grid grid-cols-2 gap-3">
        {(['carro', 'moto'] as const).map((t) => (
          <Button key={t} type="button" variant="outline" onClick={() => set('vehicleType', t)} className={`h-12 ${f.vehicleType === t ? 'border-jg-red bg-jg-red/10 text-jg-red' : ''}`}>
            {t === 'moto' ? <Bike /> : <Car />} {t === 'moto' ? 'Moto' : 'Carro'}
          </Button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {input('brand', 'Marca *', { maxLength: 60, placeholder: 'Ej. Mazda' })}
        {input('year', 'Modelo (año) *', { type: 'number', min: 1950, max: 2050 })}
        {input('version', 'Referencia / versión *', { maxLength: 80, placeholder: 'Ej. CX-30 Grand Touring' })}
        <div><label className="label-field" htmlFor="dp-tr">Caja *</label>
          <select id="dp-tr" className="input-field" value={f.transmission} onChange={(e) => set('transmission', e.target.value as 'automatico' | 'mecanico')}>
            <option value="mecanico">Mecánica</option><option value="automatico">Automática</option></select></div>
        {f.vehicleType === 'carro' && <div><label className="label-field" htmlFor="dp-tc">Tracción *</label>
          <select id="dp-tc" className="input-field" value={f.traction} onChange={(e) => set('traction', e.target.value as '4x2' | '4x4')}>
            <option value="4x2">4x2</option><option value="4x4">4x4</option></select></div>}
        {input('mileage', 'Kilometraje *', { type: 'number', min: 0 })}
        {input('color', 'Color *', { maxLength: 40 })}
        {input('city', 'Ciudad *', { maxLength: 80, placeholder: 'Ej. Cali' })}
        <div><label className="label-field" htmlFor="dp-plate">Placa *</label>
          <input id="dp-plate" maxLength={10} className="input-field uppercase" value={f.plate} placeholder="ABC123"
            onChange={(e) => set('plate', e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''))} /></div>
        <div><label className="label-field" htmlFor="dp-docs">SOAT y Tecno al día *</label>
          <select id="dp-docs" className="input-field" value={f.documentsUpToDate ? 'si' : 'no'} onChange={(e) => set('documentsUpToDate', e.target.value === 'si')}>
            <option value="si">Sí</option><option value="no">No</option></select></div>
        <div><label className="label-field" htmlFor="dp-lien">¿Tiene prenda bancaria? *</label>
          <select id="dp-lien" className="input-field" value={f.hasLien ? 'si' : 'no'} onChange={(e) => set('hasLien', e.target.value === 'si')}>
            <option value="no">No</option><option value="si">Sí</option></select></div>
        {input('askingPrice', 'Expectativa de precio (COP)', { type: 'number', min: 0, placeholder: 'Ej. 45000000' })}
        {input('name', 'Nombre completo *', { maxLength: 100 })}
        {input('phone', 'Celular / WhatsApp *', { type: 'tel', maxLength: 13, placeholder: '3001234567' })}
      </div>
      <div>
        <label className="label-field">Fotos ({f.photoUrls.length}/{MAX_VEHICLE_PHOTOS}) · mínimo 4</label>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={onFiles} />
        <Button type="button" variant="outline" className="h-14 w-full border-dashed" disabled={uploading || f.photoUrls.length >= MAX_VEHICLE_PHOTOS} onClick={() => fileRef.current?.click()}>
          {uploading ? <Loader2 className="animate-spin" /> : <Upload />} Subir fotos
        </Button>
        {f.photoUrls.length > 0 && <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{f.photoUrls.map((u, i) => (
          <div key={u} className="relative"><img src={u} alt={`Foto ${i + 1}`} className="h-28 w-full rounded-md object-cover" />
            <Button type="button" size="icon" variant="destructive" className="absolute right-1 top-1 h-7 w-7" aria-label="Eliminar foto" onClick={() => set('photoUrls', f.photoUrls.filter((x) => x !== u))}><X /></Button></div>
        ))}</div>}
      </div>
      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-jg-silver p-4"><input type="checkbox" checked={f.acceptedPrivacy} onChange={(e) => set('acceptedPrivacy', e.target.checked)} className="mt-1 h-4 w-4 accent-jg-red" /><span className="text-sm text-jg-text-muted">Autorizo a JG Motors, operador de ClickMotores, a tratar mis datos para gestionar esta oferta (Habeas Data).</span></label>
      {error && <div role="alert" className="flex gap-2 rounded-lg border border-jg-red/30 bg-jg-red/10 p-3 text-sm text-jg-red"><AlertCircle className="h-5 w-5 shrink-0" />{error}</div>}
      <Button type="submit" className="h-12 w-full bg-jg-red text-primary-foreground hover:bg-jg-red-dark" disabled={sending || uploading || !f.acceptedPrivacy}>
        {sending ? <Loader2 className="animate-spin" /> : <MessageCircle />} Solicitar oferta por WhatsApp
      </Button>
    </form>
  );
}
