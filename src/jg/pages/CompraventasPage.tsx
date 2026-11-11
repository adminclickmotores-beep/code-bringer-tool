import { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle, CheckCircle2, Copy, Eye, EyeOff, ExternalLink, FileText, ImageIcon, Loader2, Lock, Mail,
  Megaphone, Share2, Store, Trash2, Users,
} from 'lucide-react';
import { useJg } from '@/jg/JgApp';
import { useSeo } from '@/lib/seo';
import {
  formatCOP, fuelOptions, supabase, uploadVehiclePhoto, whatsappLink, type Vehicle,
} from '@/jg/lib/supabase';
import { listingStatus, planWhatsappMessage, PUBLICATION_PLANS } from '@/jg/lib/plans';
import { abrirCatalogoImprimible } from '@/jg/lib/catalogo-imprimible';
import {
  createDealer, dealerCatalogUrl, deleteDealerVehicle, fetchDealerVehicles, fetchMyDealer,
  publishDealerVehicle, setDealerVehicleStatus, updateDealer, uploadDealerLogo,
  type DealerProfile,
} from '@/jg/lib/dealers';

const MIN_FOTOS = 3;
const MAX_FOTOS = 8;

function mensajeError(e: unknown, defecto: string): string {
  if (e instanceof Error && e.message) return e.message;
  if (typeof e === 'object' && e !== null && 'message' in e) {
    const m = (e as { message?: unknown }).message;
    if (typeof m === 'string' && m) return m;
  }
  return defecto;
}

function Aviso({ tipo, children }: { tipo: 'error' | 'ok'; children: React.ReactNode }) {
  const clases = tipo === 'error'
    ? 'border-jg-red/30 bg-jg-red/10 text-jg-red'
    : 'border-green-500/30 bg-green-500/10 text-green-400';
  return (
    <div className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${clases}`}>
      {tipo === 'error' ? <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />}
      <span className="min-w-0 break-words">{children}</span>
    </div>
  );
}

/* ---------- Ingreso / registro ---------- */
function AccesoForm({ onListo }: { onListo: () => void }) {
  const [modo, setModo] = useState<'registro' | 'ingreso'>('registro');
  const [email, setEmail] = useState('');
  const [clave, setClave] = useState('');
  const [ver, setVer] = useState(false);
  const [recordar, setRecordar] = useState(true);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const aplicarRecordarme = () => {
    try {
      localStorage.setItem('jg-remember-me', recordar ? '1' : '0');
      if (!recordar) {
        const claves: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith('sb-')) claves.push(k);
        }
        claves.forEach((k) => {
          const v = localStorage.getItem(k);
          if (v !== null) sessionStorage.setItem(k, v);
          localStorage.removeItem(k);
        });
        sessionStorage.setItem('jg-session-only', '1');
      } else {
        sessionStorage.removeItem('jg-session-only');
      }
    } catch {
      /* almacenamiento no disponible */
    }
  };

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!email.trim() || clave.length < 6) {
      setError('Escribe tu correo y una contraseña de mínimo 6 caracteres.');
      return;
    }
    setCargando(true);
    try {
      if (modo === 'registro') {
        const { data, error: err } = await supabase.auth.signUp({ email: email.trim(), password: clave });
        if (err) throw err;
        if (!data?.session) {
          setInfo('Te enviamos un correo para confirmar tu cuenta. Revisa tu bandeja de entrada (y la carpeta de spam) y luego ingresa.');
          setModo('ingreso');
          return;
        }
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password: clave });
        if (err) throw err;
      }
      aplicarRecordarme();
      onListo();
    } catch (err) {
      const m = mensajeError(err, 'No pudimos continuar. Intenta de nuevo.');
      setError(m.includes('Invalid login credentials') ? 'Correo o contraseña incorrectos.' : m.includes('already registered') ? 'Ese correo ya tiene cuenta. Ingresa con tu contraseña.' : m);
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={enviar} className="card space-y-4 p-5 sm:p-6">
      <div className="grid grid-cols-2 gap-2">
        {(['registro', 'ingreso'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => { setModo(m); setError(null); }}
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${modo === m ? 'border-jg-red bg-jg-red/10 text-jg-red' : 'border-jg-silver text-gray-400'}`}
          >
            {m === 'registro' ? 'Crear cuenta' : 'Ya tengo cuenta'}
          </button>
        ))}
      </div>
      {error && <Aviso tipo="error">{error}</Aviso>}
      {info && <Aviso tipo="ok">{info}</Aviso>}
      <div>
        <label className="label-field">Correo electrónico</label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className="input-field pl-11" placeholder="tucompraventa@correo.com" />
        </div>
      </div>
      <div>
        <label className="label-field">Contraseña (mínimo 6 caracteres)</label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type={ver ? 'text' : 'password'}
            required
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            autoComplete={modo === 'registro' ? 'new-password' : 'current-password'}
            className="input-field pl-11 pr-11"
          />
          <button type="button" onClick={() => setVer((v) => !v)} aria-label={ver ? 'Ocultar contraseña' : 'Mostrar contraseña'} className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 hover:text-jg-text-dark">
            {ver ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <label className="flex cursor-pointer items-center gap-2 text-gray-400">
          <input type="checkbox" checked={recordar} onChange={(e) => setRecordar(e.target.checked)} className="h-4 w-4 accent-red-600" />
          Recuérdame
        </label>
        <a href="/reset-password" className="font-medium text-jg-red hover:underline">¿Olvidaste tu contraseña?</a>
      </div>
      <button type="submit" disabled={cargando} className="btn-primary w-full disabled:opacity-50">
        {cargando && <Loader2 className="h-4 w-4 animate-spin" />}
        {modo === 'registro' ? 'Crear mi cuenta gratis' : 'Ingresar'}
      </button>
    </form>
  );
}

