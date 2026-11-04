import { useEffect, useRef, useState } from 'react';
import { Camera, Loader2, X } from 'lucide-react';
import { uploadVehiclePhoto } from '@/jg/lib/supabase';
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES, MAX_VEHICLE_PHOTOS } from '@/jg/lib/vehicle-submission';

export type CmsVehicleFormValue = {
  marca: string;
  modelo: string;
  anio: number;
  kilometraje: string;
  ciudadPlaca: string;
  precio: string;
  atributos: string;
  fotos: string[];
  tipo: 'moto' | 'carro';
};

const INICIAL: CmsVehicleFormValue = {
  marca: '',
  modelo: '',
  anio: new Date().getFullYear(),
  kilometraje: '',
  ciudadPlaca: 'Yumbo',
  precio: '',
  atributos: '',
  fotos: [],
  tipo: 'moto',
};

const campo =
  'w-full min-w-0 rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-base text-white placeholder:text-gray-500 outline-none transition-colors focus:border-[#FF1E27] focus:ring-2 focus:ring-[#FF1E27]/40';

export function CmsVehicleForm({
  inicial,
  guardando,
  error,
  onGuardar,
  onCancelar,
}: {
  inicial?: Partial<CmsVehicleFormValue>;
  guardando: boolean;
  error: string;
  onGuardar: (valor: CmsVehicleFormValue) => void;
  onCancelar: () => void;
}) {
  const [form, setForm] = useState<CmsVehicleFormValue>({ ...INICIAL, ...inicial });
  const [subiendo, setSubiendo] = useState(false);
  const [errorFoto, setErrorFoto] = useState('');
  const inputFotos = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setForm({ ...INICIAL, ...inicial });
  }, [inicial]);

  const set = <K extends keyof CmsVehicleFormValue>(k: K, v: CmsVehicleFormValue[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleFotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivos = Array.from(e.target.files ?? []);
    if (archivos.length === 0) return;
    if (archivos.length > MAX_VEHICLE_PHOTOS - form.fotos.length) {
      setErrorFoto(`Puedes subir hasta ${MAX_VEHICLE_PHOTOS} fotos por vehículo.`);
      e.target.value = '';
      return;
    }
    const invalido = archivos.find(
      (f) =>
        !ALLOWED_IMAGE_TYPES.includes(f.type as (typeof ALLOWED_IMAGE_TYPES)[number]) ||
        f.size > MAX_UPLOAD_BYTES,
    );
    if (invalido) {
      setErrorFoto('Cada foto debe ser JPG, PNG o WebP y pesar máximo 10 MB.');
      e.target.value = '';
      return;
    }
    setErrorFoto('');
    setSubiendo(true);
    try {
      // Sube cada foto al Bucket "vehicle-photos" de Supabase Storage.
      for (const archivo of archivos) {
        const url = await uploadVehiclePhoto(archivo);
        setForm((p) => ({ ...p, fotos: [...p.fotos, url] }));
      }
    } catch (err) {
      setErrorFoto(err instanceof Error ? `No se pudo subir: ${err.message}` : 'No se pudo subir la foto.');
    } finally {
      setSubiendo(false);
      e.target.value = '';
    }
  };

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    onGuardar(form);
  };

  return (
    <form onSubmit={enviar} className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {(['moto', 'carro'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => set('tipo', t)}
            aria-pressed={form.tipo === t}
            className={`rounded-xl border px-4 py-3 text-base font-bold transition-colors ${
              form.tipo === t
                ? 'border-[#FF1E27] bg-[#FF1E27]/15 text-white'
                : 'border-white/10 bg-black/40 text-gray-400 hover:text-white'
            }`}
          >
            {t === 'moto' ? 'Moto' : 'Carro'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="text-sm text-gray-300">
          Marca *
          <input value={form.marca} onChange={(e) => set('marca', e.target.value)} required maxLength={80} placeholder="Yamaha, Honda, Mazda…" className={`${campo} mt-1.5`} />
        </label>
        <label className="text-sm text-gray-300">
          Modelo *
          <input value={form.modelo} onChange={(e) => set('modelo', e.target.value)} required maxLength={100} placeholder="MT-03, NMAX, 3 Touring…" className={`${campo} mt-1.5`} />
        </label>
        <label className="text-sm text-gray-300">
          Año *
          <input type="number" value={form.anio} onChange={(e) => set('anio', Number(e.target.value))} min={1900} max={new Date().getFullYear() + 2} required className={`${campo} mt-1.5`} />
        </label>
        <label className="text-sm text-gray-300">
          Kilometraje
          <input type="number" value={form.kilometraje} onChange={(e) => set('kilometraje', e.target.value)} min={0} placeholder="25000" className={`${campo} mt-1.5`} />
        </label>
        <label className="text-sm text-gray-300">
          Ciudad de la placa
          <input value={form.ciudadPlaca} onChange={(e) => set('ciudadPlaca', e.target.value)} maxLength={60} placeholder="Yumbo / Cali" className={`${campo} mt-1.5`} />
        </label>
        <label className="text-sm text-gray-300">
          Precio (COP) *
          <input type="number" value={form.precio} onChange={(e) => set('precio', e.target.value)} min={1} required placeholder="25000000" className={`${campo} mt-1.5`} />
        </label>
      </div>

      <label className="block text-sm text-gray-300">
        Atributos destacados <span className="text-gray-500">(ej. Único dueño, SOAT nuevo, llantas nuevas)</span>
        <textarea value={form.atributos} onChange={(e) => set('atributos', e.target.value)} rows={3} maxLength={600} placeholder="Único dueño · SOAT al día · Mantenimientos en concesionario…" className={`${campo} mt-1.5 resize-y`} />
      </label>

      <div>
        <span className="block text-sm text-gray-300">Fotos del vehículo</span>
        <input ref={inputFotos} type="file" accept={ALLOWED_IMAGE_TYPES.join(',')} multiple onChange={handleFotos} disabled={subiendo || form.fotos.length >= MAX_VEHICLE_PHOTOS} className="sr-only" />
        <div className="mt-1.5 flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => inputFotos.current?.click()} disabled={subiendo || form.fotos.length >= MAX_VEHICLE_PHOTOS} className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-base text-white hover:border-white/25 disabled:opacity-50">
            {subiendo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            {subiendo ? 'Subiendo…' : 'Cargar fotos'}
          </button>
          <span className="text-xs text-gray-500">JPG, PNG o WebP · máx. 10 MB · hasta {MAX_VEHICLE_PHOTOS} fotos.</span>
        </div>
        {errorFoto && <p className="mt-2 text-sm text-red-400">{errorFoto}</p>}
        {form.fotos.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {form.fotos.map((url, i) => (
              <div key={`${url}-${i}`} className="relative overflow-hidden rounded-xl border border-white/10">
                <img src={url} alt={`Foto ${i + 1}`} className="h-20 w-full object-cover" />
                <button type="button" aria-label={`Quitar foto ${i + 1}`} onClick={() => set('fotos', form.fotos.filter((_, idx) => idx !== i))} className="absolute right-1.5 top-1.5 rounded-full bg-black/70 p-1.5 text-white hover:bg-[#FF1E27]">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p role="alert" className="rounded-xl border border-[#FF1E27]/30 bg-[#FF1E27]/10 p-3 text-sm text-red-300">{error}</p>}

      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" onClick={onCancelar} className="rounded-xl bg-white/10 px-5 py-3 text-base font-semibold text-white hover:bg-white/15">Cancelar</button>
        <button type="submit" disabled={guardando || subiendo} className="rounded-xl bg-[#FF1E27] px-5 py-3 text-base font-bold text-white shadow-lg shadow-[#FF1E27]/30 hover:bg-[#D9111A] disabled:opacity-60">
          {guardando ? 'Guardando…' : 'Guardar vehículo'}
        </button>
      </div>
    </form>
  );
}
