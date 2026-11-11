import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle, CalendarClock, ChevronDown, ChevronUp, Loader2, MessageCircle, Pencil, Phone,
  Plus, Search, Send, Trash2, Users, X,
} from 'lucide-react';
import { supabase, formatCOP } from '@/jg/lib/supabase';
import type { DealerProfile } from '@/jg/lib/dealers';
import type { Tables } from '@/integrations/supabase/types';

type Cliente = Tables<'crm_clientes'>;
type Seguimiento = Tables<'crm_seguimientos'>;

const ETAPAS = [
  { id: 'nuevo', nombre: 'Nuevo', color: 'bg-blue-600/20 text-blue-300 border-blue-500/40' },
  { id: 'contactado', nombre: 'Contactado', color: 'bg-yellow-600/20 text-yellow-300 border-yellow-500/40' },
  { id: 'negociando', nombre: 'Negociando', color: 'bg-purple-600/20 text-purple-300 border-purple-500/40' },
  { id: 'vendido', nombre: 'Vendido', color: 'bg-green-600/20 text-green-300 border-green-500/40' },
  { id: 'perdido', nombre: 'Perdido', color: 'bg-gray-600/20 text-gray-300 border-gray-500/40' },
] as const;

const ORIGENES = ['WhatsApp', 'Llamada', 'Redes sociales', 'ClickMotores', 'Patio / visita', 'Referido', 'Otro'];