/* ---------- Perfil del negocio ---------- */
function PerfilForm({
  dealer, userId, onGuardado,
}: { dealer: DealerProfile | null; userId: string; onGuardado: (d: DealerProfile) => void }) {
  const [nombre, setNombre] = useState(dealer?.business_name ?? '');
  const [celular, setCelular] = useState(dealer?.phone ?? '');
  const [ciudad, setCiudad] = useState(dealer?.city ?? '');
  const [descripcion, setDescripcion] = useState(dealer?.description ?? '');
  const [logoUrl, setLogoUrl] = useState<string | null>(dealer?.logo_url ?? null);
  const [subiendoLogo, setSubiendoLogo] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const elegirLogo = async (lista: FileList | null) => {
    const archivo = lista?.[0];
    if (!archivo) return;
    setError(null);
    setSubiendoLogo(true);
    try {
      setLogoUrl(await uploadDealerLogo(archivo));
    } catch (err) {
      setError(mensajeError(err, 'No pudimos subir el logo. Intenta de nuevo.'));
    } finally {
      setSubiendoLogo(false);
    }
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOk(false);
    const tel = celular.replace(/\D/g, '');
    if (nombre.trim().length < 2) return setError('Escribe el nombre de tu negocio.');
    if (tel.length !== 10) return setError('Escribe un celular de 10 dígitos (ej. 3001234567).');
    setCargando(true);
    try {
      const datos = { logo_url: logoUrl, business_name: nombre, phone: tel, city: ciudad, description: descripcion };
      const d = dealer ? await updateDealer(dealer.id, datos) : await createDealer(userId, datos);
      setOk(true);
      onGuardado(d);
    } catch (err) {
      setError(mensajeError(err, 'No pudimos guardar el perfil. Intenta de nuevo.'));
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={guardar} className="card space-y-4 p-5 sm:p-6">
      <h2 className="font-display text-lg font-bold text-jg-text-dark">
        {dealer ? 'Datos de tu negocio' : 'Cuéntanos de tu compraventa'}
      </h2>
      {error && <Aviso tipo="error">{error}</Aviso>}
      {ok && <Aviso tipo="ok">Datos guardados.</Aviso>}
      <div className="flex items-center gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-jg-silver bg-white/5">
          {logoUrl ? <img src={logoUrl} alt="Logo de tu negocio" className="h-full w-full object-contain" /> : <Store className="h-8 w-8 text-gray-500" />}
        </div>
        <div className="min-w-0 flex-1">
          <label className="label-field">Logo de tu compraventa (opcional)</label>
          <input type="file" accept="image/*" disabled={subiendoLogo} onChange={(e) => { void elegirLogo(e.target.files); e.target.value = ''; }} className="input-field" />
          {subiendoLogo && <p className="mt-1 text-xs text-gray-500">Subiendo logo...</p>}
          {logoUrl && !subiendoLogo && (
            <button type="button" onClick={() => setLogoUrl(null)} className="mt-1 text-xs text-jg-red">Quitar logo</button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label-field">Nombre del negocio</label>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={80} className="input-field" placeholder="Ej. Autos del Valle" />
        </div>
        <div>
          <label className="label-field">Celular / WhatsApp de contacto</label>
          <input value={celular} onChange={(e) => setCelular(e.target.value)} inputMode="tel" maxLength={14} className="input-field" placeholder="3001234567" />
        </div>
        <div className="sm:col-span-2">
          <label className="label-field">Ciudad</label>
          <input value={ciudad} onChange={(e) => setCiudad(e.target.value)} maxLength={80} className="input-field" placeholder="Cali" />
        </div>
        <div className="sm:col-span-2">
          <label className="label-field">Descripción corta (opcional)</label>
          <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} maxLength={500} rows={3} className="input-field" placeholder="Años de experiencia, tipo de vehículos que vendes..." />
        </div>
      </div>
      <button type="submit" disabled={cargando} className="btn-primary w-full disabled:opacity-50 sm:w-auto">
        {cargando && <Loader2 className="h-4 w-4 animate-spin" />}
        {dealer ? 'Guardar cambios' : 'Crear mi catálogo'}
      </button>
    </form>
  );
}

/* ---------- Publicar un vehículo ---------- */
function PublicarForm({ dealer, onPublicado }: { dealer: DealerProfile; onPublicado: () => void }) {
  const [tipo, setTipo] = useState<'carro' | 'moto'>('carro');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [anio, setAnio] = useState('');
  const [precio, setPrecio] = useState('');
  const [km, setKm] = useState('');
  const [caja, setCaja] = useState('Mecánica');
  const [combustible, setCombustible] = useState('Gasolina');
  const [ciudad, setCiudad] = useState(dealer.city ?? '');
  const [descripcion, setDescripcion] = useState('');
  const [fotos, setFotos] = useState<File[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const soloDigitos = (s: string) => s.replace(/\D/g, '');

  const agregarFotos = (lista: FileList | null) => {
    if (!lista) return;
    const nuevas = Array.from(lista).filter((f) => f.type.startsWith('image/'));
    setFotos((prev) => [...prev, ...nuevas].slice(0, MAX_FOTOS));
  };

  const publicar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOk(false);
    const year = Number(anio);
    const price = Number(soloDigitos(precio));
    const mileage = Number(soloDigitos(km) || '0');
    if (marca.trim().length < 2) return setError('Escribe la marca.');
    if (!modelo.trim()) return setError('Escribe el modelo.');
    if (!Number.isInteger(year) || year < 1950 || year > new Date().getFullYear() + 1) return setError('Escribe un año válido.');
    if (!price) return setError('Escribe el precio.');
    if (fotos.length < MIN_FOTOS) return setError(`Sube mínimo ${MIN_FOTOS} fotos del vehículo.`);
    setCargando(true);
    try {
      const urls: string[] = [];
      for (const f of fotos) urls.push(await uploadVehiclePhoto(f));
      await publishDealerVehicle(dealer, {
        type: tipo, brand: marca, model: modelo, year, price, mileage,
        fuel: combustible, transmission: tipo === 'carro' ? caja : '',
        ciudad, description: descripcion, image_urls: urls,
      });
      setOk(true);
      setMarca(''); setModelo(''); setAnio(''); setPrecio(''); setKm(''); setDescripcion(''); setFotos([]);
      onPublicado();
    } catch (err) {
      setError(mensajeError(err, 'No pudimos publicar el vehículo. Intenta de nuevo.'));
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={publicar} className="card space-y-4 p-5 sm:p-6">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold text-jg-text-dark">
        <Megaphone className="h-5 w-5 text-jg-red" /> Publicar un vehículo (gratis)
      </h2>
      {error && <Aviso tipo="error">{error}</Aviso>}
      {ok && <Aviso tipo="ok">¡Vehículo publicado! Ya aparece en tu catálogo y en el inventario de ClickMotores.</Aviso>}
      <div className="grid grid-cols-2 gap-2">
        {(['carro', 'moto'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { setTipo(t); setCombustible('Gasolina'); }}
            className={`rounded-lg border px-3 py-2 text-sm font-medium ${tipo === t ? 'border-jg-red bg-jg-red/10 text-jg-red' : 'border-jg-silver text-gray-400'}`}
          >
            {t === 'carro' ? 'Carro' : 'Moto'}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div><label className="label-field">Marca</label><input value={marca} onChange={(e) => setMarca(e.target.value)} maxLength={60} className="input-field" placeholder="Mazda" /></div>
        <div><label className="label-field">Modelo</label><input value={modelo} onChange={(e) => setModelo(e.target.value)} maxLength={80} className="input-field" placeholder="CX-30 Touring" /></div>
        <div><label className="label-field">Año</label><input value={anio} onChange={(e) => setAnio(soloDigitos(e.target.value).slice(0, 4))} inputMode="numeric" className="input-field" placeholder="2021" /></div>
        <div>
          <label className="label-field">Precio (COP)</label>
          <input value={precio} onChange={(e) => setPrecio(soloDigitos(e.target.value))} inputMode="numeric" className="input-field" placeholder="65000000" />
          {precio && <p className="mt-1 text-xs text-gray-500">{formatCOP(Number(precio))}</p>}
        </div>
        <div><label className="label-field">Kilometraje</label><input value={km} onChange={(e) => setKm(soloDigitos(e.target.value))} inputMode="numeric" className="input-field" placeholder="45000" /></div>
        <div>
          <label className="label-field">Combustible</label>
          <select value={combustible} onChange={(e) => setCombustible(e.target.value)} className="select-field">
            {fuelOptions(tipo).map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        {tipo === 'carro' && (
          <div>
            <label className="label-field">Caja</label>
            <select value={caja} onChange={(e) => setCaja(e.target.value)} className="select-field">
              <option>Mecánica</option>
              <option>Automática</option>
            </select>
          </div>
        )}
        <div><label className="label-field">Ciudad</label><input value={ciudad} onChange={(e) => setCiudad(e.target.value)} maxLength={80} className="input-field" /></div>
        <div className="sm:col-span-2">
          <label className="label-field">Descripción (opcional)</label>
          <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} maxLength={1200} rows={3} className="input-field" placeholder="Único dueño, papeles al día, mantenimiento en concesionario..." />
        </div>
      </div>
      <div>
        <label className="label-field">Fotos (mínimo {MIN_FOTOS}, máximo {MAX_FOTOS})</label>
        <input type="file" accept="image/*" multiple onChange={(e) => { agregarFotos(e.target.files); e.target.value = ''; }} className="input-field" />
        {fotos.length > 0 && (
          <ul className="mt-2 space-y-1">
            {fotos.map((f, i) => (
              <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-2 text-xs text-gray-400">
                <span className="min-w-0 truncate">{f.name}</span>
                <button type="button" onClick={() => setFotos((p) => p.filter((_, j) => j !== i))} className="shrink-0 text-jg-red">Quitar</button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <button type="submit" disabled={cargando} className="btn-primary w-full disabled:opacity-50 sm:w-auto">
        {cargando && <Loader2 className="h-4 w-4 animate-spin" />}
        {cargando ? 'Publicando...' : 'Publicar vehículo'}
      </button>
    </form>
  );
}

/* ---------- Mis vehículos ---------- */
function MisVehiculos({ vehiculos, cargando, onCambio }: { vehiculos: Vehicle[]; cargando: boolean; onCambio: () => void }) {
  const [trabajando, setTrabajando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cambiarEstado = async (v: Vehicle, nuevo: 'disponible' | 'no_disponible' | 'vendido') => {
    if (v.status === nuevo) return;
    setTrabajando(v.id);
    setError(null);
    try {
      await setDealerVehicleStatus(v.id, nuevo);
      onCambio();
    } catch (err) {
      setError(mensajeError(err, 'No pudimos actualizar el vehículo.'));
    } finally {
      setTrabajando(null);
    }
  };

  const eliminar = async (v: Vehicle) => {
    if (!window.confirm(`¿Eliminar ${v.title}? Esta acción no se puede deshacer.`)) return;
    setTrabajando(v.id);
    setError(null);
    try {
      await deleteDealerVehicle(v.id);
      onCambio();
    } catch (err) {
      setError(mensajeError(err, 'No pudimos eliminar el vehículo.'));
    } finally {
      setTrabajando(null);
    }
  };

  return (
    <div className="card space-y-4 p-5 sm:p-6">
      <h2 className="font-display text-lg font-bold text-jg-text-dark">Mis vehículos ({vehiculos.length})</h2>
      {error && <Aviso tipo="error">{error}</Aviso>}
      {cargando ? (
        <p className="text-sm text-gray-400">Cargando...</p>
      ) : vehiculos.length === 0 ? (
        <p className="text-sm text-gray-400">Aún no has publicado vehículos. Usa el formulario de arriba.</p>
      ) : (
        <ul className="divide-y divide-jg-silver/30">
          {vehiculos.map((v) => {
            const foto = v.image_urls?.[0];
            return (
              <li key={v.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/5">
                    {foto ? <img src={foto} alt={v.title} className="h-full w-full object-cover" /> : <ImageIcon className="h-5 w-5 text-gray-500" />}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-jg-text-dark">{v.title}</p>
                    <p className="text-sm text-jg-red">{formatCOP(v.price)}</p>
                    {(listingStatus(v) === 'por_vencer' || listingStatus(v) === 'expirado') && (
                      <a
                        href={whatsappLink(planWhatsappMessage(PUBLICATION_PLANS[0] ?? { id: 'renovacion_simple', name: 'Renovación Simple', days: 30, price: 20000, featured: false }, v.owner_name ?? '', v.placa_completa ?? ''))}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-0.5 inline-block text-xs font-semibold text-yellow-500 underline"
                      >
                        {listingStatus(v) === 'expirado' ? 'Anuncio vencido: renovar (desde $20.000)' : 'Por vencer: renovar (desde $20.000)'}
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div role="group" aria-label="Estado del vehículo" className="grid grid-cols-3 overflow-hidden rounded-lg border border-jg-silver text-xs font-semibold">
                    {([['disponible', 'Disponible'], ['no_disponible', 'Separado'], ['vendido', 'Vendido']] as const).map(([valor, etiqueta]) => (
                      <button
                        key={valor}
                        type="button"
                        disabled={trabajando === v.id}
                        onClick={() => void cambiarEstado(v, valor)}
                        className={`px-3 py-2 transition-colors disabled:opacity-50 ${v.status === valor ? (valor === 'disponible' ? 'bg-green-600 text-white' : valor === 'vendido' ? 'bg-gray-600 text-white' : 'bg-yellow-600 text-white') : 'text-gray-400 hover:text-white'}`}
                      >
                        {etiqueta}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => void eliminar(v)} disabled={trabajando === v.id} aria-label="Eliminar vehículo" className="rounded-lg border border-jg-silver p-2 text-gray-400 hover:text-jg-red disabled:opacity-50">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ---------- Enlace para compartir ---------- */
function CompartirCatalogo({ dealer, vehiculos }: { dealer: DealerProfile; vehiculos: Vehicle[] }) {
  const url = dealerCatalogUrl(dealer.slug);
  const [copiado, setCopiado] = useState(false);
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2000);
    } catch {
      window.prompt('Copia tu enlace:', url);
    }
  };
  const texto = `Mira el catálogo de ${dealer.business_name}: ${url}`;
  return (
    <div className="card space-y-3 border-jg-red/40 p-5 sm:p-6">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold text-jg-text-dark">
        <Share2 className="h-5 w-5 text-jg-red" /> Tu catálogo para compartir
      </h2>
      <p className="text-sm text-gray-400">Envía este enlace a tus clientes: solo verán los vehículos de {dealer.business_name}.</p>
      <p className="text-xs text-gray-500">Varias personas de tu equipo pueden entrar con el mismo correo y contraseña, desde distintos celulares, y publicar al mismo tiempo.</p>
      <div className="break-all rounded-lg border border-jg-silver bg-black/30 px-3 py-2 text-sm text-jg-text-dark">{url}</div>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => void copiar()} className="btn-secondary !py-2.5">
          {copiado ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copiado ? 'Enlace copiado' : 'Copiar enlace'}
        </button>
        <a href={`https://wa.me/?text=${encodeURIComponent(texto)}`} target="_blank" rel="noopener noreferrer" className="btn-primary !py-2.5">
          Enviar por WhatsApp
        </a>
        <button
          type="button"
          onClick={() => {
            const ok = abrirCatalogoImprimible({ titulo: dealer.business_name, logoUrl: dealer.logo_url, contacto: dealer.phone, ciudad: dealer.city, vehiculos });
            if (!ok) window.alert('Tu navegador bloqueó la ventana. Permite las ventanas emergentes e intenta de nuevo.');
          }}
          className="btn-secondary !py-2.5"
        >
          <FileText className="h-4 w-4" /> Generar catálogo PDF
        </button>
        <a href={`/tienda/${dealer.slug}`} className="btn-secondary !py-2.5">
          <ExternalLink className="h-4 w-4" /> Ver mi catálogo
        </a>
      </div>
    </div>
  );
}

/* ---------- Página ---------- */
export function CompraventasPage() {
  useSeo('/compraventas');
  const j = useJg();
  const userId = j.session?.user.id ?? null;
  const [dealer, setDealer] = useState<DealerProfile | null>(null);
  const [cargandoPerfil, setCargandoPerfil] = useState(true);
  const [vehiculos, setVehiculos] = useState<Vehicle[]>([]);
  const [cargandoVeh, setCargandoVeh] = useState(false);
  const [editando, setEditando] = useState(false);
  const { loadVehicles } = j;

  useEffect(() => {
    if (j.authLoading) return;
    if (!userId) {
      setDealer(null);
      setCargandoPerfil(false);
      return;
    }
    let vivo = true;
    setCargandoPerfil(true);
    fetchMyDealer(userId)
      .then((d) => { if (vivo) setDealer(d); })
      .catch(() => { /* sin perfil o sin conexión */ })
      .finally(() => { if (vivo) setCargandoPerfil(false); });
    return () => { vivo = false; };
  }, [userId, j.authLoading]);

  const recargar = useCallback(async () => {
    if (!dealer) return;
    setCargandoVeh(true);
    try {
      setVehiculos(await fetchDealerVehicles(dealer.id));
    } catch {
      setVehiculos([]);
    } finally {
      setCargandoVeh(false);
    }
    void loadVehicles().catch(() => undefined);
  }, [dealer, loadVehicles]);

  useEffect(() => {
    if (dealer) void recargar();
  }, [dealer, recargar]);

  const beneficios = [
    { icono: Megaphone, titulo: 'Publica gratis', texto: 'Sube tus carros y motos sin costo y sin vencimiento.' },
    { icono: Store, titulo: 'Tu propio catálogo', texto: 'Con el nombre de tu negocio y tu celular de contacto.' },
    { icono: Users, titulo: 'Compártelo', texto: 'Envía un solo enlace a tus clientes por WhatsApp.' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="border-b border-jg-silver/50 bg-jg-carbon/50 py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-bold text-jg-text-dark sm:text-4xl">Para compraventas</h1>
          <p className="mt-2 text-sm text-gray-400">
            Publica tus vehículos gratis en ClickMotores y comparte tu propio catálogo con tus clientes.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {beneficios.map((b) => (
              <div key={b.titulo} className="rounded-xl border border-jg-silver/40 bg-black/20 p-4">
                <b.icono className="h-5 w-5 text-jg-red" />
                <p className="mt-2 text-sm font-semibold text-jg-text-dark">{b.titulo}</p>
                <p className="mt-1 text-xs text-gray-400">{b.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {j.authLoading || cargandoPerfil ? (
          <p className="text-sm text-gray-400">Cargando...</p>
        ) : !j.session ? (
          <AccesoForm onListo={j.refreshSession} />
        ) : !dealer || editando ? (
          <PerfilForm
            dealer={dealer}
            userId={j.session.user.id}
            onGuardado={(d) => { setDealer(d); setEditando(false); }}
          />
        ) : (
          <>
            {!dealer.aprobada && (
              <div className="rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-4">
                <p className="font-semibold text-yellow-300">Tu cuenta está pendiente de aprobación</p>
                <p className="mt-1 text-sm text-gray-300">
                  Ya puedes ver tu catálogo, pero para publicar tus vehículos el administrador debe aprobar tu compraventa.
                </p>
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                {dealer.logo_url && <img src={dealer.logo_url} alt="" className="h-12 w-12 shrink-0 rounded-lg object-contain" />}
                <div className="min-w-0">
                <p className="truncate font-display text-xl font-bold text-jg-text-dark">{dealer.business_name}</p>
                <p className="text-sm text-gray-400">WhatsApp: {dealer.phone}{dealer.city ? ` · ${dealer.city}` : ''}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditando(true)} className="btn-secondary !px-3 !py-2 text-xs">Editar datos</button>
                <button onClick={() => void j.logout()} className="btn-secondary !px-3 !py-2 text-xs">Cerrar sesión</button>
              </div>
            </div>
            <CompartirCatalogo dealer={dealer} vehiculos={vehiculos} />
            {dealer.aprobada && <PublicarForm dealer={dealer} onPublicado={() => void recargar()} />}
            <MisVehiculos vehiculos={vehiculos} cargando={cargandoVeh} onCambio={() => void recargar()} />
          </>
        )}
      </div>
    </div>
  );
}
