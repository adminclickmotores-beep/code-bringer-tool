import { useMemo, useRef, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import {
  AlertCircle, ArrowLeft, ArrowRight, Bike, Camera, Car, Check,
  CheckCircle2, DollarSign, FileLock2, Globe, Handshake, Loader2,
  LockKeyhole, Send, ShieldCheck, Sparkles, Upload, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useJg } from '@/jg/JgApp';
import { formatCOP, uploadPropertyCard, uploadVehiclePhoto } from '@/jg/lib/supabase';
import { submitVehicleRequest } from '@/jg/lib/vehicle-submission.functions';
import {
  ALLOWED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
  MAX_VEHICLE_PHOTOS,
  minimumPhotos,
  suggestedVehiclePrice,
  vehicleSubmissionSchema,
} from '@/jg/lib/vehicle-submission';

type SaleMode = 'publicar_gratis' | 'directa' | 'consignacion';

const photoGuideMoto = [
  'Frente', 'Trasera', 'Perfil Izquierdo', 'Perfil Derecho',
  'Tablero (Kilometraje)', 'Sillín/Asiento', 'Llantas/Kit de arrastre o Exosto', 'Foto libre/Accesorio',
];

const photoGuideCarro = [
  'Frente', 'Trasera', 'Perfil Izquierdo', 'Perfil Derecho',
  'Tablero (Kilometraje)', 'Cojinería (asientos)', 'Llantas/Motor', 'Foto libre/Detalle',
];

export function SellPage() {
  const { vehicles } = useJg();
  const submitRequest = useServerFn(submitVehicleRequest);
  const [saleMode, setSaleMode] = useState<SaleMode>('publicar_gratis');
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    vehicleType: 'moto' as 'moto' | 'carro',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    displacement: '',
    mileage: 0,
    condition: '',
    askingPrice: 0,
    description: '',
    city: '',
    plate: '',
    photoUrls: [] as string[],
    propertyCardPaths: [] as string[],
    acceptedPrivacy: false,
  });
  const [uploading, setUploading] = useState(false);
  const [uploadingCards, setUploadingCards] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const propertyFrontInputRef = useRef<HTMLInputElement>(null);
  const propertyBackInputRef = useRef<HTMLInputElement>(null);
  const propertyUploadGroupRef = useRef<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const photoGuide = form.vehicleType === 'moto' ? photoGuideMoto : photoGuideCarro;
  const requiredPhotos = minimumPhotos(form.vehicleType);
  const suggestedPrice = useMemo(() => suggestedVehiclePrice({
    type: form.vehicleType,
    brand: form.brand,
    model: form.model,
    year: form.year,
  }, vehicles), [form.vehicleType, form.brand, form.model, form.year, vehicles]);

  const isCommercial = saleMode === 'directa' || saleMode === 'consignacion';
  const isPublicar = saleMode === 'publicar_gratis';

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const remaining = MAX_VEHICLE_PHOTOS - form.photoUrls.length;
    const toUpload = Array.from(files).slice(0, remaining);
    if (toUpload.length === 0) return;
    const invalidFile = toUpload.find((file) =>
      !ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])
      || file.size > MAX_UPLOAD_BYTES,
    );
    if (invalidFile) {
      setStepError('Cada foto debe ser JPG, PNG o WebP y pesar máximo 10 MB.');
      e.target.value = '';
      return;
    }

    setUploading(true);
    setStepError(null);
    try {
      const urls: string[] = [];
      for (const file of toUpload) {
        const url = await uploadVehiclePhoto(file);
        if (url) urls.push(url);
      }
      setForm((prev) => ({ ...prev, photoUrls: [...prev.photoUrls, ...urls] }));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removePhoto = (url: string) => {
    setForm((prev) => ({ ...prev, photoUrls: prev.photoUrls.filter((u) => u !== url) }));
  };

  const handlePropertyCard = async (
    side: 'front' | 'back',
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number]) || file.size > MAX_UPLOAD_BYTES) {
      setStepError('La tarjeta debe ser JPG, PNG o WebP y pesar máximo 10 MB por lado.');
      e.target.value = '';
      return;
    }
    setUploadingCards(true);
    setStepError(null);
    try {
      propertyUploadGroupRef.current ??= crypto.randomUUID();
      const path = await uploadPropertyCard(file, propertyUploadGroupRef.current, side);
      if (!path) throw new Error('No se pudo cargar el documento.');
      const index = side === 'front' ? 0 : 1;
      setForm((previous) => {
        const paths = [...previous.propertyCardPaths];
        paths[index] = path;
        return { ...previous, propertyCardPaths: paths };
      });
    } catch (error) {
      setStepError(error instanceof Error ? error.message : 'No se pudieron cargar los documentos.');
    } finally {
      setUploadingCards(false);
      e.target.value = '';
    }
  };

  const chooseMode = (mode: SaleMode) => {
    setSaleMode(mode);
    setStep(1);
    propertyUploadGroupRef.current = null;
    requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const continueStep = () => {
    setStepError(null);
    if (step === 1) {
      if (!form.brand.trim() || !form.model.trim() || !form.city.trim() || !form.plate.trim()) {
        setStepError('Completa marca, modelo, ciudad y placa para continuar.');
        return;
      }
      const year = new Date().getFullYear();
      if (form.year < 1950 || form.year > year + 1 || form.mileage < 0) {
        setStepError('Revisa el año y el kilometraje.');
        return;
      }
    }
    if (step === 2) {
      if (form.photoUrls.length < requiredPhotos) {
        setStepError(`Sube mínimo ${requiredPhotos} fotos para continuar.`);
        return;
      }
      if (form.propertyCardPaths.length !== 2) {
        setStepError('Sube el frente y el reverso de la tarjeta de propiedad.');
        return;
      }
    }
    setStep((current) => Math.min(3, current + 1));
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      const payload = vehicleSubmissionSchema.parse({ ...form, saleMode });
      await submitRequest({ data: payload });
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error al enviar la solicitud');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: '', phone: '', vehicleType: 'moto',
      brand: '', model: '', year: new Date().getFullYear(), displacement: '', mileage: 0,
      condition: '', askingPrice: 0, description: '', city: '', plate: '', photoUrls: [],
      propertyCardPaths: [], acceptedPrivacy: false,
    });
    setStep(1);
    setSubmitted(false);
    setSubmitError(null);
  };

  const modeCards = [
    {
      id: 'publicar_gratis' as SaleMode,
      icon: Globe,
      title: 'Publicar Mi Vehículo Gratis',
      desc: 'Publica tu moto o carro en nuestra web 100% gratuito. Los datos de compradores llegan exclusivamente a ClickMotores.',
       color: 'red',
    },
    {
      id: 'directa' as SaleMode,
      icon: DollarSign,
      title: 'Compra Directa (Efectivo)',
      desc: 'Compra inmediata con pago al instante. Recibimos tu vehículo y te pagamos en el acto.',
       color: 'red',
    },
    {
      id: 'consignacion' as SaleMode,
      icon: Handshake,
      title: 'Consignación Comercial',
      desc: 'Nos encargamos de la pauta, comprador y trámite. Tú solo recibes tu dinero al concretar.',
      color: 'red',
    },
  ];

  const steps = [
    { number: 1, label: 'Datos del vehículo' },
    { number: 2, label: 'Fotos y documentos' },
    { number: 3, label: 'Precio y contacto' },
  ];

  return (
    <div className="animate-fade-in bg-jg-body">
      <section className="border-b border-jg-silver bg-jg-surface py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <span className="badge border border-jg-red/30 bg-jg-red/10 text-jg-red">
            <Sparkles className="h-3.5 w-3.5" /> Publicación y venta segura
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold text-jg-text-dark sm:text-5xl">Vende tu vehículo</h1>
          <p className="mt-3 max-w-2xl text-jg-text-muted">Elige la modalidad y completa una solicitud guiada. Tus documentos se tratan de forma confidencial.</p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-3">
          {modeCards.map((card) => {
            const selected = saleMode === card.id;
            return (
              <article key={card.id} className={`card p-6 ${selected ? 'border-jg-red ring-2 ring-jg-red/15' : ''}`}>
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-jg-red/10 text-jg-red"><card.icon className="h-5 w-5" /></div>
                <h2 className="mt-4 text-lg font-bold text-jg-text-dark">{card.title}</h2>
                <p className="mt-2 min-h-16 text-sm text-jg-text-muted">{card.desc}</p>
                <Button type="button" variant={selected ? 'default' : 'outline'} className={`mt-5 w-full ${selected ? 'bg-jg-red text-primary-foreground hover:bg-jg-red-dark' : ''}`} onClick={() => chooseMode(card.id)}>
                  {selected ? <><Check className="h-4 w-4" /> Seleccionada</> : 'Elegir modalidad'}
                </Button>
              </article>
            );
          })}
        </div>

        <div ref={formRef} className="scroll-mt-24 pt-10">
          <section className="card overflow-hidden">
            <div className="border-b border-jg-silver bg-jg-surface-2 px-5 py-6 sm:px-8">
              <div className="grid grid-cols-3 gap-2" aria-label={`Paso ${step} de 3`}>
                {steps.map((item) => (
                  <div key={item.number} className="relative text-center">
                    <div className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold ${step >= item.number ? 'border-jg-red bg-jg-red text-primary-foreground' : 'border-jg-gray bg-jg-surface text-jg-text-muted'}`}>
                      {step > item.number ? <Check className="h-4 w-4" /> : item.number}
                    </div>
                    <p className={`mt-2 text-xs font-semibold sm:text-sm ${step >= item.number ? 'text-jg-text-dark' : 'text-jg-text-muted'}`}>{item.label}</p>
                    {item.number < 3 && <div className={`absolute left-[calc(50%+22px)] right-[calc(-50%+22px)] top-4 h-0.5 ${step > item.number ? 'bg-jg-red' : 'bg-jg-gray'}`} />}
                  </div>
                ))}
              </div>
            </div>

            {submitted ? (
              <div className="px-5 py-16 text-center sm:px-8">
                <CheckCircle2 className="mx-auto h-14 w-14 text-green-600" />
                <h2 className="mt-4 text-2xl font-bold text-jg-text-dark">Solicitud enviada</h2>
                <p className="mx-auto mt-2 max-w-lg text-sm text-jg-text-muted">La solicitud quedó guardada y el equipo de ClickMotores podrá revisarla desde el panel administrativo.</p>
                <Button type="button" variant="outline" className="mt-6" onClick={resetForm}>Enviar otra solicitud</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-5 sm:p-8">
                {step === 1 && (
                  <div className="space-y-5">
                    <div><h2 className="text-xl font-bold text-jg-text-dark">Datos del vehículo</h2><p className="mt-1 text-sm text-jg-text-muted">Cuéntanos qué vehículo quieres vender.</p></div>
                    <div>
                      <label className="label-field">Tipo de vehículo *</label>
                      <div className="grid grid-cols-2 gap-3">
                        {(['moto', 'carro'] as const).map((type) => (
                          <Button key={type} type="button" variant="outline" onClick={() => setForm({ ...form, vehicleType: type })} className={`h-12 ${form.vehicleType === type ? 'border-jg-red bg-jg-red/10 text-jg-red' : ''}`}>
                            {type === 'moto' ? <Bike /> : <Car />} {type === 'moto' ? 'Moto' : 'Carro'}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div><label className="label-field" htmlFor="brand">Marca *</label><input id="brand" maxLength={60} value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="input-field" placeholder="Ej. Mazda" /></div>
                      <div><label className="label-field" htmlFor="model">Modelo *</label><input id="model" maxLength={80} value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} className="input-field" placeholder="Ej. CX-30" /></div>
                      <div><label className="label-field" htmlFor="year">Año *</label><input id="year" type="number" min="1950" max={new Date().getFullYear() + 1} value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} className="input-field" /></div>
                      <div><label className="label-field" htmlFor="mileage">Kilometraje *</label><input id="mileage" type="number" min="0" max="2000000" value={form.mileage} onChange={(e) => setForm({ ...form, mileage: Number(e.target.value) })} className="input-field" /></div>
                      <div><label className="label-field" htmlFor="city">Ciudad *</label><input id="city" maxLength={80} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input-field" placeholder="Ej. Cali" /></div>
                      <div><label className="label-field" htmlFor="plate">Placa completa *</label><input id="plate" maxLength={10} value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '') })} className="input-field uppercase" placeholder="ABC123" /></div>
                      {form.vehicleType === 'moto' && <div><label className="label-field" htmlFor="displacement">Cilindraje</label><input id="displacement" maxLength={30} value={form.displacement} onChange={(e) => setForm({ ...form, displacement: e.target.value })} className="input-field" placeholder="Ej. 200 cc" /></div>}
                      <div><label className="label-field" htmlFor="condition">Estado</label><input id="condition" maxLength={120} value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} className="input-field" placeholder="Bueno, excelente…" /></div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-7">
                    <div><h2 className="text-xl font-bold text-jg-text-dark">Fotos y tarjeta de propiedad</h2><p className="mt-1 text-sm text-jg-text-muted">Sube mínimo {requiredPhotos} fotos del vehículo y ambos lados de la tarjeta.</p></div>
                    <div>
                      <label className="label-field"><Camera className="mr-1 inline h-4 w-4" /> Fotos del vehículo ({form.photoUrls.length}/{MAX_VEHICLE_PHOTOS})</label>
                      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {photoGuide.map((label, index) => <div key={label} className={`rounded-md border p-2 text-xs ${index < form.photoUrls.length ? 'border-green-500/30 bg-green-500/10 text-green-700' : 'border-jg-silver text-jg-text-muted'}`}>{index < form.photoUrls.length && <Check className="mr-1 inline h-3 w-3" />}{label}</div>)}
                      </div>
                      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleFileSelect} />
                      <Button type="button" variant="outline" className="h-14 w-full border-dashed" disabled={uploading || form.photoUrls.length >= MAX_VEHICLE_PHOTOS} onClick={() => fileInputRef.current?.click()}>
                        {uploading ? <Loader2 className="animate-spin" /> : <Upload />} Subir fotos
                      </Button>
                      {form.photoUrls.length > 0 && <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{form.photoUrls.map((url, index) => <div key={url} className="relative"><img src={url} alt={`Vehículo ${index + 1}`} className="h-28 w-full rounded-md object-cover" /><Button type="button" size="icon" variant="destructive" className="absolute right-1 top-1 h-7 w-7" aria-label="Eliminar foto" onClick={() => removePhoto(url)}><X /></Button></div>)}</div>}
                    </div>
                    <div className="rounded-lg border border-blue-500/25 bg-blue-500/5 p-4">
                      <div className="flex gap-3"><LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" /><div><h3 className="font-bold text-jg-text-dark">Documento confidencial y protegido</h3><p className="mt-1 text-sm text-jg-text-muted">La tarjeta de propiedad se guarda en un espacio privado y solo puede verla el administrador para validar la titularidad. Nunca se publica con el vehículo.</p></div></div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <input ref={propertyFrontInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => handlePropertyCard('front', event)} />
                        <input ref={propertyBackInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => handlePropertyCard('back', event)} />
                        <Button type="button" variant="outline" className="h-12 bg-jg-surface" disabled={uploadingCards} onClick={() => propertyFrontInputRef.current?.click()}>
                          {uploadingCards ? <Loader2 className="animate-spin" /> : form.propertyCardPaths[0] ? <Check /> : <FileLock2 />} {form.propertyCardPaths[0] ? 'Frente cargado' : 'Subir frente'}
                        </Button>
                        <Button type="button" variant="outline" className="h-12 bg-jg-surface" disabled={uploadingCards} onClick={() => propertyBackInputRef.current?.click()}>
                          {uploadingCards ? <Loader2 className="animate-spin" /> : form.propertyCardPaths[1] ? <Check /> : <FileLock2 />} {form.propertyCardPaths[1] ? 'Reverso cargado' : 'Subir reverso'}
                        </Button>
                      </div>
                      <p className="mt-2 text-xs text-jg-text-muted">Formatos JPG, PNG o WebP. Máximo 10 MB por imagen.</p>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div><h2 className="text-xl font-bold text-jg-text-dark">Precio y contacto</h2><p className="mt-1 text-sm text-jg-text-muted">Indica el precio esperado y cómo podemos contactarte.</p></div>
                    {isPublicar && <div className="rounded-lg border border-jg-yellow-dark/30 bg-jg-yellow/10 p-4"><div className="flex gap-3"><DollarSign className="h-5 w-5 text-jg-yellow-dark" /><div><p className="text-sm font-semibold text-jg-text-dark">Precio sugerido aproximado</p><p className="mt-1 text-2xl font-bold text-jg-text-dark">{suggestedPrice ? formatCOP(suggestedPrice) : 'Aún sin comparables'}</p><p className="mt-1 text-xs text-jg-text-muted">Referencia basada en vehículos similares del inventario y su antigüedad; no es un avalúo oficial.</p>{suggestedPrice && <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => setForm({ ...form, askingPrice: suggestedPrice })}>Usar este precio</Button>}</div></div></div>}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div><label className="label-field" htmlFor="askingPrice">Precio esperado (COP)</label><input id="askingPrice" type="number" min="0" max="10000000000" value={form.askingPrice || ''} onChange={(e) => setForm({ ...form, askingPrice: Number(e.target.value) })} className="input-field" placeholder="Ej. 45000000" /></div>
                      <div><label className="label-field" htmlFor="name">Nombre completo *</label><input id="name" maxLength={100} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Tu nombre" /></div>
                      <div><label className="label-field" htmlFor="phone">WhatsApp *</label><input id="phone" type="tel" maxLength={20} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" placeholder="300 123 4567" /></div>
                      <div className="sm:col-span-2"><label className="label-field" htmlFor="description">Comentarios</label><textarea id="description" maxLength={1200} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field resize-none" placeholder="Detalles importantes del vehículo" /></div>
                    </div>
                    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-jg-silver p-4"><input type="checkbox" checked={form.acceptedPrivacy} onChange={(e) => setForm({ ...form, acceptedPrivacy: e.target.checked })} className="mt-1 h-4 w-4 accent-jg-red" /><span className="text-sm text-jg-text-muted">Autorizo a JG Motors, operador de ClickMotores, a tratar mis datos para gestionar esta solicitud. Entiendo que la tarjeta de propiedad es confidencial y no será publicada.</span></label>
                  </div>
                )}

                {(stepError || submitError) && <div role="alert" className="mt-6 flex gap-2 rounded-lg border border-jg-red/30 bg-jg-red/10 p-3 text-sm text-jg-red"><AlertCircle className="h-5 w-5 shrink-0" />{stepError || submitError}</div>}
                <div className="mt-8 flex items-center justify-between border-t border-jg-silver pt-5">
                  <Button type="button" variant="outline" disabled={step === 1 || submitting} onClick={() => { setStepError(null); setStep((current) => Math.max(1, current - 1)); }}><ArrowLeft /> Atrás</Button>
                  {step < 3 ? <Button type="button" className="bg-jg-red text-primary-foreground hover:bg-jg-red-dark" onClick={continueStep}>Continuar <ArrowRight /></Button> : <Button type="submit" className="bg-jg-red text-primary-foreground hover:bg-jg-red-dark" disabled={submitting || !form.acceptedPrivacy}>{submitting ? <Loader2 className="animate-spin" /> : <Send />}{submitting ? 'Enviando…' : 'Enviar solicitud'}</Button>}
                </div>
              </form>
            )}
          </section>
        </div>

        <section className="py-14">
          <h2 className="text-center text-2xl font-bold text-jg-text-dark">¿Por qué elegir ClickMotores?</h2>
          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {['Publicación sin costo', 'Validación documental', 'Acompañamiento experto', 'Alcance nacional', 'Proceso transparente'].map((label) => <div key={label} className="card flex items-center gap-2 p-4 text-sm font-semibold text-jg-text-dark"><ShieldCheck className="h-5 w-5 shrink-0 text-jg-red" />{label}</div>)}
          </div>
        </section>
      </div>
    </div>
  );
}
