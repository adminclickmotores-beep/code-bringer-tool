import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarCheck, ChevronLeft, ChevronRight, Loader2, MessageCircle, Pencil, Plus, Trash2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { formatCOP } from '@/jg/lib/supabase';

type Oportunidad = Tables<'crm_oportunidades'>;
type Cita = Tables<'crm_citas'>;

const ETAPAS = [
  { id: 'nuevo', etiqueta: 'Nuevos' },
  { id: 'contactado', etiqueta: 'Contactados' },
  { id: 'cita', etiqueta: 'Con cita' },
  { id: 'negociacion', etiqueta: 'Negociación' },
  { id: 'vendido', etiqueta: 'Vendidos' },
  { id: 'perdido', etiqueta: 'Perdidos' },
] as const;

const ORIGENES = [
  { id: 'whatsapp', etiqueta: 'WhatsApp' },
  { id: 'web', etiqueta: 'Página web' },
  { id: 'redes', etiqueta: 'Redes sociales' },
  { id: 'referido', etiqueta: 'Referido' },
  { id: 'llamada', etiqueta: 'Llamada' },
  { id: 'visita', etiqueta: 'Visita al local' },
];

const TIPOS_CITA: Record<string, string> = {
  visita: 'Visita',
  prueba_manejo: 'Prueba de manejo',
  entrega: 'Entrega',
  peritaje: 'Peritaje',
};

const campo = 'w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-base text-white placeholder:text-gray-500 outline-none focus:border-[#FF1E27]';

function enlaceWhatsapp(tel: string | null, texto: string) {
  const digitos = (tel ?? '').replace(/\D/g, '');
  if (!digitos) return null;
  const completo = digitos.length === 10 ? `57${digitos}` : digitos;
  return `https://wa.me/${completo}?text=${encodeURIComponent(texto)}`;
}

