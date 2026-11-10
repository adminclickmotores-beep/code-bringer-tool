import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BadgeDollarSign, Banknote, CheckCircle2, Loader2, Plus, Receipt, Trash2, TrendingDown, TrendingUp, Users, Wallet,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { formatCOP, type Vehicle } from '@/jg/lib/supabase';

type Movimiento = Tables<'movimientos_financieros'>;
type Consignacion = Tables<'control_consignaciones'>;
type Venta = Tables<'sales'>;
type Cliente = { id: string; name: string; phone: string; mode: string; created_at: string | null };

export type SeccionNegocio = 'panel' | 'finanzas' | 'consignaciones';

const TIPOS_MOV = [
  { id: 'gasto', etiqueta: 'Gasto operativo' },
  { id: 'compra', etiqueta: 'Compra de vehículo' },
  { id: 'pago', etiqueta: 'Pago realizado' },
  { id: 'peritaje', etiqueta: 'Peritaje / inspección' },
] as const;

const etiquetaTipo = (tipo: string) => TIPOS_MOV.find((t) => t.id === tipo)?.etiqueta ?? tipo;
const tasaComision = (tipo: string) => (tipo === 'moto' ? 0.05 : 0.03);
const clave = (iso: string) => iso.slice(0, 7);
const nombreMes = (k: string) => new Date(`${k}-15T12:00:00`).toLocaleDateString('es-CO', { month: 'short' });

function ultimosMeses(n: number): string[] {
  const hoy = new Date();
  const salida: string[] = [];
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    salida.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return salida;
}

const tarjeta = 'rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-black/60 p-4 backdrop-blur-xl sm:p-5';
const campo = 'w-full min-w-0 rounded-xl border border-white/10 bg-black/50 px-3.5 py-3 text-base text-white placeholder:text-gray-500 outline-none focus:border-[#FF1E27]';
const botonRojo = 'flex items-center justify-center gap-2 rounded-xl bg-[#FF1E27] px-5 py-3 text-base font-bold shadow-lg shadow-[#FF1E27]/30 hover:bg-[#D9111A] disabled:opacity-60';

function Kpi({ icono: Icono, titulo, valor, color }: { icono: typeof Wallet; titulo: string; valor: string; color: string }) {
  return (
    <div className={tarjeta}>
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-widest text-gray-500">{titulo}</p>
        <Icono className={`h-4 w-4 ${color}`} />
      </div>
      <p className={`mt-2 break-words text-xl font-extrabold sm:text-2xl ${color}`}>{valor}</p>
    </div>
  );
}

