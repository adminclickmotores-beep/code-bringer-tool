import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle, ArrowLeft, ArrowRight, CalendarClock, Check, CheckCircle2, ChevronDown, ChevronUp, HelpCircle,
  Loader2, MessageCircle, Pencil, Phone, Plus, Search, Send, Trash2, UserPlus, Users, X,
} from 'lucide-react';
import { supabase, formatCOP } from '@/jg/lib/supabase';
import type { DealerProfile } from '@/jg/lib/dealers';
import type { Tables } from '@/integrations/supabase/types';

type Cliente = Tables<'crm_clientes'>;
type Seguimiento = Tables<'crm_seguimientos'>;

const ETAPAS = [
  { id: 'nuevo', nombre: 'Nuevo', ayuda: 'Acaba de llegar, aún no le has escrito.', color: 'bg-blue-600/20 text-blue-300 border-blue-500/40' },
  { id: 'contactado', nombre: 'Contactado', ayuda: 'Ya hablaste con él, está pensando.', color: 'bg-yellow-600/20 text-yellow-300 border-yellow-500/40' },
  { id: 'negociando', nombre: 'Negociando', ayuda: 'Está interesado: hablan de precio o visita.', color: 'bg-purple-600/20 text-purple-300 border-purple-500/40' },
  { id: 'vendido', nombre: 'Vendido', ayuda: 'Cerraste el negocio.', color: 'bg-green-600/20 text-green-300 border-green-500/40' },
  { id: 'perdido', nombre: 'Perdido', ayuda: 'Ya no va a comprar.', color: 'bg-gray-600/20 text-gray-300 border-gray-500/40' },
] as const;

const CLIENTES_POR_PAGINA = 20;

const ORIGENES = ['WhatsApp', 'Llamada', 'Redes sociales', 'ClickMotores', 'Visita al patio', 'Referido', 'Otro'];

const PASOS_GUIA = [
  { n: 1, titulo: 'Agrega al cliente', texto: 'Cuando alguien te escriba o llame, toca "Agregar cliente" y guarda su nombre y celular.' },
  { n: 2, titulo: 'Deja programado cuándo volver', texto: 'Elige "Mañana", "3 días" o "1 semana". La app te recuerda a quién le toca.' },
  { n: 3, titulo: 'Contáctalo y anota qué pasó', texto: 'Toca WhatsApp o Llamar. Al terminar, toca "Ya lo contacté" y escribe lo que hablaron.' },
];

