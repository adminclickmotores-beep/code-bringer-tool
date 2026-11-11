import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Bike, Car, CheckCircle2, Handshake, Loader2, Pencil, Plus, ShieldCheck, Store, Users, Wallet, X } from 'lucide-react';
import { CmsNegocio } from '@/jg/components/CmsNegocio';
import { CmsCompraventas } from '@/jg/components/CmsCompraventas';
import { supabase } from '@/integrations/supabase/client';
import { formatCOP, normalizeVehicle, type Vehicle } from '@/jg/lib/supabase';
import { CmsVehicleForm, type CmsVehicleFormValue } from '@/jg/components/CmsVehicleForm';

type Tab = 'panel' | 'inventario' | 'finanzas' | 'consignaciones' | 'leads' | 'compraventas';

type Consulta = {
  id: string;
  type: string;
  vehicle_title: string | null;
  contact: string | null;
  notes: string | null;
  created_at: string | null;
};

type LeadComercial = {
  id: string;
  name: string;
  phone: string;
  mode: string;
  brand: string;
  model: string;
  created_at: string | null;
};

function aVehiculoAdmin(v: CmsVehicleFormValue) {
  const precio = Number(v.precio);
  const kilometraje = v.kilometraje.trim() === '' ? null : Number(v.kilometraje);
  const atributos = v.atributos.trim();
  return {
    title: `${v.marca.trim()} ${v.modelo.trim()} ${v.anio}`.trim(),
    type: v.tipo,
    brand: v.marca.trim(),
    model: v.modelo.trim(),
    year: v.anio,
    price: precio,
    status: 'disponible' as const,
    mileage: kilometraje,
    ciudad: v.ciudadPlaca.trim() || 'Yumbo',
    description: atributos ? `Atributos destacados: ${atributos}` : null,
    image_urls: v.fotos,
  };
}