function hoyISO(): string {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

function sumarDias(dias: number): string {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
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

type FormState = {
  nombre: string; telefono: string; correo: string; interes: string; presupuesto: string;
  origen: string; notas: string; proximo: string;
};

const FORM_VACIO: FormState = { nombre: '', telefono: '', correo: '', interes: '', presupuesto: '', origen: 'WhatsApp', notas: '', proximo: '' };

function FormCliente({
  dealerId, cliente, onCerrar, onGuardado,
}: { dealerId: string; cliente: Cliente | null; onCerrar: () => void; onGuardado: () => void }) {
  const [f, setF] = useState<FormState>(
    cliente
      ? {
        nombre: cliente.nombre, telefono: cliente.telefono, correo: cliente.correo ?? '', interes: cliente.interes ?? '',
        presupuesto: cliente.presupuesto != null ? String(cliente.presupuesto) : '', origen: cliente.origen,
        notas: cliente.notas ?? '', proximo: cliente.proximo_contacto ?? '',
      }
      : FORM_VACIO,
  );
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cambiar = (k: keyof FormState, v: string) => setF((p) => ({ ...p, [k]: v }));

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const tel = f.telefono.replace(/\D/g, '');
    if (f.nombre.trim().length < 2) return setError('Escribe el nombre del cliente.');
    if (tel.length < 7) return setError('Escribe un celular válido.');
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
    };
    setCargando(true);
    try {
      if (cliente) {
        const { error: err } = await supabase
          .from('crm_clientes')
          .update({ ...datos, updated_at: new Date().toISOString() })
          .eq('id', cliente.id);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from('crm_clientes').insert({ ...datos, dealer_id: dealerId });
        if (err) throw err;
      }
      onGuardado();
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : 'No pudimos guardar el cliente.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={guardar} className="card space-y-4 border-jg-red/40 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-lg font-bold text-jg-text-dark">{cliente ? 'Editar cliente' : 'Nuevo cliente'}</h3>
        <button type="button" onClick={onCerrar} aria-label="Cerrar" className="rounded p-1 text-gray-400 hover:text-white"><X className="h-5 w-5" /></button>
      </div>
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-jg-red/30 bg-jg-red/10 px-3 py-2 text-sm text-jg-red">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span className="min-w-0 break-words">{error}</span>
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div><label className="label-field">Nombre</label><input value={f.nombre} onChange={(e) => cambiar('nombre', e.target.value)} maxLength={100} className="input-field" placeholder="Juan Pérez" /></div>
        <div><label className="label-field">Celular / WhatsApp</label><input value={f.telefono} onChange={(e) => cambiar('telefono', e.target.value)} inputMode="tel" maxLength={20} className="input-field" placeholder="3001234567" /></div>
        <div><label className="label-field">Correo (opcional)</label><input type="email" value={f.correo} onChange={(e) => cambiar('correo', e.target.value)} maxLength={120} className="input-field" /></div>
        <div>
          <label className="label-field">¿Cómo llegó?</label>
          <select value={f.origen} onChange={(e) => cambiar('origen', e.target.value)} className="select-field">
            {ORIGENES.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div><label className="label-field">Qué busca</label><input value={f.interes} onChange={(e) => cambiar('interes', e.target.value)} maxLength={200} className="input-field" placeholder="Mazda 3 2020, automático" /></div>
        <div>
          <label className="label-field">Presupuesto (COP)</label>
          <input value={f.presupuesto} onChange={(e) => cambiar('presupuesto', e.target.value.replace(/\D/g, ''))} inputMode="numeric" className="input-field" placeholder="60000000" />
          {f.presupuesto && <p className="mt-1 text-xs text-gray-500">{formatCOP(Number(f.presupuesto))}</p>}
        </div>
        <div className="sm:col-span-2">
          <label className="label-field">Próximo contacto</label>
          <div className="flex flex-wrap items-center gap-2">
            <input type="date" value={f.proximo} onChange={(e) => cambiar('proximo', e.target.value)} className="input-field !w-auto" />
            <button type="button" onClick={() => cambiar('proximo', sumarDias(1))} className="btn-secondary !px-3 !py-2 text-xs">Mañana</button>
            <button type="button" onClick={() => cambiar('proximo', sumarDias(3))} className="btn-secondary !px-3 !py-2 text-xs">En 3 días</button>
            <button type="button" onClick={() => cambiar('proximo', sumarDias(7))} className="btn-secondary !px-3 !py-2 text-xs">En 1 semana</button>
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="label-field">Notas</label>
          <textarea value={f.notas} onChange={(e) => cambiar('notas', e.target.value)} maxLength={1000} rows={3} className="input-field" placeholder="Lo que necesites recordar de este cliente" />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={cargando} className="btn-primary disabled:opacity-50">
          {cargando && <Loader2 className="h-4 w-4 animate-spin" />}
          {cliente ? 'Guardar cambios' : 'Agregar cliente'}
        </button>
        <button type="button" onClick={onCerrar} className="btn-secondary">Cancelar</button>
      </div>
    </form>
  );
}

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
    if (!error) {
      setNota('');
      void cargar();
    }
  };

  const borrar = async (id: string) => {
    await supabase.from('crm_seguimientos').delete().eq('id', id);
    void cargar();
  };

  return (
    <div className="space-y-3 border-t border-jg-silver/30 pt-3">
      {cliente.notas && <p className="whitespace-pre-wrap break-words text-sm text-gray-300">{cliente.notas}</p>}
      <form onSubmit={agregar} className="flex gap-2">
        <input value={nota} onChange={(e) => setNota(e.target.value)} maxLength={1000} className="input-field min-w-0 flex-1" placeholder="Anota una llamada, visita u oferta..." />
        <button type="submit" disabled={enviando || !nota.trim()} aria-label="Agregar nota" className="btn-primary !px-3 disabled:opacity-50"><Send className="h-4 w-4" /></button>
      </form>
      {cargando ? (
        <p className="text-xs text-gray-500">Cargando historial...</p>
      ) : items.length === 0 ? (
        <p className="text-xs text-gray-500">Aún no hay notas de seguimiento.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((s) => (
            <li key={s.id} className="flex items-start justify-between gap-2 rounded-lg bg-black/20 px-3 py-2">
              <div className="min-w-0">
                <p className="break-words text-sm text-gray-200">{s.nota}</p>
                <p className="text-xs text-gray-500">{fechaCorta(s.created_at)}</p>
              </div>
              <button onClick={() => void borrar(s.id)} aria-label="Borrar nota" className="shrink-0 text-gray-500 hover:text-jg-red"><Trash2 className="h-3.5 w-3.5" /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function CrmCompraventa({ dealer }: { dealer: DealerProfile }) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<string>('activos');
  const [busqueda, setBusqueda] = useState('');
  const [formulario, setFormulario] = useState<{ abierto: boolean; cliente: Cliente | null }>({ abierto: false, cliente: null });
  const [expandido, setExpandido] = useState<string | null>(null);

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

  const hoy = hoyISO();
  const pendientes = (c: Cliente) => c.proximo_contacto != null && c.proximo_contacto <= hoy && c.etapa !== 'vendido' && c.etapa !== 'perdido';

  const resumen = useMemo(() => ({
    total: clientes.length,
    porContactar: clientes.filter(pendientes).length,
    negociando: clientes.filter((c) => c.etapa === 'negociando').length,
    vendidos: clientes.filter((c) => c.etapa === 'vendido').length,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [clientes, hoy]);

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return clientes
      .filter((c) => {
        if (filtro === 'activos') return c.etapa !== 'vendido' && c.etapa !== 'perdido';
        if (filtro === 'hoy') return pendientes(c);
        if (filtro === 'todos') return true;
        return c.etapa === filtro;
      })
      .filter((c) => !q || `${c.nombre} ${c.telefono} ${c.interes ?? ''}`.toLowerCase().includes(q))
      .sort((a, b) => (a.proximo_contacto ?? '9999-12-31').localeCompare(b.proximo_contacto ?? '9999-12-31'));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientes, filtro, busqueda, hoy]);

  const actualizar = async (id: string, cambios: { etapa?: string; proximo_contacto?: string | null }) => {
    const { error: err } = await supabase.from('crm_clientes').update({ ...cambios, updated_at: new Date().toISOString() }).eq('id', id);
    if (err) setError('No pudimos actualizar el cliente.');
    else void cargar();
  };

  const eliminar = async (c: Cliente) => {
    if (!window.confirm(`¿Eliminar a ${c.nombre} y todo su historial?`)) return;
    const { error: err } = await supabase.from('crm_clientes').delete().eq('id', c.id);
    if (err) setError('No pudimos eliminar el cliente.');
    else void cargar();
  };

  const filtros: Array<[string, string]> = [
    ['activos', 'Activos'], ['hoy', 'Por contactar'], ['nuevo', 'Nuevos'], ['contactado', 'Contactados'],
    ['negociando', 'Negociando'], ['vendido', 'Vendidos'], ['perdido', 'Perdidos'], ['todos', 'Todos'],
  ];

  return (
    <div className="card space-y-4 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-jg-text-dark">
          <Users className="h-5 w-5 text-jg-red" /> Mis clientes (CRM)
        </h2>
        <button onClick={() => setFormulario({ abierto: true, cliente: null })} className="btn-primary !px-3 !py-2 text-sm">
          <Plus className="h-4 w-4" /> Nuevo cliente
        </button>
      </div>
      <p className="text-sm text-gray-400">Registra a quienes te escriben, anota cada contacto y deja programado cuándo volver a llamarlos. Ya no necesitas papelitos.</p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ['Clientes', resumen.total, 'text-jg-text-dark'],
          ['Por contactar hoy', resumen.porContactar, resumen.porContactar > 0 ? 'text-yellow-400' : 'text-jg-text-dark'],
          ['Negociando', resumen.negociando, 'text-purple-300'],
          ['Vendidos', resumen.vendidos, 'text-green-400'],
        ].map(([t, n, c]) => (
          <div key={String(t)} className="rounded-xl border border-jg-silver/40 bg-black/20 p-3">
            <p className={`text-2xl font-bold ${String(c)}`}>{String(n)}</p>
            <p className="text-xs text-gray-400">{String(t)}</p>
          </div>
        ))}
      </div>

      {formulario.abierto && (
        <FormCliente
          dealerId={dealer.id}
          cliente={formulario.cliente}
          onCerrar={() => setFormulario({ abierto: false, cliente: null })}
          onGuardado={() => { setFormulario({ abierto: false, cliente: null }); void cargar(); }}
        />
      )}

      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="input-field pl-11" placeholder="Buscar por nombre, celular o vehículo" />
      </div>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {filtros.map(([id, nombre]) => (
          <button
            key={id}
            onClick={() => setFiltro(id)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium ${filtro === id ? 'border-jg-red bg-jg-red/10 text-jg-red' : 'border-jg-silver text-gray-400'}`}
          >
            {nombre}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-jg-red/30 bg-jg-red/10 px-3 py-2 text-sm text-jg-red">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span className="min-w-0 break-words">{error}</span>
        </div>
      )}

      {cargando ? (
        <p className="text-sm text-gray-400">Cargando clientes...</p>
      ) : visibles.length === 0 ? (
        <p className="text-sm text-gray-400">{clientes.length === 0 ? 'Aún no tienes clientes. Agrega el primero con el botón "Nuevo cliente".' : 'No hay clientes en este filtro.'}</p>
      ) : (
        <ul className="space-y-3">
          {visibles.map((c) => {
            const et = etapaInfo(c.etapa);
            const vencido = pendientes(c);
            const abierto = expandido === c.id;
            return (
              <li key={c.id} className={`space-y-3 rounded-xl border p-4 ${vencido ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-jg-silver/40 bg-black/20'}`}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="break-words font-semibold text-jg-text-dark">{c.nombre}</p>
                    <p className="text-sm text-gray-400">{c.telefono}{c.origen ? ` · ${c.origen}` : ''}</p>
                    {c.interes && <p className="break-words text-sm text-gray-300">Busca: {c.interes}</p>}
                    {c.presupuesto != null && <p className="text-xs text-gray-500">Presupuesto: {formatCOP(c.presupuesto)}</p>}
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${et.color}`}>{et.nombre}</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <CalendarClock className={`h-4 w-4 ${vencido ? 'text-yellow-400' : 'text-gray-500'}`} />
                  {c.proximo_contacto ? (
                    <span className={vencido ? 'font-semibold text-yellow-400' : 'text-gray-400'}>
                      {c.proximo_contacto < hoy ? 'Vencido: ' : c.proximo_contacto === hoy ? 'Hoy: ' : 'Contactar: '}{fechaCorta(c.proximo_contacto)}
                    </span>
                  ) : (
                    <span className="text-gray-500">Sin contacto programado</span>
                  )}
                  <button onClick={() => void actualizar(c.id, { proximo_contacto: sumarDias(1) })} className="rounded border border-jg-silver px-2 py-1 text-gray-300">Mañana</button>
                  <button onClick={() => void actualizar(c.id, { proximo_contacto: sumarDias(3) })} className="rounded border border-jg-silver px-2 py-1 text-gray-300">3 días</button>
                  <button onClick={() => void actualizar(c.id, { proximo_contacto: sumarDias(7) })} className="rounded border border-jg-silver px-2 py-1 text-gray-300">1 sem</button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <a href={enlaceWhatsapp(c.telefono, `Hola ${c.nombre.split(' ')[0] ?? ''}, te escribo de ${dealer.business_name}.`)} target="_blank" rel="noopener noreferrer" className="btn-primary !px-3 !py-2 text-xs">
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </a>
                  <a href={`tel:${c.telefono}`} className="btn-secondary !px-3 !py-2 text-xs"><Phone className="h-4 w-4" /> Llamar</a>
                  <select value={c.etapa} onChange={(e) => void actualizar(c.id, { etapa: e.target.value })} aria-label="Etapa" className="select-field !w-auto !py-2 text-sm">
                    {ETAPAS.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                  </select>
                  <button onClick={() => setFormulario({ abierto: true, cliente: c })} aria-label="Editar cliente" className="rounded-lg border border-jg-silver p-2 text-gray-400 hover:text-white"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => void eliminar(c)} aria-label="Eliminar cliente" className="rounded-lg border border-jg-silver p-2 text-gray-400 hover:text-jg-red"><Trash2 className="h-4 w-4" /></button>
                  <button onClick={() => setExpandido(abierto ? null : c.id)} className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-white">
                    Notas {abierto ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>

                {abierto && <Historial cliente={c} dealerId={dealer.id} />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