export function CmsNegocio({ seccion, vehiculos }: { seccion: SeccionNegocio; vehiculos: Vehicle[] }) {
  const [movs, setMovs] = useState<Movimiento[]>([]);
  const [consigs, setConsigs] = useState<Consignacion[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const [mov, setMov] = useState({ tipo: 'gasto', concepto: '', monto: '', fecha: new Date().toISOString().slice(0, 10) });
  const [venta, setVenta] = useState({ titulo: '', tipo: 'carro', precio: '' });
  const [con, setCon] = useState({ cliente: '', telefono: '', vehiculo: '', tipo: 'carro', precio: '', pauta: '100000' });

  const cargar = useCallback(async () => {
    setCargando(true);
    const [m, c, s, l] = await Promise.all([
      supabase.from('movimientos_financieros').select('*').order('fecha', { ascending: false }).limit(300),
      supabase.from('control_consignaciones').select('*').order('created_at', { ascending: false }).limit(300),
      supabase.from('sales').select('*').order('sale_date', { ascending: false }).limit(300),
      supabase.from('leads').select('id,name,phone,mode,created_at').order('created_at', { ascending: false }).limit(200),
    ]);
    setMovs(m.data ?? []);
    setConsigs(c.data ?? []);
    setVentas(s.data ?? []);
    setClientes((l.data ?? []) as Cliente[]);
    const falla = m.error ?? c.error ?? s.error;
    setError(falla ? falla.message : '');
    setCargando(false);
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const ejecutar = async (accion: () => PromiseLike<{ error: { message: string } | null }>) => {
    setGuardando(true);
    setError('');
    const { error: e } = await accion();
    setGuardando(false);
    if (e) {
      setError(e.message);
      return;
    }
    await cargar();
  };

  const agregarMov = (e: React.FormEvent) => {
    e.preventDefault();
    const monto = Number(mov.monto);
    if (mov.concepto.trim().length < 2 || !Number.isFinite(monto) || monto <= 0) {
      setError('Escribe el concepto y un monto mayor que cero.');
      return;
    }
    void ejecutar(() => supabase.from('movimientos_financieros').insert({ tipo: mov.tipo, concepto: mov.concepto.trim(), monto, fecha: mov.fecha }))
      .then(() => setMov((p) => ({ ...p, concepto: '', monto: '' })));
  };

  const agregarVenta = (e: React.FormEvent) => {
    e.preventDefault();
    const precio = Number(venta.precio);
    if (venta.titulo.trim().length < 2 || !Number.isFinite(precio) || precio <= 0) {
      setError('Escribe el vehículo y el precio de venta.');
      return;
    }
    const tasa = tasaComision(venta.tipo);
    const comision = Math.round(precio * tasa);
    void ejecutar(() => supabase.from('sales').insert({
      vehicle_title: venta.titulo.trim(),
      sale_type: 'consignacion',
      sale_price: precio,
      commission_rate: tasa * 100,
      commission_amount: comision,
      net_income: comision,
    })).then(() => setVenta((p) => ({ ...p, titulo: '', precio: '' })));
  };

  const agregarCon = (e: React.FormEvent) => {
    e.preventDefault();
    if (con.cliente.trim().length < 2 || con.vehiculo.trim().length < 2) {
      setError('Escribe el cliente y el vehículo.');
      return;
    }
    void ejecutar(() => supabase.from('control_consignaciones').insert({
      cliente: con.cliente.trim(),
      telefono: con.telefono.trim() || null,
      vehiculo: con.vehiculo.trim(),
      tipo_vehiculo: con.tipo,
      precio_venta: Number(con.precio) || 0,
      pauta_valor: Number(con.pauta) || 0,
    })).then(() => setCon((p) => ({ ...p, cliente: '', telefono: '', vehiculo: '', precio: '' })));
  };

  const totales = useMemo(() => {
    const ingresosVentas = ventas.reduce((s, v) => s + Number(v.sale_price), 0);
    const comisiones = ventas.reduce((s, v) => s + Number(v.commission_amount), 0);
    const pautas = consigs.filter((c) => c.pauta_pagada).reduce((s, c) => s + Number(c.pauta_valor), 0);
    const por = (t: string) => movs.filter((m) => m.tipo === t).reduce((s, m) => s + Number(m.monto), 0);
    const egresos = movs.reduce((s, m) => s + Number(m.monto), 0);
    const ingresos = comisiones + pautas;
    return { ingresosVentas, comisiones, pautas, egresos, ingresos, utilidad: ingresos - egresos, por };
  }, [ventas, consigs, movs]);

  const meses = useMemo(() => {
    return ultimosMeses(6).map((k) => {
      const ing = ventas.filter((v) => clave(v.sale_date) === k).reduce((s, v) => s + Number(v.commission_amount), 0)
        + consigs.filter((c) => c.pauta_pagada && clave(c.created_at) === k).reduce((s, c) => s + Number(c.pauta_valor), 0);
      const egr = movs.filter((m) => clave(m.fecha) === k).reduce((s, m) => s + Number(m.monto), 0);
      return { k, ing, egr };
    });
  }, [ventas, consigs, movs]);

  const maximo = Math.max(1, ...meses.map((m) => Math.max(m.ing, m.egr)));

  const clientesUnicos = useMemo(() => {
    const mapa = new Map<string, Cliente>();
    for (const c of clientes) if (!mapa.has(c.phone)) mapa.set(c.phone, c);
    return Array.from(mapa.values());
  }, [clientes]);

  if (cargando) return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-[#FF1E27]" /></div>;

  const errorCaja = error && <p role="alert" className="mb-4 rounded-xl border border-[#FF1E27]/30 bg-[#FF1E27]/10 p-3 text-sm text-red-300">{error}</p>;

  if (seccion === 'panel') {
    const disponibles = vehiculos.filter((v) => v.status === 'disponible').length;
    const vendidos = vehiculos.filter((v) => v.status === 'vendido').length;
    const motos = vehiculos.filter((v) => v.type === 'moto').length;
    const porTipo = TIPOS_MOV.map((t) => ({ ...t, total: totales.por(t.id) }));
    const maxTipo = Math.max(1, ...porTipo.map((t) => t.total));
    return (
      <div className="space-y-4">
        {errorCaja}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi icono={TrendingUp} titulo="Ingresos (comisiones + pautas)" valor={formatCOP(totales.ingresos)} color="text-emerald-400" />
          <Kpi icono={TrendingDown} titulo="Egresos operativos" valor={formatCOP(totales.egresos)} color="text-[#FF1E27]" />
          <Kpi icono={Wallet} titulo="Utilidad estimada" valor={formatCOP(totales.utilidad)} color={totales.utilidad >= 0 ? 'text-white' : 'text-[#FF1E27]'} />
          <Kpi icono={Users} titulo="Clientes" valor={String(clientesUnicos.length)} color="text-white" />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <section className={`${tarjeta} lg:col-span-2`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-bold">Ingresos vs. egresos · últimos 6 meses</h2>
              <span className="flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-400" /> Ingresos</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#FF1E27]" /> Egresos</span>
              </span>
            </div>
            <div className="mt-5 flex h-48 items-end gap-2 sm:gap-4" role="img" aria-label="Gráfico de ingresos y egresos por mes">
              {meses.map((m) => (
                <div key={m.k} className="flex h-full min-w-0 flex-1 flex-col justify-end">
                  <div className="flex h-full items-end justify-center gap-1">
                    <div className="w-1/2 max-w-6 rounded-t bg-emerald-400/90 transition-all" style={{ height: `${(m.ing / maximo) * 100}%`, minHeight: m.ing > 0 ? 4 : 0 }} title={formatCOP(m.ing)} />
                    <div className="w-1/2 max-w-6 rounded-t bg-[#FF1E27] transition-all" style={{ height: `${(m.egr / maximo) * 100}%`, minHeight: m.egr > 0 ? 4 : 0 }} title={formatCOP(m.egr)} />
                  </div>
                  <p className="mt-2 text-center text-xs capitalize text-gray-400">{nombreMes(m.k)}</p>
                </div>
              ))}
            </div>
          </section>

          <section className={tarjeta}>
            <h2 className="font-bold">Estadísticas generales</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-gray-400">Disponibles</dt><dd className="font-bold text-emerald-400">{disponibles}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-400">Vendidos</dt><dd className="font-bold">{vendidos}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-400">Motos / Carros</dt><dd className="font-bold">{motos} / {vehiculos.length - motos}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-400">Ventas registradas</dt><dd className="font-bold">{ventas.length}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-400">Volumen vendido</dt><dd className="font-bold">{formatCOP(totales.ingresosVentas)}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-400">Órdenes entrantes</dt><dd className="font-bold">{clientes.length}</dd></div>
            </dl>
          </section>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <section className={tarjeta}>
            <h2 className="font-bold">Gastos por categoría</h2>
            <div className="mt-4 space-y-3">
              {porTipo.map((t) => (
                <div key={t.id}>
                  <div className="flex justify-between text-xs text-gray-400"><span>{t.etiqueta}</span><span className="font-semibold text-white">{formatCOP(t.total)}</span></div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#FF1E27]" style={{ width: `${(t.total / maxTipo) * 100}%` }} /></div>
                </div>
              ))}
            </div>
          </section>

          <section className={tarjeta}>
            <h2 className="font-bold">Historial de ventas</h2>
            {ventas.length === 0 ? <p className="py-8 text-center text-sm text-gray-500">Aún no hay ventas. Regístralas en la pestaña Finanzas.</p> : (
              <ul className="mt-3 space-y-2">
                {ventas.slice(0, 6).map((v) => (
                  <li key={v.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm">
                    <p className="font-semibold">{v.vehicle_title}</p>
                    <p className="text-gray-400">{formatCOP(Number(v.sale_price))} · comisión {formatCOP(Number(v.commission_amount))}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={tarjeta}>
            <h2 className="font-bold">Gestión de clientes</h2>
            {clientesUnicos.length === 0 ? <p className="py-8 text-center text-sm text-gray-500">Aún no hay clientes.</p> : (
              <ul className="mt-3 space-y-2">
                {clientesUnicos.slice(0, 6).map((c) => (
                  <li key={c.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm">
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-gray-400">{c.phone} · {c.mode === 'consignacion' ? 'Consignación' : 'Compra directa'}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    );
  }

  if (seccion === 'finanzas') {
    return (
      <div className="space-y-4">
        {errorCaja}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {TIPOS_MOV.map((t) => <Kpi key={t.id} icono={Receipt} titulo={t.etiqueta} valor={formatCOP(totales.por(t.id))} color="text-white" />)}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <form onSubmit={agregarMov} className={tarjeta}>
            <h2 className="font-bold">Registrar movimiento</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <select value={mov.tipo} onChange={(e) => setMov({ ...mov, tipo: e.target.value })} className={campo} aria-label="Tipo de movimiento">
                {TIPOS_MOV.map((t) => <option key={t.id} value={t.id}>{t.etiqueta}</option>)}
              </select>
              <input type="date" value={mov.fecha} onChange={(e) => setMov({ ...mov, fecha: e.target.value })} className={campo} aria-label="Fecha" />
              <input value={mov.concepto} maxLength={160} onChange={(e) => setMov({ ...mov, concepto: e.target.value })} placeholder="Concepto" className={`${campo} sm:col-span-2`} />
              <input type="number" min="0" value={mov.monto} onChange={(e) => setMov({ ...mov, monto: e.target.value })} placeholder="Monto (COP)" className={`${campo} sm:col-span-2`} />
            </div>
            <button type="submit" disabled={guardando} className={`${botonRojo} mt-4 w-full`}><Plus className="h-4 w-4" /> Añadir movimiento</button>
          </form>

          <form onSubmit={agregarVenta} className={tarjeta}>
            <h2 className="font-bold">Registrar venta</h2>
            <p className="mt-1 text-xs text-gray-400">La comisión se calcula sola: 3% carros, 5% motos.</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <input value={venta.titulo} maxLength={160} onChange={(e) => setVenta({ ...venta, titulo: e.target.value })} placeholder="Vehículo vendido" className={`${campo} sm:col-span-2`} />
              <select value={venta.tipo} onChange={(e) => setVenta({ ...venta, tipo: e.target.value })} className={campo} aria-label="Tipo de vehículo">
                <option value="carro">Carro (3%)</option>
                <option value="moto">Moto (5%)</option>
              </select>
              <input type="number" min="0" value={venta.precio} onChange={(e) => setVenta({ ...venta, precio: e.target.value })} placeholder="Precio de venta" className={campo} />
            </div>
            <button type="submit" disabled={guardando} className={`${botonRojo} mt-4 w-full`}><BadgeDollarSign className="h-4 w-4" /> Registrar venta</button>
          </form>
        </div>

        <section className={tarjeta}>
          <h2 className="font-bold">Movimientos recientes</h2>
          {movs.length === 0 ? <p className="py-10 text-center text-sm text-gray-500">Aún no hay movimientos registrados.</p> : (
            <div className="mt-3 overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="bg-black/70 text-xs uppercase text-gray-400"><tr><th className="px-4 py-3">Fecha</th><th className="px-4 py-3">Tipo</th><th className="px-4 py-3">Concepto</th><th className="px-4 py-3">Monto</th><th className="px-4 py-3" /></tr></thead>
                <tbody className="divide-y divide-white/10">
                  {movs.slice(0, 40).map((m) => (
                    <tr key={m.id} className="hover:bg-white/5">
                      <td className="whitespace-nowrap px-4 py-3 text-gray-400">{m.fecha}</td>
                      <td className="px-4 py-3">{etiquetaTipo(m.tipo)}</td>
                      <td className="px-4 py-3">{m.concepto}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-bold">{formatCOP(Number(m.monto))}</td>
                      <td className="px-4 py-3"><button type="button" aria-label="Eliminar movimiento" onClick={() => void ejecutar(() => supabase.from('movimientos_financieros').delete().eq('id', m.id))} className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-[#FF1E27]"><Trash2 className="h-4 w-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    );
  }

  const pautasPagadas = consigs.filter((c) => c.pauta_pagada).length;
  const comisionPendiente = consigs.filter((c) => c.comision_estado === 'pendiente').reduce((s, c) => s + c.precio_venta * tasaComision(c.tipo_vehiculo), 0);
  const comisionCobrada = consigs.filter((c) => c.comision_estado === 'cobrada').reduce((s, c) => s + c.precio_venta * tasaComision(c.tipo_vehiculo), 0);

  return (
    <div className="space-y-4">
      {errorCaja}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi icono={Banknote} titulo="Pautas pagadas" valor={`${pautasPagadas} de ${consigs.length}`} color="text-emerald-400" />
        <Kpi icono={Wallet} titulo="Pautas recaudadas" valor={formatCOP(totales.pautas)} color="text-white" />
        <Kpi icono={TrendingUp} titulo="Comisión cobrada" valor={formatCOP(comisionCobrada)} color="text-emerald-400" />
        <Kpi icono={TrendingDown} titulo="Comisión pendiente" valor={formatCOP(comisionPendiente)} color="text-[#FF1E27]" />
      </div>

      <form onSubmit={agregarCon} className={tarjeta}>
        <h2 className="font-bold">Nueva consignación</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <input value={con.cliente} maxLength={100} onChange={(e) => setCon({ ...con, cliente: e.target.value })} placeholder="Cliente" className={campo} />
          <input value={con.telefono} maxLength={20} onChange={(e) => setCon({ ...con, telefono: e.target.value })} placeholder="Teléfono" className={campo} />
          <input value={con.vehiculo} maxLength={160} onChange={(e) => setCon({ ...con, vehiculo: e.target.value })} placeholder="Vehículo (marca, modelo, año)" className={campo} />
          <select value={con.tipo} onChange={(e) => setCon({ ...con, tipo: e.target.value })} className={campo} aria-label="Tipo de vehículo">
            <option value="carro">Carro (3%)</option>
            <option value="moto">Moto (5%)</option>
          </select>
          <input type="number" min="0" value={con.precio} onChange={(e) => setCon({ ...con, precio: e.target.value })} placeholder="Precio de venta acordado" className={campo} />
          <input type="number" min="0" value={con.pauta} onChange={(e) => setCon({ ...con, pauta: e.target.value })} placeholder="Valor de la pauta" className={campo} />
        </div>
        <button type="submit" disabled={guardando} className={`${botonRojo} mt-4 w-full sm:w-auto`}><Plus className="h-4 w-4" /> Añadir consignación</button>
      </form>

      <section className={tarjeta}>
        <h2 className="font-bold">Control de pautas y comisiones</h2>
        {consigs.length === 0 ? <p className="py-10 text-center text-sm text-gray-500">Aún no hay consignaciones registradas.</p> : (
          <div className="mt-3 overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-black/70 text-xs uppercase text-gray-400"><tr><th className="px-4 py-3">Cliente</th><th className="px-4 py-3">Vehículo</th><th className="px-4 py-3">Pauta</th><th className="px-4 py-3">Comisión</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3" /></tr></thead>
              <tbody className="divide-y divide-white/10">
                {consigs.map((c) => (
                  <tr key={c.id} className="hover:bg-white/5">
                    <td className="px-4 py-3"><p className="font-semibold">{c.cliente}</p><p className="text-xs text-gray-500">{c.telefono ?? '—'}</p></td>
                    <td className="px-4 py-3"><p>{c.vehiculo}</p><p className="text-xs text-gray-500">{c.tipo_vehiculo === 'moto' ? 'Moto' : 'Carro'} · {formatCOP(Number(c.precio_venta))}</p></td>
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => void ejecutar(() => supabase.from('control_consignaciones').update({ pauta_pagada: !c.pauta_pagada }).eq('id', c.id))} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${c.pauta_pagada ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' : 'border-[#FF1E27]/40 bg-[#FF1E27]/10 text-red-300'}`}>
                        {c.pauta_pagada && <CheckCircle2 className="h-3.5 w-3.5" />} {c.pauta_pagada ? 'Pagada' : 'Sin pagar'} · {formatCOP(Number(c.pauta_valor))}
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-bold">{formatCOP(Math.round(c.precio_venta * tasaComision(c.tipo_vehiculo)))} <span className="text-xs font-normal text-gray-500">({c.tipo_vehiculo === 'moto' ? '5%' : '3%'})</span></td>
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => void ejecutar(() => supabase.from('control_consignaciones').update({ comision_estado: c.comision_estado === 'cobrada' ? 'pendiente' : 'cobrada' }).eq('id', c.id))} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${c.comision_estado === 'cobrada' ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' : 'border-white/15 bg-white/5 text-gray-300'}`}>
                        {c.comision_estado === 'cobrada' ? 'Cobrada' : 'Pendiente'}
                      </button>
                    </td>
                    <td className="px-4 py-3"><button type="button" aria-label="Eliminar consignación" onClick={() => void ejecutar(() => supabase.from('control_consignaciones').delete().eq('id', c.id))} className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-[#FF1E27]"><Trash2 className="h-4 w-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
