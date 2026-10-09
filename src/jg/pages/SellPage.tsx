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
  const propertyInputRef = useRef<HTMLInputElement>(null);
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

    setUploading(true);
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

  const handlePropertyCards = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, 2);
    if (files.length !== 2) {
      setStepError('Selecciona dos imágenes: frente y reverso de la tarjeta.');
      return;
    }
    setUploadingCards(true);
    setStepError(null);
    try {
      const paths = await Promise.all(files.map(uploadPropertyCard));
      if (paths.some((path) => path == null)) throw new Error('No se pudieron cargar los documentos.');
      setForm((previous) => ({ ...previous, propertyCardPaths: paths.filter((path): path is string => path != null) }));
    } catch (error) {
      setStepError(error instanceof Error ? error.message : 'No se pudieron cargar los documentos.');
    } finally {
      setUploadingCards(false);
      if (propertyInputRef.current) propertyInputRef.current.value = '';
    }
  };

  const chooseMode = (mode: SaleMode) => {
    setSaleMode(mode);
    setStep(1);
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

  return (
    <div className="animate-fade-in">
      {/* Hero with banner overlay */}
      <div className="relative border-b border-jg-silver/50 bg-jg-carbon/50 py-12">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.pexels.com/photos/3806288/pexels-photo-3806288.jpeg?auto=compress&cs=tinysrgb&h=400&w=1200"
            alt="Vende tu vehículo"
            className="h-full w-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-jg-black via-jg-black/90 to-jg-black/60" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="badge bg-jg-red/15 text-jg-red border border-jg-red/30">
            <TrendingUp className="h-3.5 w-3.5" />
            Publica Gratis · Compra Directa · Consignación · Retomas
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold text-jg-text-dark sm:text-4xl md:text-5xl">
            Vende o Publica tu Vehículo
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-gray-600 sm:text-base">
            Elige la modalidad que más te conviene. Publicación gratuita, compra directa con pago
            inmediato, o consignación profesional con pauta multicanal.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-2.5">
            <Sparkles className="h-5 w-5 text-green-400" />
            <span className="font-display text-base font-bold text-green-400">
              ¡Publica tu vehículo GRATIS por tiempo limitado!
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Three Mode Cards */}
        <div className="mb-12 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {modeCards.map((card) => {
            const isActive = saleMode === card.id;
            const colorClasses: Record<string, string> = {
              blue: isActive ? 'border-blue-500/50 ring-1 ring-blue-500/30' : '',
              green: isActive ? 'border-green-500/50 ring-1 ring-green-500/30' : '',
              red: isActive ? 'border-jg-red/50 ring-1 ring-jg-red/30' : '',
            };
            const iconBg: Record<string, string> = {
              blue: 'bg-blue-500/15 text-blue-400',
              green: 'bg-green-500/15 text-green-400',
              red: 'bg-jg-red/15 text-jg-red',
            };
            const btnActive: Record<string, string> = {
              blue: 'border-blue-500 bg-blue-500/10 text-blue-400',
              green: 'border-green-500 bg-green-500/10 text-green-400',
              red: 'border-jg-red bg-jg-red/10 text-jg-red',
            };
            return (
              <div key={card.id} className={`card relative overflow-hidden p-7 transition-all ${colorClasses[card.color]}`}>
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${iconBg[card.color]}`}>
                  <card.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-jg-text-dark">{card.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{card.desc}</p>
                {card.id === 'consignacion' && (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-jg-silver/50 bg-jg-dark p-3">
                      <p className="text-xs text-gray-500">Pago inicial</p>
                      <p className="font-display text-lg font-bold text-jg-text-dark">$100.000</p>
                    </div>
                    <div className="rounded-lg border border-jg-silver/50 bg-jg-dark p-3">
                      <p className="text-xs text-gray-500">Comisión</p>
                      <p className="font-display text-lg font-bold text-jg-text-dark">3% / 5%</p>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => setSaleMode(card.id)}
                  className={`mt-5 w-full rounded-lg border py-2.5 text-sm font-semibold transition-all ${
                    isActive ? btnActive[card.color] : 'border-jg-silver text-gray-600 hover:text-jg-text-dark'
                  }`}
                >
                  {isActive ? 'Seleccionada' : 'Elegir'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Consignación details */}
        {saleMode === 'consignacion' && (
          <div className="mb-12 card p-6">
            <h3 className="font-display text-lg font-bold text-jg-text-dark">Detalles de la Consignación</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-lg border border-jg-silver/50 bg-jg-dark p-4">
                <DollarSign className="mt-0.5 h-5 w-5 shrink-0 text-green-400" />
                <div>
                  <p className="text-sm font-semibold text-jg-text-dark">Pago único inicial: $100.000 COP</p>
                  <p className="mt-1 text-xs text-gray-600">No reembolsable. Cubre pauta en web, MercadoLibre, TuCarro.com, Facebook e Instagram.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-jg-silver/50 bg-jg-dark p-4">
                <Handshake className="mt-0.5 h-5 w-5 shrink-0 text-jg-red" />
                <div>
                  <p className="text-sm font-semibold text-jg-text-dark">Comisión al vender</p>
                  <p className="mt-1 text-xs text-gray-600">3% carros / 5% motos. Puedes dejar el vehículo en custodia o seguir usándolo.</p>
                </div>
              </div>
            </div>
            <div className="mt-4 rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
              <p className="text-xs text-gray-600">
                <span className="font-semibold text-blue-400">Esquema de cierre:</span> 80% al vendedor, 20% + gastos de traspaso a ClickMotores (de ahí se descuenta la comisión). Firma notarial y traspaso incluidos.
              </p>
            </div>
          </div>
        )}

        {/* Process Steps */}
        <div className="mb-12">
          <h2 className="section-title text-center">¿Cómo funciona?</h2>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { step: '01', title: 'Evaluamos tu vehículo', desc: 'Inspeccionamos y validamos el estado real de tu moto o carro.' },
              { step: '02', title: 'Acordamos el precio', desc: 'Definimos un precio justo de mercado según el estado y la demanda.' },
              { step: '03', title: 'Publicamos y buscamos', desc: 'Pauta profesional en nuestros canales y red de compradores.' },
              { step: '04', title: 'Vendemos y traspasamos', desc: 'Concretamos la venta y gestionamos todo el trámite legal.' },
            ].map((item) => (
              <div key={item.step} className="card p-5">
                <span className="font-display text-3xl font-bold text-jg-red/30">{item.step}</span>
                <h3 className="mt-2 font-display text-base font-bold text-jg-text-dark">{item.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Aliados Section */}
        <div className="mb-12 card relative overflow-hidden p-8">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-blue-500/10 to-transparent" />
          <div className="relative z-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-jg-dark text-blue-400">
              <Users className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-xl font-bold text-jg-text-dark">¿Eres aliado del gremio automotriz?</h3>
              <p className="mt-1 text-sm text-gray-600">
                Exhibimos y vendemos carros de aliados comerciales del gremio. Contáctanos para publicar tus vehículos.
              </p>
            </div>
            <a
              href={whatsappLink('Hola, soy aliado del gremio y me gustaría publicar mis vehículos en ClickMotores.')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary shrink-0"
            >
              Contactar
            </a>
          </div>
        </div>

        {/* Form */}
        <div className="card overflow-hidden">
          <div className="border-b border-jg-silver/50 px-6 py-5">
            <h2 className="font-display text-xl font-bold text-jg-text-dark">
              {isPublicar ? 'Publica tu vehículo gratis' : saleMode === 'directa' ? 'Solicita tu compra directa' : 'Solicita tu consignación'}
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Completa los datos de tu vehículo. Se enviará por WhatsApp a {WHATSAPP_DISPLAY}.{' '}
              {isCommercial ? (
                <span className="font-semibold text-blue-400">Estado: Consulta Comercial / Pendiente de Valoración</span>
              ) : (
                <span className="font-semibold text-yellow-400">Estado: Pendiente de Aprobación</span>
              )}
            </p>
          </div>

          {submitted ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/15">
                <CheckCircle2 className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="font-display text-xl font-bold text-jg-text-dark">¡Solicitud enviada!</h3>
              <p className="mt-2 max-w-md text-sm text-gray-600">
                {isCommercial
                  ? 'Hemos registrado tu solicitud como Consulta Comercial / Pendiente de Valoración. Se notificó al administrador. Te contactaremos pronto.'
                  : 'Hemos registrado tu publicación como Pendiente de Aprobación. Se notificó al administrador. Te contactaremos pronto.'}
              </p>
              <button onClick={resetForm} className="mt-6 btn-secondary">
                Enviar otra solicitud
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              {/* Personal Info */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="label-field">Nombre completo *</label>
                  <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Tu nombre" className="input-field" />
                </div>
                <div>
                  <label className="label-field">Teléfono / WhatsApp *</label>
                  <input type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Ej. 300 123 4567" className="input-field" />
                </div>
                <div>
                  <label className="label-field">Correo (opcional)</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="tu@correo.com" className="input-field" />
                </div>
              </div>

              {/* Vehicle Type */}
              <div>
                <label className="label-field">Tipo de vehículo *</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setForm({ ...form, vehicleType: 'moto' })} className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-all ${form.vehicleType === 'moto' ? 'border-jg-red bg-jg-red/10 text-jg-red' : 'border-jg-silver text-gray-400 hover:text-white'}`}>
                    <Bike className="h-4 w-4" /> Moto
                  </button>
                  <button type="button" onClick={() => setForm({ ...form, vehicleType: 'carro' })} className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-all ${form.vehicleType === 'carro' ? 'border-jg-red bg-jg-red/10 text-jg-red' : 'border-jg-silver text-gray-400 hover:text-white'}`}>
                    <Car className="h-4 w-4" /> Carro
                  </button>
                </div>
              </div>

              {/* Brand + Model */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="label-field">Marca *</label>
                  <input type="text" required value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Ej. Yamaha" className="input-field" />
                </div>
                <div>
                  <label className="label-field">Modelo *</label>
                  <input type="text" required value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="Ej. FZ 2.0" className="input-field" />
                </div>
              </div>

              {/* Year + Displacement + Mileage */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="label-field">Año *</label>
                  <input type="number" required value={form.year} onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) || 0 })} className="input-field" />
                </div>
                {form.vehicleType === 'moto' && (
                  <div>
                    <label className="label-field">Cilindraje</label>
                    <input type="text" value={form.displacement} onChange={(e) => setForm({ ...form, displacement: e.target.value })} placeholder="Ej. 250cc" className="input-field" />
                  </div>
                )}
                <div>
                  <label className="label-field">Kilometraje</label>
                  <input type="number" value={form.mileage} onChange={(e) => setForm({ ...form, mileage: parseInt(e.target.value) || 0 })} className="input-field" />
                </div>
              </div>

              {/* Condition + Price */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="label-field">Estado del vehículo</label>
                  <input type="text" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} placeholder="Ej. Excelente, bueno, necesita detalles" className="input-field" />
                </div>
                <div>
                  <label className="label-field">Precio solicitado (COP)</label>
                  <input type="number" value={form.askingPrice} onChange={(e) => setForm({ ...form, askingPrice: parseInt(e.target.value) || 0 })} placeholder="Ej. 13500000" className="input-field" />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="label-field">Descripción</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Cuéntanos sobre tu vehículo: accesorios, mejoras, estado de documentos, etc." rows={3} className="input-field resize-none" />
              </div>

              {/* Instagram URL */}
              <div>
                <label className="label-field flex items-center gap-1.5">
                  <Instagram className="h-3.5 w-3.5" />
                  Enlace de Video/Reel de Instagram (opcional)
                </label>
                <input type="url" value={form.instagramUrl} onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })} placeholder="https://www.instagram.com/reel/..." className="input-field" />
              </div>

              {/* Photo Upload with Dynamic Guide */}
              <div>
                <label className="label-field flex items-center gap-1.5">
                  <Camera className="h-3.5 w-3.5" />
                  Fotos del vehículo (máximo {MAX_PHOTOS} fotos)
                </label>

                <div className="mb-3 rounded-lg border border-jg-silver/50 bg-jg-dark p-4">
                  <p className="mb-2 text-xs font-semibold text-gray-600">
                    Guía de fotos {form.vehicleType === 'moto' ? 'para Moto' : 'para Carro'}:
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                    {photoGuide.map((label, idx) => {
                      const hasPhoto = idx < form.photoUrls.length;
                      return (
                        <div key={idx} className={`flex items-center gap-1.5 rounded px-2 py-1 text-xs ${hasPhoto ? 'bg-green-500/10 text-green-400' : 'text-gray-500'}`}>
                          {hasPhoto ? <CheckCircle2 className="h-3 w-3 shrink-0" /> : <span className="font-bold text-gray-600">{idx + 1}.</span>}
                          <span className={hasPhoto ? 'line-through' : ''}>{label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  max={MAX_PHOTOS}
                  onChange={handleFileSelect}
                  disabled={form.photoUrls.length >= MAX_PHOTOS || uploading}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={form.photoUrls.length >= MAX_PHOTOS || uploading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-jg-silver bg-jg-dark py-4 text-sm text-gray-600 transition-all hover:border-jg-red/50 hover:text-jg-text-dark disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Upload className="h-5 w-5" />
                  )}
                  {form.photoUrls.length >= MAX_PHOTOS
                    ? `Máximo de ${MAX_PHOTOS} fotos alcanzado`
                    : `Subir fotos (${form.photoUrls.length}/${MAX_PHOTOS})`}
                </button>

                {form.photoUrls.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {form.photoUrls.map((url, idx) => (
                      <div key={idx} className="relative group">
                        <img src={url} alt={`Foto ${idx + 1}`} className="h-24 w-full rounded-lg object-cover" />
                        <span className="absolute bottom-1 left-1 rounded bg-jg-black/70 px-1.5 py-0.5 text-[10px] text-white">
                          {photoGuide[idx] || `Foto ${idx + 1}`}
                        </span>
                        <button type="button" onClick={() => removePhoto(url)} className="absolute right-1 top-1 rounded bg-jg-black/70 p-1 text-jg-red opacity-0 transition-opacity group-hover:opacity-100">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {submitError && (
                <div className="flex items-center gap-3 rounded-lg border border-jg-red/30 bg-jg-red/10 px-4 py-3 text-sm text-jg-red">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  {submitError}
                </div>
              )}

              <div className="flex flex-col gap-3 border-t border-jg-silver/50 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-gray-500">
                  Al enviar se abrirán WhatsApp ({WHATSAPP_DISPLAY}) y tu correo.{' '}
                  {isCommercial ? (
                    <span className="text-blue-400">Estado: Consulta Comercial / Pendiente de Valoración</span>
                  ) : (
                    <span className="text-yellow-400">Estado: Pendiente de Aprobación</span>
                  )}
                </p>
                <button type="submit" disabled={submitting || uploading} className="btn-primary disabled:opacity-50">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {submitting ? 'Enviando...' : 'Enviar solicitud'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