export function CmsPage({
  userEmail,
  onLogout,
}: {
  userEmail: string;
  onLogout: () => Promise<void>;
}) {
  const [tab, setTab] = useState<Tab>('panel');
  const [vehiculos, setVehiculos] = useState<Vehicle[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [dialogo, setDialogo] = useState<null | { modo: 'crear' } | { modo: 'editar'; vehiculo: Vehicle }>(null);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState('');
  const [errorLista, setErrorLista] = useState('');
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [leads, setLeads] = useState<LeadComercial[]>([]);
  const [cargandoLeads, setCargandoLeads] = useState(false);

  const cargarInventario = async () => {
    setCargando(true);
    setErrorLista('');
    try {
      const { data, error } = await supabase.from('vehicles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setVehiculos(((data ?? []) as Vehicle[]).map(normalizeVehicle));
    } catch (err) {
      setErrorLista(err instanceof Error ? err.message : 'No se pudo cargar el inventario.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargarInventario();
  }, []);

  const cargarLeads = async () => {
    setCargandoLeads(true);
    try {
      const [c, l] = await Promise.all([
        supabase.from('consultas').select('id,type,vehicle_title,contact,notes,created_at').order('created_at', { ascending: false }).limit(100),
        supabase.from('leads').select('id,name,phone,mode,brand,model,created_at').order('created_at', { ascending: false }).limit(100),
      ]);
      if (c.data) setConsultas(c.data as Consulta[]);
      if (l.data) setLeads(l.data as LeadComercial[]);
    } catch {
      /* se muestra el inventario aunque fallen los leads */
    } finally {
      setCargandoLeads(false);
    }
  };

  useEffect(() => {
    if (tab === 'leads') void cargarLeads();
  }, [tab]);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return vehiculos;
    return vehiculos.filter((v) =>
      `${v.title} ${v.brand} ${v.model} ${v.year}`.toLowerCase().includes(q),
    );
  }, [vehiculos, busqueda]);

  const guardar = async (valor: CmsVehicleFormValue) => {
    if (!valor.marca.trim() || !valor.modelo.trim() || !valor.precio.trim()) {
      setErrorForm('Completa marca, modelo y precio.');
      return;
    }
    if (!Number.isFinite(Number(valor.precio)) || Number(valor.precio) <= 0) {
      setErrorForm('Ingresa un precio válido mayor que cero.');
      return;
    }
    setGuardando(true);
    setErrorForm('');
    try {
      const datos = aVehiculoAdmin(valor);
      if (dialogo?.modo === 'editar') {
        const { error } = await supabase.from('vehicles').update(datos).eq('id', dialogo.vehiculo.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('vehicles').insert(datos);
        if (error) throw error;
      }
      setDialogo(null);
      await cargarInventario();
    } catch (err) {
      setErrorForm(err instanceof Error ? err.message : 'No se pudo guardar.');
    } finally {
      setGuardando(false);
    }
  };

  const marcarVendido = async (v: Vehicle) => {
    const confirmado = window.confirm(`¿Marcar "${v.title}" como vendido?`);
    if (!confirmado) return;
    const { error } = await supabase.from('vehicles').update({ status: 'vendido', tag: 'vendido' }).eq('id', v.id);
    if (!error) await cargarInventario();
  };

  const disponible = vehiculos.filter((v) => v.status === 'disponible').length;

  return (
    <div className="min-h-screen bg-[#070707] px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-4 rounded-2xl border border-white/10 bg-gradient-to-r from-[#FF1E27]/10 via-black/60 to-black/60 p-5 shadow-2xl shadow-black/50 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FF1E27]/15 text-[#FF1E27]">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">Panel privado · CMS</h1>
              <p className="text-sm text-gray-400">{userEmail}</p>
            </div>
          </div>
          <button type="button" onClick={onLogout} className="rounded-xl bg-white/10 px-4 py-3 text-base font-semibold hover:bg-white/15">
            Cerrar sesión
          </button>
        </header>

        <div className="mb-4 grid grid-cols-2 gap-3 sm:max-w-md">
          <div className="rounded-2xl border border-white/10 bg-black/60 p-4">
            <p className="text-xs uppercase tracking-widest text-gray-500">Inventario</p>
            <p className="mt-1 text-2xl font-extrabold">{vehiculos.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/60 p-4">
            <p className="text-xs uppercase tracking-widest text-gray-500">Disponibles</p>
            <p className="mt-1 text-2xl font-extrabold text-emerald-400">{disponible}</p>
          </div>
        </div>

        <nav className="mb-5 flex gap-1 overflow-x-auto border-b border-white/10 sm:gap-2">
          {(
            [
              { id: 'panel' as Tab, etiqueta: 'Panel', Icono: BarChart3 },
              { id: 'inventario' as Tab, etiqueta: 'Inventario', Icono: Car },
              { id: 'finanzas' as Tab, etiqueta: 'Finanzas', Icono: Wallet },
              { id: 'consignaciones' as Tab, etiqueta: 'Consignaciones', Icono: Handshake },
              { id: 'leads' as Tab, etiqueta: 'Leads de Clientes', Icono: Users },
              { id: 'compraventas' as Tab, etiqueta: 'Compraventas', Icono: Store },
            ]
          ).map(({ id, etiqueta, Icono }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-base font-semibold transition-colors sm:px-4 ${
                tab === id ? 'border-[#FF1E27] text-white' : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Icono className="h-4 w-4" />
              {etiqueta}
            </button>
          ))}
        </nav>

        {(tab === 'panel' || tab === 'finanzas' || tab === 'consignaciones') && (
          <CmsNegocio key={tab} seccion={tab} vehiculos={vehiculos} />
        )}

        {tab === 'inventario' && (
          <section className="rounded-2xl border border-white/10 bg-black/60 p-4 backdrop-blur-xl sm:p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar marca o modelo…"
                className="w-full min-w-0 flex-1 rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-base text-white placeholder:text-gray-500 outline-none focus:border-[#FF1E27]"
              />
              <button type="button" onClick={() => { setErrorForm(''); setDialogo({ modo: 'crear' }); }} className="flex items-center justify-center gap-2 rounded-xl bg-[#FF1E27] px-5 py-3 text-base font-bold shadow-lg shadow-[#FF1E27]/30 hover:bg-[#D9111A]">
                <Plus className="h-4 w-4" /> Añadir Vehículo
              </button>
            </div>

            {errorLista && <p className="mb-3 rounded-xl border border-[#FF1E27]/30 bg-[#FF1E27]/10 p-3 text-sm text-red-300">{errorLista}</p>}

            {cargando ? (
              <div className="flex justify-center py-14"><Loader2 className="h-8 w-8 animate-spin text-[#FF1E27]" /></div>
            ) : filtrados.length === 0 ? (
              <p className="py-14 text-center text-gray-400">No hay vehículos. Añade el primero con el botón de arriba.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-black/70 text-xs uppercase text-gray-400">
                    <tr>
                      <th className="px-4 py-3.5">Vehículo</th>
                      <th className="px-4 py-3.5">Tipo</th>
                      <th className="px-4 py-3.5">Precio</th>
                      <th className="px-4 py-3.5">Estado</th>
                      <th className="px-4 py-3.5">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filtrados.map((v) => (
                      <tr key={v.id} className="transition-colors hover:bg-white/5">
                        <td className="px-4 py-3.5">
                          <p className="font-semibold">{v.title}</p>
                          <p className="mt-0.5 text-xs text-gray-500">{v.year} · {v.ciudad ?? '—'} · {v.mileage ? `${Number(v.mileage).toLocaleString('es-CO')} km` : 'Km sin registrar'}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1.5 text-gray-300">
                            {v.type === 'moto' ? <Bike className="h-4 w-4 text-[#FF1E27]" /> : <Car className="h-4 w-4 text-[#FF1E27]" />}
                            {v.type === 'moto' ? 'Moto' : 'Carro'}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 font-bold">{formatCOP(Number(v.price))}</td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${v.status === 'vendido' ? 'border-white/15 bg-white/5 text-gray-300' : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${v.status === 'vendido' ? 'bg-gray-400' : 'bg-emerald-400'}`} />
                            {v.status === 'vendido' ? 'Vendido' : v.status === 'disponible' ? 'Disponible' : v.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <button type="button" aria-label="Editar datos" title="Editar Datos" onClick={() => { setErrorForm(''); setDialogo({ modo: 'editar', vehiculo: v }); }} className="rounded-lg border border-white/10 bg-white/5 p-2 text-gray-200 hover:border-[#FF1E27]/50 hover:text-white">
                              <Pencil className="h-4 w-4" />
                            </button>
                            {v.status !== 'vendido' && (
                              <button type="button" onClick={() => void marcarVendido(v)} title="Marcar como vendido" className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-[#FF1E27]">
                                <CheckCircle2 className="h-4 w-4" /> Vendido
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {tab === 'compraventas' && <CmsCompraventas />}
        {tab === 'leads' && (
          <section className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/60 p-4 backdrop-blur-xl sm:p-5">
              <h2 className="font-bold">Cotizador de seguros / SOAT</h2>
              <p className="mt-1 text-sm text-gray-400">Solicitudes del cotizador, las más recientes primero.</p>
              {cargandoLeads ? (
                <div className="flex justify-center py-10"><Loader2 className="h-7 w-7 animate-spin text-[#FF1E27]" /></div>
              ) : consultas.length === 0 ? (
                <p className="py-10 text-center text-sm text-gray-500">Aún no hay solicitudes del cotizador.</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {consultas.map((c) => (
                    <article key={c.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5 text-sm">
                      <p className="font-semibold">{c.vehicle_title ?? 'Cotización de seguro'}</p>
                      <p className="mt-0.5 break-words text-gray-400">Contacto: {c.contact ?? '—'}</p>
                      {c.notes && <p className="mt-0.5 break-words text-gray-500">{c.notes}</p>}
                      <p className="mt-1 text-xs text-gray-600">{c.created_at ? new Date(c.created_at).toLocaleString('es-CO') : ''}</p>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/60 p-4 backdrop-blur-xl sm:p-5">
              <h2 className="font-bold">Consignación y compra directa</h2>
              <p className="mt-1 text-sm text-gray-400">Formularios de “vende tu vehículo”, los más recientes primero.</p>
              {cargandoLeads ? (
                <div className="flex justify-center py-10"><Loader2 className="h-7 w-7 animate-spin text-[#FF1E27]" /></div>
              ) : leads.length === 0 ? (
                <p className="py-10 text-center text-sm text-gray-500">Aún no hay solicitudes de consignación.</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {leads.map((l) => (
                    <article key={l.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5 text-sm">
                      <p className="font-semibold">{l.name} · {l.phone}</p>
                      <p className="mt-0.5 text-gray-400">{l.brand} {l.model} · {l.mode === 'consignacion' ? 'Consignación' : 'Compra directa'}</p>
                      <p className="mt-1 text-xs text-gray-600">{l.created_at ? new Date(l.created_at).toLocaleString('es-CO') : ''}</p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {dialogo && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true">
          <div className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#FF1E27]/25 bg-[#0c0c0c] p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-extrabold">{dialogo.modo === 'crear' ? 'Añadir Vehículo' : 'Editar Datos'}</h2>
              <button type="button" onClick={() => setDialogo(null)} aria-label="Cerrar" className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <CmsVehicleForm
              inicial={
                dialogo.modo === 'editar'
                  ? {
                      marca: dialogo.vehiculo.brand ?? '',
                      modelo: dialogo.vehiculo.model ?? '',
                      anio: Number(dialogo.vehiculo.year) || new Date().getFullYear(),
                      kilometraje: dialogo.vehiculo.mileage != null ? String(dialogo.vehiculo.mileage) : '',
                      ciudadPlaca: dialogo.vehiculo.ciudad ?? 'Yumbo',
                      precio: String(dialogo.vehiculo.price ?? ''),
                      atributos: (dialogo.vehiculo.description ?? '').replace(/^Atributos destacados:\s*/i, ''),
                      fotos: Array.isArray(dialogo.vehiculo.image_urls) ? dialogo.vehiculo.image_urls : [],
                      tipo: dialogo.vehiculo.type === 'carro' ? 'carro' : 'moto',
                    }
                  : {}
              }
              guardando={guardando}
              error={errorForm}
              onGuardar={guardar}
              onCancelar={() => setDialogo(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