function aISO(d: Date): string {
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

function sumarDias(dias: number): string {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return aISO(d);
}

function fechaCorta(iso: string): string {
  const [a, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${a}`;
}

function enlaceWhatsapp(tel: string, mensaje: string): string {
  const limpio = tel.replace(/\D/g, '');
  const conPais = limpio.length === 10 ? `57${limpio}` : limpio;
  return `https://wa.me/${conPais}?text=${encodeURIComponent(mensaje)}`;
}

function etapaInfo(id: string) {
  return ETAPAS.find((e) => e.id === id) ?? ETAPAS[0];
}

function textoProximo(fecha: string | null, hoy: string): { texto: string; alerta: boolean } {
  if (!fecha) return { texto: 'Sin fecha para volver a contactar', alerta: false };
  if (fecha < hoy) return { texto: `Se te pasó: tocaba el ${fechaCorta(fecha)}`, alerta: true };
  if (fecha === hoy) return { texto: 'Le toca contacto HOY', alerta: true };
  return { texto: `Volver a contactar el ${fechaCorta(fecha)}`, alerta: false };
}

/* ---------- Selector rápido de fecha ---------- */
function ElegirFecha({ valor, onCambio }: { valor: string; onCambio: (v: string) => void }) {
  const opciones: Array<[string, number]> = [['Mañana', 1], ['En 3 días', 3], ['En 1 semana', 7], ['En 2 semanas', 14]];
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {opciones.map(([t, d]) => {
          const f = sumarDias(d);
          return (
            <button
              key={t}
              type="button"
              onClick={() => onCambio(f)}
              className={`min-h-[44px] rounded-lg border px-3 py-2 text-sm font-medium ${valor === f ? 'border-jg-red bg-jg-red/10 text-jg-red' : 'border-jg-silver text-gray-300'}`}
            >
              {t}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-gray-500">O elige otro día:</span>
        <input type="date" value={valor} onChange={(e) => onCambio(e.target.value)} className="input-field !w-auto !py-2" />
        {valor && <button type="button" onClick={() => onCambio('')} className="text-xs text-gray-400 underline">Quitar fecha</button>}
      </div>
    </div>
  );
}

/* ---------- Formulario paso a paso ---------- */
type FormState = {
  nombre: string; telefono: string; correo: string; interes: string; presupuesto: string;
  origen: string; notas: string; proximo: string; asesor_nombre: string; asesor_telefono: string;
};

const FORM_VACIO: FormState = { nombre: '', telefono: '', correo: '', interes: '', presupuesto: '', origen: 'WhatsApp', notas: '', proximo: '', asesor_nombre: '', asesor_telefono: '' };

function FormCliente({
  dealerId, cliente, onCerrar, onGuardado,
}: { dealerId: string; cliente: Cliente | null; onCerrar: () => void; onGuardado: () => void }) {
  const [paso, setPaso] = useState(1);
  const [f, setF] = useState<FormState>(
    cliente
      ? {
        nombre: cliente.nombre, telefono: cliente.telefono, correo: cliente.correo ?? '', interes: cliente.interes ?? '',
        presupuesto: cliente.presupuesto != null ? String(cliente.presupuesto) : '', origen: cliente.origen,
        notas: cliente.notas ?? '', proximo: cliente.proximo_contacto ?? '',
        asesor_nombre: cliente.asesor_nombre ?? '', asesor_telefono: cliente.asesor_telefono ?? '',
      }
      : { ...FORM_VACIO, proximo: sumarDias(1) },
  );
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cambiar = (k: keyof FormState, v: string) => setF((p) => ({ ...p, [k]: v }));

  const siguiente = () => {
    setError(null);
    if (paso === 1) {
      if (f.nombre.trim().length < 2) return setError('Escribe el nombre del cliente.');
      if (f.telefono.replace(/\D/g, '').length < 7) return setError('Escribe su celular (10 dígitos).');
    }
    setPaso((p) => Math.min(3, p + 1));
  };

  const guardar = async () => {
    setError(null);
    const tel = f.telefono.replace(/\D/g, '');
    if (f.nombre.trim().length < 2 || tel.length < 7) {
      setPaso(1);
      return setError('Falta el nombre o el celular del cliente.');
    }
    const presupuesto = f.presupuesto.replace(/\D/g, '');
    const datos = {
      nombre: f.nombre.trim(),
      telefono: tel,
      correo: f.correo.trim() || null,
      interes: f.interes.trim() || null,
      presupuesto: presupuesto ? Number(presupuesto) : null,
      origen: f.origen,
      notas: f.notas.trim() || null,
      proximo_contacto: f.proximo || null,
      asesor_nombre: f.asesor_nombre.trim() || null,
      asesor_telefono: f.asesor_telefono.replace(/\D/g, '') || null,
    };
    setCargando(true);
    try {
      if (cliente) {
        const { error: err } = await supabase.from('crm_clientes').update({ ...datos, updated_at: new Date().toISOString() }).eq('id', cliente.id);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from('crm_clientes').insert({ ...datos, dealer_id: dealerId });
        if (err) throw err;
      }
      onGuardado();
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : 'No pudimos guardar el cliente. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  const titulos = ['Quién es', 'Qué busca', 'Seguimiento'];

  return (
    <div className="space-y-4 rounded-2xl border border-jg-red/40 bg-black/30 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-lg font-bold text-jg-text-dark">{cliente ? 'Editar cliente' : 'Agregar cliente'}</h3>
        <button type="button" onClick={onCerrar} aria-label="Cerrar" className="rounded p-2 text-gray-400 hover:text-white"><X className="h-5 w-5" /></button>
      </div>

      <ol className="grid grid-cols-3 gap-2">
        {titulos.map((t, i) => {
          const n = i + 1;
          const hecho = paso > n;
          const activo = paso === n;
          return (
            <li key={t} className="min-w-0">
              <div className={`h-1.5 rounded-full ${hecho || activo ? 'bg-jg-red' : 'bg-white/10'}`} />
              <p className={`mt-1.5 truncate text-xs ${activo ? 'font-semibold text-white' : 'text-gray-500'}`}>Paso {n}: {t}</p>
            </li>
          );
        })}
      </ol>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-jg-red/30 bg-jg-red/10 px-3 py-2 text-sm text-jg-red">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span className="min-w-0 break-words">{error}</span>
        </div>
      )}

      {paso === 1 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-400">Empieza con lo básico: ¿cómo se llama y cuál es su celular?</p>
          <div><label className="label-field">Nombre del cliente</label><input value={f.nombre} onChange={(e) => cambiar('nombre', e.target.value)} maxLength={100} autoFocus className="input-field" placeholder="Ej. Juan Pérez" /></div>
          <div><label className="label-field">Celular / WhatsApp</label><input value={f.telefono} onChange={(e) => cambiar('telefono', e.target.value)} inputMode="tel" maxLength={20} className="input-field" placeholder="3001234567" /></div>
        </div>
      )}

      {paso === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-400">Esto te ayuda a recordar qué ofrecerle. Todo es opcional.</p>
          <div><label className="label-field">¿Qué vehículo busca?</label><input value={f.interes} onChange={(e) => cambiar('interes', e.target.value)} maxLength={200} className="input-field" placeholder="Ej. Mazda 3 2020 automático" /></div>
          <div>
            <label className="label-field">Presupuesto aproximado (COP)</label>
            <input value={f.presupuesto} onChange={(e) => cambiar('presupuesto', e.target.value.replace(/\D/g, ''))} inputMode="numeric" className="input-field" placeholder="60000000" />
            {f.presupuesto && <p className="mt-1 text-xs text-gray-500">{formatCOP(Number(f.presupuesto))}</p>}
          </div>
          <div>
            <label className="label-field">¿Cómo te contactó?</label>
            <div className="flex flex-wrap gap-2">
              {ORIGENES.map((o) => (
                <button key={o} type="button" onClick={() => cambiar('origen', o)} className={`min-h-[40px] rounded-full border px-3 py-1.5 text-sm ${f.origen === o ? 'border-jg-red bg-jg-red/10 text-jg-red' : 'border-jg-silver text-gray-300'}`}>{o}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {paso === 3 && (
        <div className="space-y-4">
          <div>
            <label className="label-field">¿Cuándo vas a volver a contactarlo?</label>
            <ElegirFecha valor={f.proximo} onCambio={(v) => cambiar('proximo', v)} />
          </div>
          <div>
            <label className="label-field">Notas (opcional)</label>
            <textarea value={f.notas} onChange={(e) => cambiar('notas', e.target.value)} maxLength={1000} rows={3} className="input-field" placeholder="Lo que necesites recordar de este cliente" />
          </div>
          <div className="space-y-3 rounded-xl border border-jg-silver/40 p-3">
            <p className="label-field !mb-0">¿Quién lo atendió? (opcional)</p>
            <div><label className="label-field">Nombre del asesor</label><input value={f.asesor_nombre} onChange={(e) => cambiar('asesor_nombre', e.target.value)} maxLength={100} className="input-field" placeholder="Ej. Carlos" /></div>
            <div><label className="label-field">Celular del asesor</label><input value={f.asesor_telefono} onChange={(e) => cambiar('asesor_telefono', e.target.value)} inputMode="tel" maxLength={20} className="input-field" placeholder="3001234567" /></div>
          </div>
          <div><label className="label-field">Correo (opcional)</label><input type="email" value={f.correo} onChange={(e) => cambiar('correo', e.target.value)} maxLength={120} className="input-field" /></div>
        </div>
      )}

      <div className="flex gap-2">
        {paso > 1 ? (
          <button type="button" onClick={() => { setError(null); setPaso((p) => p - 1); }} className="btn-secondary min-h-[48px] flex-1 sm:flex-none"><ArrowLeft className="h-4 w-4" /> Atrás</button>
        ) : (
          <button type="button" onClick={onCerrar} className="btn-secondary min-h-[48px] flex-1 sm:flex-none">Cancelar</button>
        )}
        {paso < 3 ? (
          <button type="button" onClick={siguiente} className="btn-primary min-h-[48px] flex-[2] sm:flex-none">Siguiente <ArrowRight className="h-4 w-4" /></button>
        ) : (
          <button type="button" onClick={() => void guardar()} disabled={cargando} className="btn-primary min-h-[48px] flex-[2] disabled:opacity-50 sm:flex-none">
            {cargando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {cliente ? 'Guardar cambios' : 'Guardar cliente'}
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------- "Ya lo contacté": anota qué pasó y agenda lo siguiente ---------- */
function RegistrarContacto({
  cliente, dealerId, onListo, onCancelar,
}: { cliente: Cliente; dealerId: string; onListo: () => void; onCancelar: () => void }) {
  const [nota, setNota] = useState('');
  const [proximo, setProximo] = useState(sumarDias(3));
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const guardar = async () => {
    setGuardando(true);
    setError(null);
    try {
      if (nota.trim()) {
        const { error: e1 } = await supabase.from('crm_seguimientos').insert({ cliente_id: cliente.id, dealer_id: dealerId, nota: nota.trim() });
        if (e1) throw e1;
      }
      const { error: e2 } = await supabase
        .from('crm_clientes')
        .update({
          proximo_contacto: proximo || null,
          etapa: cliente.etapa === 'nuevo' ? 'contactado' : cliente.etapa,
          updated_at: new Date().toISOString(),
        })
        .eq('id', cliente.id);
      if (e2) throw e2;
      onListo();
    } catch {
      setError('No pudimos guardar. Intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-green-500/30 bg-green-500/5 p-3 sm:p-4">
      <p className="text-sm font-semibold text-green-300">Registrar contacto con {cliente.nombre.split(' ')[0] ?? cliente.nombre}</p>
      {error && <p className="text-sm text-jg-red">{error}</p>}
      <div>
        <label className="label-field">1. ¿Qué hablaron? (opcional)</label>
        <textarea value={nota} onChange={(e) => setNota(e.target.value)} maxLength={1000} rows={2} className="input-field" placeholder="Ej. Le interesó el Mazda, va a venir el sábado" />
      </div>
      <div>
        <label className="label-field">2. ¿Cuándo lo vuelves a contactar?</label>
        <ElegirFecha valor={proximo} onCambio={setProximo} />
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={onCancelar} className="btn-secondary min-h-[44px] flex-1 sm:flex-none">Cancelar</button>
        <button type="button" onClick={() => void guardar()} disabled={guardando} className="btn-primary min-h-[44px] flex-[2] disabled:opacity-50 sm:flex-none">
          {guardando ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Guardar
        </button>
      </div>
    </div>
  );
}

/* ---------- Historial de notas ---------- */
function Historial({ cliente, dealerId }: { cliente: Cliente; dealerId: string }) {
  const [items, setItems] = useState<Seguimiento[]>([]);
  const [nota, setNota] = useState('');
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const cargar = useCallback(async () => {
    const { data } = await supabase
      .from('crm_seguimientos')
      .select('*')
      .eq('cliente_id', cliente.id)
      .order('created_at', { ascending: false });
    setItems(data ?? []);
    setCargando(false);
  }, [cliente.id]);

  useEffect(() => { void cargar(); }, [cargar]);

  const agregar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nota.trim()) return;
    setEnviando(true);
    const { error } = await supabase.from('crm_seguimientos').insert({ cliente_id: cliente.id, dealer_id: dealerId, nota: nota.trim() });
    setEnviando(false);
    if (!error) { setNota(''); void cargar(); }
  };

  const borrar = async (id: string) => {
    await supabase.from('crm_seguimientos').delete().eq('id', id);
    void cargar();
  };

  return (
    <div className="space-y-3">
      <p className="label-field !mb-0">Historial de notas</p>
      {cliente.notas && <p className="whitespace-pre-wrap break-words rounded-lg bg-black/20 px-3 py-2 text-sm text-gray-300">{cliente.notas}</p>}
      <form onSubmit={agregar} className="flex gap-2">
        <input value={nota} onChange={(e) => setNota(e.target.value)} maxLength={1000} className="input-field min-w-0 flex-1" placeholder="Escribe una nota nueva..." />
        <button type="submit" disabled={enviando || !nota.trim()} aria-label="Agregar nota" className="btn-primary !px-4 disabled:opacity-50"><Send className="h-4 w-4" /></button>
      </form>
      {cargando ? (
        <p className="text-xs text-gray-500">Cargando...</p>
      ) : items.length === 0 ? (
        <p className="text-xs text-gray-500">Todavía no hay notas.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((s) => (
            <li key={s.id} className="flex items-start justify-between gap-2 rounded-lg bg-black/20 px-3 py-2">
              <div className="min-w-0">
                <p className="break-words text-sm text-gray-200">{s.nota}</p>
                <p className="text-xs text-gray-500">{fechaCorta(s.created_at)}</p>
              </div>
              <button onClick={() => void borrar(s.id)} aria-label="Borrar nota" className="shrink-0 p-1 text-gray-500 hover:text-jg-red"><Trash2 className="h-4 w-4" /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---------- CRM ---------- */
export function CrmCompraventa({ dealer }: { dealer: DealerProfile }) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<string>('activos');
  const [busqueda, setBusqueda] = useState('');
  const [formulario, setFormulario] = useState<{ abierto: boolean; cliente: Cliente | null }>({ abierto: false, cliente: null });
  const [expandido, setExpandido] = useState<string | null>(null);
  const [registrando, setRegistrando] = useState<string | null>(null);
  const [guiaAbierta, setGuiaAbierta] = useState(true);
  const [limite, setLimite] = useState(CLIENTES_POR_PAGINA);

  useEffect(() => {
    try {
      if (localStorage.getItem('crm-guia-cerrada') === '1') setGuiaAbierta(false);
    } catch { /* sin almacenamiento */ }
  }, []);

  const alternarGuia = () => {
    const nuevo = !guiaAbierta;
    setGuiaAbierta(nuevo);
    try { localStorage.setItem('crm-guia-cerrada', nuevo ? '0' : '1'); } catch { /* sin almacenamiento */ }
  };

  const cargar = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('crm_clientes')
      .select('*')
      .eq('dealer_id', dealer.id)
      .order('created_at', { ascending: false });
    if (err) setError('No pudimos cargar tus clientes. Intenta de nuevo.');
    else { setError(null); setClientes(data ?? []); }
    setCargando(false);
  }, [dealer.id]);

  useEffect(() => { void cargar(); }, [cargar]);

  const hoy = aISO(new Date());
  const toca = (c: Cliente) => c.proximo_contacto != null && c.proximo_contacto <= hoy && c.etapa !== 'vendido' && c.etapa !== 'perdido';
  const cuenta = (id: string) => clientes.filter((c) => c.etapa === id).length;
  const totalHoy = clientes.filter(toca).length;
  const totalActivos = clientes.filter((c) => c.etapa !== 'vendido' && c.etapa !== 'perdido').length;

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    const h = aISO(new Date());
    const tocaHoy = (c: Cliente) => c.proximo_contacto != null && c.proximo_contacto <= h && c.etapa !== 'vendido' && c.etapa !== 'perdido';
    return clientes
      .filter((c) => {
        if (filtro === 'activos') return c.etapa !== 'vendido' && c.etapa !== 'perdido';
        if (filtro === 'hoy') return tocaHoy(c);
        return c.etapa === filtro;
      })
      .filter((c) => !q || `${c.nombre} ${c.telefono} ${c.interes ?? ''}`.toLowerCase().includes(q))
      .sort((a, b) => (a.proximo_contacto ?? '9999-12-31').localeCompare(b.proximo_contacto ?? '9999-12-31'));
  }, [clientes, filtro, busqueda]);

  const cambiarEtapa = async (id: string, etapa: string) => {
    const { error: err } = await supabase.from('crm_clientes').update({ etapa, updated_at: new Date().toISOString() }).eq('id', id);
    if (err) setError('No pudimos cambiar la etapa.');
    else void cargar();
  };

  const eliminar = async (c: Cliente) => {
    if (!window.confirm(`¿Eliminar a ${c.nombre} y todo su historial? Esto no se puede deshacer.`)) return;
    const { error: err } = await supabase.from('crm_clientes').delete().eq('id', c.id);
    if (err) setError('No pudimos eliminar el cliente.');
    else void cargar();
  };

  const filtros: Array<[string, string, number]> = [
    ['activos', 'Todos los activos', totalActivos],
    ['hoy', 'Les toca hoy', totalHoy],
    ['nuevo', 'Nuevos', cuenta('nuevo')],
    ['contactado', 'Contactados', cuenta('contactado')],
    ['negociando', 'Negociando', cuenta('negociando')],
    ['vendido', 'Vendidos', cuenta('vendido')],
    ['perdido', 'Perdidos', cuenta('perdido')],
  ];

  return (
    <section className="card space-y-5 p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold text-jg-text-dark">
            <Users className="h-5 w-5 shrink-0 text-jg-red" /> Mis clientes
          </h2>
          <p className="mt-1 text-sm text-gray-400">Tu libreta digital: quién te escribió, qué busca y cuándo volver a llamarle.</p>
        </div>
        <button onClick={() => setFormulario({ abierto: true, cliente: null })} className="btn-primary min-h-[48px] w-full sm:w-auto">
          <UserPlus className="h-5 w-5" /> Agregar cliente
        </button>
      </div>

      <div className="rounded-xl border border-jg-silver/40 bg-black/20">
        <button onClick={alternarGuia} className="flex min-h-[48px] w-full items-center justify-between gap-2 px-4 py-3 text-left">
          <span className="flex items-center gap-2 text-sm font-semibold text-jg-text-dark"><HelpCircle className="h-4 w-4 text-jg-red" /> ¿Cómo se usa? Solo 3 pasos</span>
          {guiaAbierta ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </button>
        {guiaAbierta && (
          <ol className="grid grid-cols-1 gap-3 px-4 pb-4 sm:grid-cols-3">
            {PASOS_GUIA.map((p) => (
              <li key={p.n} className="flex gap-3 rounded-lg bg-white/[0.03] p-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-jg-red text-sm font-bold text-white">{p.n}</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-jg-text-dark">{p.titulo}</p>
                  <p className="mt-0.5 text-xs text-gray-400">{p.texto}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>

      {formulario.abierto && (
        <FormCliente
          key={formulario.cliente?.id ?? 'nuevo'}
          dealerId={dealer.id}
          cliente={formulario.cliente}
          onCerrar={() => setFormulario({ abierto: false, cliente: null })}
          onGuardado={() => { setFormulario({ abierto: false, cliente: null }); void cargar(); }}
        />
      )}

      {totalHoy > 0 && (
        <button
          onClick={() => setFiltro('hoy')}
          className="flex w-full items-center gap-3 rounded-xl border border-yellow-500/50 bg-yellow-500/10 p-4 text-left"
        >
          <CalendarClock className="h-6 w-6 shrink-0 text-yellow-400" />
          <span className="min-w-0 text-sm text-yellow-200">
            <strong className="block text-base text-yellow-300">Hoy te toca contactar a {totalHoy} {totalHoy === 1 ? 'persona' : 'personas'}</strong>
            Toca aquí para verlas.
          </span>
        </button>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-jg-red/30 bg-jg-red/10 px-3 py-2 text-sm text-jg-red">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span className="min-w-0 break-words">{error}</span>
        </div>
      )}

      {clientes.length > 0 && (
        <>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input value={busqueda} onChange={(e) => { setBusqueda(e.target.value); setLimite(CLIENTES_POR_PAGINA); }} className="input-field pl-11" placeholder="Buscar por nombre, celular o vehículo" />
          </div>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {filtros.map(([id, nombre, n]) => (
              <button
                key={id}
                onClick={() => { setFiltro(id); setLimite(CLIENTES_POR_PAGINA); }}
                className={`flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium ${filtro === id ? 'border-jg-red bg-jg-red/10 text-jg-red' : 'border-jg-silver text-gray-400'}`}
              >
                {nombre} <span className="rounded-full bg-white/10 px-1.5 text-xs">{n}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {cargando ? (
        <p className="flex items-center gap-2 text-sm text-gray-400"><Loader2 className="h-4 w-4 animate-spin" /> Cargando tus clientes...</p>
      ) : clientes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-jg-silver/50 p-6 text-center">
          <Users className="mx-auto h-10 w-10 text-gray-500" />
          <p className="mt-3 font-semibold text-jg-text-dark">Aún no tienes clientes guardados</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-gray-400">Empieza con la última persona que te escribió. Solo necesitas su nombre y celular.</p>
          <button onClick={() => setFormulario({ abierto: true, cliente: null })} className="btn-primary mt-4 min-h-[48px]"><Plus className="h-5 w-5" /> Agregar mi primer cliente</button>
        </div>
      ) : visibles.length === 0 ? (
        <p className="rounded-xl bg-black/20 p-4 text-center text-sm text-gray-400">No hay clientes en esta lista.</p>
      ) : (
        <ul className="space-y-3">
          {visibles.slice(0, limite).map((c) => {
            const et = etapaInfo(c.etapa);
            const prox = textoProximo(c.proximo_contacto, hoy);
            const alerta = toca(c) && prox.alerta;
            const abierto = expandido === c.id;
            const nombre1 = c.nombre.split(' ')[0] ?? c.nombre;
            return (
              <li key={c.id} className={`space-y-3 rounded-xl border p-4 ${alerta ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-jg-silver/40 bg-black/20'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="break-words text-base font-semibold text-jg-text-dark">{c.nombre}</p>
                    <p className="text-sm text-gray-400">{c.telefono} · {c.origen}</p>
                    {c.interes && <p className="mt-0.5 break-words text-sm text-gray-300">Busca: {c.interes}</p>}
                    {c.presupuesto != null && <p className="text-xs text-gray-500">Presupuesto: {formatCOP(c.presupuesto)}</p>}
                    {c.asesor_nombre && <p className="mt-0.5 break-words text-xs text-gray-400">Atendió: {c.asesor_nombre}{c.asesor_telefono ? ` · ${c.asesor_telefono}` : ''}</p>}
                  </div>
                  <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${et.color}`}>{et.nombre}</span>
                </div>

                <p className={`flex items-center gap-2 text-sm ${alerta ? 'font-semibold text-yellow-400' : 'text-gray-400'}`}>
                  <CalendarClock className="h-4 w-4 shrink-0" /> {prox.texto}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <a href={enlaceWhatsapp(c.telefono, `Hola ${nombre1}, te escribo de ${dealer.business_name}.`)} target="_blank" rel="noopener noreferrer" className="btn-primary min-h-[48px]">
                    <MessageCircle className="h-5 w-5" /> WhatsApp
                  </a>
                  <a href={`tel:${c.telefono}`} className="btn-secondary min-h-[48px]"><Phone className="h-5 w-5" /> Llamar</a>
                </div>

                {registrando === c.id ? (
                  <RegistrarContacto
                    cliente={c}
                    dealerId={dealer.id}
                    onCancelar={() => setRegistrando(null)}
                    onListo={() => { setRegistrando(null); void cargar(); }}
                  />
                ) : (
                  c.etapa !== 'vendido' && c.etapa !== 'perdido' && (
                    <button onClick={() => setRegistrando(c.id)} className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-green-500/40 bg-green-500/10 px-3 py-2 text-sm font-semibold text-green-300">
                      <CheckCircle2 className="h-4 w-4" /> Ya lo contacté
                    </button>
                  )
                )}

                <button onClick={() => setExpandido(abierto ? null : c.id)} className="flex min-h-[40px] w-full items-center justify-center gap-1 text-sm text-gray-400 hover:text-white">
                  {abierto ? 'Ocultar detalles' : 'Más opciones: etapa, notas, editar'} {abierto ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                {abierto && (
                  <div className="space-y-4 border-t border-jg-silver/30 pt-4">
                    <div>
                      <p className="label-field">¿En qué punto va este cliente?</p>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {ETAPAS.map((e) => (
                          <button
                            key={e.id}
                            onClick={() => void cambiarEtapa(c.id, e.id)}
                            className={`rounded-lg border px-3 py-2 text-left ${c.etapa === e.id ? e.color : 'border-jg-silver text-gray-400'}`}
                          >
                            <span className="block text-sm font-semibold">{e.nombre}</span>
                            <span className="block text-xs opacity-80">{e.ayuda}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <Historial cliente={c} dealerId={dealer.id} />
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => { setFormulario({ abierto: true, cliente: c }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="btn-secondary min-h-[44px]"><Pencil className="h-4 w-4" /> Editar datos</button>
                      <button onClick={() => void eliminar(c)} className="btn-secondary min-h-[44px] hover:!border-jg-red"><Trash2 className="h-4 w-4" /> Eliminar</button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {visibles.length > limite && (
        <button onClick={() => setLimite((l) => l + CLIENTES_POR_PAGINA)} className="btn-secondary min-h-[48px] w-full">
          Ver más clientes ({visibles.length - limite} más)
        </button>
      )}
    </section>
  );
}