function aInputFecha(iso: string) {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

type FormOp = {
  id?: string;
  cliente: string;
  telefono: string;
  vehiculo_interes: string;
  origen: string;
  etapa: string;
  valor_estimado: string;
  proxima_accion: string;
  notas: string;
};

const opVacia: FormOp = { cliente: '', telefono: '', vehiculo_interes: '', origen: 'whatsapp', etapa: 'nuevo', valor_estimado: '', proxima_accion: '', notas: '' };

type FormCita = { cliente: string; telefono: string; vehiculo: string; tipo: string; fecha_hora: string; notas: string };
const citaVacia: FormCita = { cliente: '', telefono: '', vehiculo: '', tipo: 'visita', fecha_hora: '', notas: '' };

export function CmsCrmComercial() {
  const [vista, setVista] = useState<'embudo' | 'citas'>('embudo');
  const [ops, setOps] = useState<Oportunidad[]>([]);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [formOp, setFormOp] = useState<FormOp | null>(null);
  const [formCita, setFormCita] = useState<FormCita | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    const [o, c] = await Promise.all([
      supabase.from('crm_oportunidades').select('*').order('created_at', { ascending: false }),
      supabase.from('crm_citas').select('*').order('fecha_hora', { ascending: true }),
    ]);
    if (o.error || c.error) setError(o.error?.message ?? c.error?.message ?? 'No se pudo cargar el CRM.');
    setOps(o.data ?? []);
    setCitas(c.data ?? []);
    setCargando(false);
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const hoy = new Date().toDateString();
  const resumen = useMemo(() => {
    const activas = ops.filter((o) => o.etapa !== 'vendido' && o.etapa !== 'perdido');
    const vendidas = ops.filter((o) => o.etapa === 'vendido');
    const cerradas = vendidas.length + ops.filter((o) => o.etapa === 'perdido').length;
    return {
      activas: activas.length,
      enJuego: activas.reduce((s, o) => s + Number(o.valor_estimado), 0),
      vendido: vendidas.reduce((s, o) => s + Number(o.valor_estimado), 0),
      conversion: cerradas ? Math.round((vendidas.length / cerradas) * 100) : 0,
      citasHoy: citas.filter((c) => c.estado === 'programada' && new Date(c.fecha_hora).toDateString() === hoy).length,
    };
  }, [ops, citas, hoy]);

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return ops;
    return ops.filter((o) => `${o.cliente} ${o.telefono ?? ''} ${o.vehiculo_interes ?? ''}`.toLowerCase().includes(q));
  }, [ops, busqueda]);

  const mover = async (o: Oportunidad, paso: number) => {
    const i = ETAPAS.findIndex((e) => e.id === o.etapa);
    const destino = ETAPAS[i + paso];
    if (!destino) return;
    const { error: e } = await supabase.from('crm_oportunidades').update({ etapa: destino.id }).eq('id', o.id);
    if (e) setError(e.message);
    else await cargar();
  };

  const guardarOp = async () => {
    if (!formOp) return;
    if (formOp.cliente.trim().length < 2) {
      setError('Escribe el nombre del cliente.');
      return;
    }
    setGuardando(true);
    const datos = {
      cliente: formOp.cliente.trim(),
      telefono: formOp.telefono.trim() || null,
      vehiculo_interes: formOp.vehiculo_interes.trim() || null,
      origen: formOp.origen,
      etapa: formOp.etapa,
      valor_estimado: Number(formOp.valor_estimado) || 0,
      proxima_accion: formOp.proxima_accion || null,
      notas: formOp.notas.trim() || null,
    };
    const { error: e } = formOp.id
      ? await supabase.from('crm_oportunidades').update(datos).eq('id', formOp.id)
      : await supabase.from('crm_oportunidades').insert(datos);
    setGuardando(false);
    if (e) {
      setError(e.message);
      return;
    }
    setFormOp(null);
    await cargar();
  };

  const borrarOp = async (o: Oportunidad) => {
    if (!window.confirm(`¿Eliminar a "${o.cliente}" del seguimiento?`)) return;
    const { error: e } = await supabase.from('crm_oportunidades').delete().eq('id', o.id);
    if (e) setError(e.message);
    else await cargar();
  };

  const guardarCita = async () => {
    if (!formCita) return;
    if (formCita.cliente.trim().length < 2 || !formCita.fecha_hora) {
      setError('Escribe el cliente y la fecha y hora de la cita.');
      return;
    }
    setGuardando(true);
    const { error: e } = await supabase.from('crm_citas').insert({
      cliente: formCita.cliente.trim(),
      telefono: formCita.telefono.trim() || null,
      vehiculo: formCita.vehiculo.trim() || null,
      tipo: formCita.tipo,
      fecha_hora: new Date(formCita.fecha_hora).toISOString(),
      notas: formCita.notas.trim() || null,
    });
    setGuardando(false);
    if (e) {
      setError(e.message);
      return;
    }
    setFormCita(null);
    await cargar();
  };

  const estadoCita = async (c: Cita, estado: string) => {
    const { error: e } = await supabase.from('crm_citas').update({ estado }).eq('id', c.id);
    if (e) setError(e.message);
    else await cargar();
  };

  const borrarCita = async (c: Cita) => {
    if (!window.confirm('¿Eliminar esta cita?')) return;
    const { error: e } = await supabase.from('crm_citas').delete().eq('id', c.id);
    if (e) setError(e.message);
    else await cargar();
  };

  const kpis = [
    { t: 'En seguimiento', v: String(resumen.activas) },
    { t: 'Valor en juego', v: formatCOP(resumen.enJuego) },
    { t: 'Ventas cerradas', v: formatCOP(resumen.vendido) },
    { t: 'Conversión', v: `${resumen.conversion}%` },
    { t: 'Citas de hoy', v: String(resumen.citasHoy) },
  ];

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {kpis.map((k) => (
          <div key={k.t} className="rounded-2xl border border-white/10 bg-black/60 p-4">
            <p className="text-xs uppercase tracking-widest text-gray-500">{k.t}</p>
            <p className="mt-1 break-words text-lg font-extrabold sm:text-xl">{k.v}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex gap-2">
          {(['embudo', 'citas'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVista(v)}
              className={`rounded-xl px-4 py-3 text-base font-semibold ${vista === v ? 'bg-[#FF1E27] text-white' : 'bg-white/10 text-gray-300 hover:bg-white/15'}`}
            >
              {v === 'embudo' ? 'Embudo de ventas' : 'Agenda de citas'}
            </button>
          ))}
        </div>
        {vista === 'embudo' && (
          <input type="search" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar cliente, teléfono o vehículo…" className={`${campo} sm:flex-1`} />
        )}
        <button
          type="button"
          onClick={() => (vista === 'embudo' ? setFormOp({ ...opVacia }) : setFormCita({ ...citaVacia }))}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#FF1E27] px-5 py-3 text-base font-bold hover:bg-[#D9111A] sm:ml-auto"
        >
          <Plus className="h-4 w-4" /> {vista === 'embudo' ? 'Nuevo cliente' : 'Nueva cita'}
        </button>
      </div>

      {error && <p className="rounded-xl border border-[#FF1E27]/30 bg-[#FF1E27]/10 p-3 text-sm text-red-300">{error}</p>}

      {cargando ? (
        <div className="flex justify-center py-14"><Loader2 className="h-8 w-8 animate-spin text-[#FF1E27]" /></div>
      ) : vista === 'embudo' ? (
        <div className="flex snap-x gap-3 overflow-x-auto pb-3">
          {ETAPAS.map((etapa) => {
            const lista = filtradas.filter((o) => o.etapa === etapa.id);
            const total = lista.reduce((s, o) => s + Number(o.valor_estimado), 0);
            return (
              <div key={etapa.id} className="w-[85vw] max-w-xs shrink-0 snap-start rounded-2xl border border-white/10 bg-black/60 p-3 sm:w-72">
                <div className="mb-3 flex items-baseline justify-between gap-2 px-1">
                  <h3 className="font-bold">{etapa.etiqueta} <span className="text-gray-500">({lista.length})</span></h3>
                  <span className="text-xs text-gray-500">{formatCOP(total)}</span>
                </div>
                <div className="space-y-2">
                  {lista.length === 0 && <p className="py-6 text-center text-sm text-gray-600">Sin clientes</p>}
                  {lista.map((o) => {
                    const i = ETAPAS.findIndex((e) => e.id === o.etapa);
                    const wa = enlaceWhatsapp(o.telefono, `Hola ${o.cliente}, te escribimos de ClickMotores${o.vehiculo_interes ? ` sobre ${o.vehiculo_interes}` : ''}.`);
                    const vencida = o.proxima_accion && o.etapa !== 'vendido' && o.etapa !== 'perdido' && new Date(`${o.proxima_accion}T23:59:59`) < new Date();
                    return (
                      <article key={o.id} className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm">
                        <p className="break-words font-semibold">{o.cliente}</p>
                        {o.vehiculo_interes && <p className="break-words text-gray-400">{o.vehiculo_interes}</p>}
                        <p className="mt-0.5 text-xs text-gray-500">
                          {ORIGENES.find((x) => x.id === o.origen)?.etiqueta ?? o.origen}
                          {Number(o.valor_estimado) > 0 && ` · ${formatCOP(Number(o.valor_estimado))}`}
                        </p>
                        {o.proxima_accion && (
                          <p className={`mt-1 text-xs ${vencida ? 'font-semibold text-red-400' : 'text-gray-500'}`}>
                            Próximo contacto: {new Date(`${o.proxima_accion}T12:00:00`).toLocaleDateString('es-CO')}{vencida && ' (vencido)'}
                          </p>
                        )}
                        {o.notas && <p className="mt-1 break-words text-xs text-gray-500">{o.notas}</p>}
                        <div className="mt-2 flex items-center gap-1.5">
                          <button type="button" aria-label="Etapa anterior" disabled={i <= 0} onClick={() => void mover(o, -1)} className="rounded-lg border border-white/10 p-2 text-gray-300 disabled:opacity-30">
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <button type="button" aria-label="Etapa siguiente" disabled={i >= ETAPAS.length - 1} onClick={() => void mover(o, 1)} className="rounded-lg border border-white/10 p-2 text-gray-300 disabled:opacity-30">
                            <ChevronRight className="h-4 w-4" />
                          </button>
                          {wa && (
                            <a href={wa} target="_blank" rel="noopener noreferrer" aria-label="Escribir por WhatsApp" className="rounded-lg border border-emerald-400/30 p-2 text-emerald-300">
                              <MessageCircle className="h-4 w-4" />
                            </a>
                          )}
                          <button
                            type="button"
                            aria-label="Editar"
                            onClick={() => setFormOp({ id: o.id, cliente: o.cliente, telefono: o.telefono ?? '', vehiculo_interes: o.vehiculo_interes ?? '', origen: o.origen, etapa: o.etapa, valor_estimado: Number(o.valor_estimado) ? String(o.valor_estimado) : '', proxima_accion: o.proxima_accion ?? '', notas: o.notas ?? '' })}
                            className="ml-auto rounded-lg border border-white/10 p-2 text-gray-300"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button type="button" aria-label="Eliminar" onClick={() => void borrarOp(o)} className="rounded-lg border border-white/10 p-2 text-gray-300 hover:text-red-400">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : citas.length === 0 ? (
        <p className="py-14 text-center text-gray-400">Aún no hay citas. Agenda la primera con el botón de arriba.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {citas.map((c) => {
            const wa = enlaceWhatsapp(c.telefono, `Hola ${c.cliente}, te recordamos tu cita (${TIPOS_CITA[c.tipo] ?? c.tipo}) el ${new Date(c.fecha_hora).toLocaleString('es-CO')} en ClickMotores.`);
            return (
              <article key={c.id} className="rounded-2xl border border-white/10 bg-black/60 p-4 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 font-semibold"><CalendarCheck className="h-4 w-4 shrink-0 text-[#FF1E27]" /> {new Date(c.fecha_hora).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                    <p className="mt-1 break-words text-base font-bold">{c.cliente}</p>
                    <p className="break-words text-gray-400">{TIPOS_CITA[c.tipo] ?? c.tipo}{c.vehiculo ? ` · ${c.vehiculo}` : ''}</p>
                    {c.notas && <p className="mt-1 break-words text-xs text-gray-500">{c.notas}</p>}
                  </div>
                  <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${c.estado === 'programada' ? 'border-amber-400/30 text-amber-300' : c.estado === 'realizada' ? 'border-emerald-400/30 text-emerald-300' : 'border-white/15 text-gray-400'}`}>
                    {c.estado === 'programada' ? 'Programada' : c.estado === 'realizada' ? 'Realizada' : 'Cancelada'}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {c.estado === 'programada' && (
                    <>
                      <button type="button" onClick={() => void estadoCita(c, 'realizada')} className="rounded-lg bg-emerald-500/20 px-3 py-2 text-xs font-bold text-emerald-300">Marcar realizada</button>
                      <button type="button" onClick={() => void estadoCita(c, 'cancelada')} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-gray-300">Cancelar</button>
                    </>
                  )}
                  {wa && (
                    <a href={wa} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-lg border border-emerald-400/30 px-3 py-2 text-xs font-bold text-emerald-300">
                      <MessageCircle className="h-4 w-4" /> Recordar
                    </a>
                  )}
                  <button type="button" aria-label="Eliminar cita" onClick={() => void borrarCita(c)} className="ml-auto rounded-lg border border-white/10 p-2 text-gray-300 hover:text-red-400">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {(formOp || formCita) && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true">
          <div className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#FF1E27]/25 bg-[#0c0c0c] p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-extrabold">{formOp ? (formOp.id ? 'Editar cliente' : 'Nuevo cliente') : 'Nueva cita'}</h2>
              <button type="button" aria-label="Cerrar" onClick={() => { setFormOp(null); setFormCita(null); }} className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            {formOp && (
              <div className="space-y-3">
                <input className={campo} placeholder="Nombre del cliente" value={formOp.cliente} onChange={(e) => setFormOp({ ...formOp, cliente: e.target.value })} />
                <input className={campo} type="tel" placeholder="Celular" value={formOp.telefono} onChange={(e) => setFormOp({ ...formOp, telefono: e.target.value })} />
                <input className={campo} placeholder="Vehículo de interés" value={formOp.vehiculo_interes} onChange={(e) => setFormOp({ ...formOp, vehiculo_interes: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <select className={campo} value={formOp.etapa} onChange={(e) => setFormOp({ ...formOp, etapa: e.target.value })}>
                    {ETAPAS.map((x) => <option key={x.id} value={x.id}>{x.etiqueta}</option>)}
                  </select>
                  <select className={campo} value={formOp.origen} onChange={(e) => setFormOp({ ...formOp, origen: e.target.value })}>
                    {ORIGENES.map((x) => <option key={x.id} value={x.id}>{x.etiqueta}</option>)}
                  </select>
                </div>
                <input className={campo} type="number" inputMode="numeric" placeholder="Valor estimado de la venta (COP)" value={formOp.valor_estimado} onChange={(e) => setFormOp({ ...formOp, valor_estimado: e.target.value })} />
                <label className="block text-sm text-gray-400">Próximo contacto
                  <input className={`${campo} mt-1`} type="date" value={formOp.proxima_accion} onChange={(e) => setFormOp({ ...formOp, proxima_accion: e.target.value })} />
                </label>
                <textarea className={campo} rows={3} placeholder="Notas del seguimiento" value={formOp.notas} onChange={(e) => setFormOp({ ...formOp, notas: e.target.value })} />
                <button type="button" disabled={guardando} onClick={() => void guardarOp()} className="w-full rounded-xl bg-[#FF1E27] px-5 py-3 text-base font-bold disabled:opacity-60">
                  {guardando ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            )}
            {formCita && (
              <div className="space-y-3">
                <input className={campo} placeholder="Nombre del cliente" value={formCita.cliente} onChange={(e) => setFormCita({ ...formCita, cliente: e.target.value })} />
                <input className={campo} type="tel" placeholder="Celular" value={formCita.telefono} onChange={(e) => setFormCita({ ...formCita, telefono: e.target.value })} />
                <input className={campo} placeholder="Vehículo" value={formCita.vehiculo} onChange={(e) => setFormCita({ ...formCita, vehiculo: e.target.value })} />
                <select className={campo} value={formCita.tipo} onChange={(e) => setFormCita({ ...formCita, tipo: e.target.value })}>
                  {Object.entries(TIPOS_CITA).map(([id, et]) => <option key={id} value={id}>{et}</option>)}
                </select>
                <input className={campo} type="datetime-local" value={formCita.fecha_hora} min={aInputFecha(new Date().toISOString())} onChange={(e) => setFormCita({ ...formCita, fecha_hora: e.target.value })} />
                <textarea className={campo} rows={2} placeholder="Notas" value={formCita.notas} onChange={(e) => setFormCita({ ...formCita, notas: e.target.value })} />
                <button type="button" disabled={guardando} onClick={() => void guardarCita()} className="w-full rounded-xl bg-[#FF1E27] px-5 py-3 text-base font-bold disabled:opacity-60">
                  {guardando ? 'Guardando…' : 'Agendar cita'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
