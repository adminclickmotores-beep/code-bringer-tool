import { useState } from 'react';
import {
  AlertTriangle, Bike, Car, CheckCircle2, FileCheck2, Landmark, Search, ShieldCheck, TrendingDown, TrendingUp, Users, Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useJg } from '@/jg/JgApp';
import { formatCOP, whatsappLink } from '@/jg/lib/supabase';
import {
  calcularPreciosSugeridos,
  simularReporte,
  type DatosConsulta,
  type PrecioSugerido,
  type ReporteVehiculo,
} from '@/jg/lib/consulta-vehiculo';

const fecha = (d: Date) => d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'America/Bogota' });

function Dato({ icono: Icono, titulo, valor, ok, nota }: {
  icono: typeof ShieldCheck;
  titulo: string;
  valor: string;
  ok: boolean;
  nota: string;
}) {
  return (
    <div className={`rounded-xl border p-4 ${ok ? 'border-green-500/30 bg-green-500/5' : 'border-jg-red/40 bg-jg-red/5'}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-jg-text-muted">
          <Icono className="h-4 w-4 text-jg-red" /> {titulo}
        </span>
        {ok ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-jg-red" />}
      </div>
      <p className="mt-2 text-xl font-bold text-jg-text-dark">{valor}</p>
      <p className="mt-1 text-xs text-jg-text-muted">{nota}</p>
    </div>
  );
}

export function ConsultaVehiculo() {
  const { vehicles } = useJg();
  const [datos, setDatos] = useState<DatosConsulta>({
    tipo: 'moto', placa: '', marca: '', modelo: '', cilindraje: '',
    anio: 2020, kilometraje: 0, ciudad: '', precioAspirado: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<{ reporte: ReporteVehiculo; precios: PrecioSugerido; datos: DatosConsulta } | null>(null);

  const consultar = (e: React.FormEvent) => {
    e.preventDefault();
    if (datos.placa.trim().length < 5 || !datos.marca.trim() || !datos.modelo.trim() || !datos.ciudad.trim()) {
      setError('Completa placa, marca, modelo y ciudad para consultar.');
      return;
    }
    setError(null);
    const ahora = new Date();
    const reporte = simularReporte(datos, ahora);
    const precios = calcularPreciosSugeridos(datos, reporte, vehicles, ahora.getFullYear());
    setResultado({ reporte, precios, datos: { ...datos } });
  };

  const mensajeWhatsApp = () => {
    if (!resultado) return '#';
    const { datos: d, reporte: r, precios: p } = resultado;
    return whatsappLink([
      'Hola ClickMotores, quiero una oferta por mi vehículo:',
      `Tipo: ${d.tipo === 'moto' ? 'Moto' : 'Carro'}`,
      `Placa: ${d.placa}`,
      `Vehículo: ${d.marca} ${d.modelo}${d.cilindraje ? ` ${d.cilindraje}` : ''} ${d.anio}`,
      `Kilometraje: ${d.kilometraje.toLocaleString('es-CO')} km`,
      `Ubicación: ${d.ciudad}`,
      d.precioAspirado ? `Precio aspirado: ${formatCOP(d.precioAspirado)}` : '',
      `Dueños anteriores: ${r.duenos} | Accidentes: ${r.accidentes} | Impuestos: ${r.impuestosAlDia ? 'al día' : 'pendientes'}`,
      `Precio sugerido de compra: ${formatCOP(p.compra)}`,
    ].filter(Boolean).join('\n'));
  };

  return (
    <section className="py-12">
      <div className="mb-6">
        <span className="badge border border-jg-red/30 bg-jg-red/10 text-jg-red"><Search className="h-3.5 w-3.5" /> Consulta de reportes</span>
        <h2 className="mt-3 font-display text-2xl font-bold text-jg-text-dark sm:text-3xl">Registra tu vehículo y conoce su estado al instante</h2>
        <p className="mt-2 max-w-2xl text-sm text-jg-text-muted">Ingresa los datos básicos y te mostramos un tablero con documentos, historial y el precio sugerido de compra y de venta.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <form onSubmit={consultar} className="card p-5 sm:p-6 lg:col-span-2">
          <div className="grid grid-cols-2 gap-3">
            {(['moto', 'carro'] as const).map((t) => (
              <Button key={t} type="button" variant="outline" onClick={() => setDatos({ ...datos, tipo: t })} className={`h-12 ${datos.tipo === t ? 'border-jg-red bg-jg-red/10 text-jg-red' : ''}`}>
                {t === 'moto' ? <Bike /> : <Car />} {t === 'moto' ? 'Moto' : 'Carro'}
              </Button>
            ))}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div><label className="label-field" htmlFor="cv-placa">Placa *</label><input id="cv-placa" maxLength={10} value={datos.placa} onChange={(e) => setDatos({ ...datos, placa: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') })} className="input-field uppercase" placeholder="ABC123" /></div>
            <div><label className="label-field" htmlFor="cv-ciudad">Ubicación *</label><input id="cv-ciudad" maxLength={80} value={datos.ciudad} onChange={(e) => setDatos({ ...datos, ciudad: e.target.value })} className="input-field" placeholder="Cali" /></div>
            <div><label className="label-field" htmlFor="cv-marca">Marca *</label><input id="cv-marca" maxLength={60} value={datos.marca} onChange={(e) => setDatos({ ...datos, marca: e.target.value })} className="input-field" placeholder="Yamaha" /></div>
            <div><label className="label-field" htmlFor="cv-modelo">Modelo *</label><input id="cv-modelo" maxLength={80} value={datos.modelo} onChange={(e) => setDatos({ ...datos, modelo: e.target.value })} className="input-field" placeholder="FZ 2.0" /></div>
            <div><label className="label-field" htmlFor="cv-cilindraje">{datos.tipo === 'moto' ? 'Cilindrada' : 'Motor'}</label><input id="cv-cilindraje" maxLength={30} value={datos.cilindraje} onChange={(e) => setDatos({ ...datos, cilindraje: e.target.value })} className="input-field" placeholder={datos.tipo === 'moto' ? '150 cc' : '1.6 L'} /></div>
            <div><label className="label-field" htmlFor="cv-anio">Año *</label><input id="cv-anio" type="number" min="1980" max={new Date().getFullYear() + 1} value={datos.anio} onChange={(e) => setDatos({ ...datos, anio: Number(e.target.value) })} className="input-field" /></div>
            <div><label className="label-field" htmlFor="cv-km">Kilometraje</label><input id="cv-km" type="number" min="0" max="2000000" value={datos.kilometraje || ''} onChange={(e) => setDatos({ ...datos, kilometraje: Number(e.target.value) })} className="input-field" placeholder="25000" /></div>
            <div><label className="label-field" htmlFor="cv-precio">Precio aspirado (COP)</label><input id="cv-precio" type="number" min="0" value={datos.precioAspirado || ''} onChange={(e) => setDatos({ ...datos, precioAspirado: Number(e.target.value) })} className="input-field" placeholder="12000000" /></div>
          </div>
          {error && <p role="alert" className="mt-4 rounded-lg border border-jg-red/30 bg-jg-red/10 p-3 text-sm text-jg-red">{error}</p>}
          <Button type="submit" className="mt-5 h-12 w-full bg-jg-red text-white hover:bg-jg-red-dark"><Search /> Consultar reporte</Button>
        </form>

        <div className="card panel-digital p-5 sm:p-6 lg:col-span-3">
          {!resultado ? (
            <div className="flex h-full min-h-72 flex-col items-center justify-center text-center">
              <ShieldCheck className="h-12 w-12 text-jg-red" />
              <p className="mt-3 text-lg font-bold text-jg-text-dark">Tu reporte aparecerá aquí</p>
              <p className="mt-1 max-w-xs text-sm text-jg-text-muted">SOAT, técnico-mecánica, accidentes, dueños, impuestos y precios sugeridos.</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-jg-text-muted">Reporte de</p>
                  <p className="text-xl font-bold text-jg-text-dark">{resultado.datos.marca} {resultado.datos.modelo} · {resultado.datos.placa}</p>
                </div>
                <span className="badge border border-jg-silver text-jg-text-muted">{fecha(resultado.reporte.generado)}</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Dato icono={FileCheck2} titulo="SOAT" ok={resultado.reporte.soatVigente} valor={resultado.reporte.soatVigente ? 'Vigente' : 'Vencido'} nota={`${resultado.reporte.soatVigente ? 'Vence' : 'Venció'} el ${fecha(resultado.reporte.soatVence)}`} />
                <Dato icono={Wrench} titulo="Técnico-mecánica" ok={resultado.reporte.tecnoVigente} valor={resultado.reporte.tecnoExenta ? 'Exenta' : resultado.reporte.tecnoVigente ? 'Vigente' : 'Vencida'} nota={resultado.reporte.tecnoVence ? `${resultado.reporte.tecnoVigente ? 'Vence' : 'Venció'} el ${fecha(resultado.reporte.tecnoVence)}` : 'Vehículo nuevo, aún no la requiere'} />
                <Dato icono={AlertTriangle} titulo="Accidentes vigentes" ok={resultado.reporte.accidentes === 0} valor={resultado.reporte.accidentes === 0 ? 'Sin reportes' : `${resultado.reporte.accidentes} reporte(s)`} nota="Siniestros registrados en el historial" />
                <Dato icono={Users} titulo="Dueños anteriores" ok={resultado.reporte.duenos <= 2} valor={String(resultado.reporte.duenos)} nota="Traspasos registrados" />
                <div className="sm:col-span-2">
                  <Dato icono={Landmark} titulo="Impuestos" ok={resultado.reporte.impuestosAlDia} valor={resultado.reporte.impuestosAlDia ? 'Al día' : 'Pendiente'} nota="Estado del impuesto vehicular" />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-jg-red/40 bg-jg-red/5 p-4">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-jg-text-muted"><TrendingDown className="h-4 w-4 text-jg-red" /> Precio sugerido de compra</p>
                  <p className="mt-2 text-2xl font-bold text-jg-text-dark">{formatCOP(resultado.precios.compra)}</p>
                  <p className="mt-1 text-xs text-jg-text-muted">Oferta de retoma</p>
                </div>
                <div className="rounded-xl border border-jg-red/40 bg-jg-red/5 p-4">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-jg-text-muted"><TrendingUp className="h-4 w-4 text-jg-red" /> Precio sugerido de venta</p>
                  <p className="mt-2 text-2xl font-bold text-jg-text-dark">{formatCOP(resultado.precios.venta)}</p>
                  <p className="mt-1 text-xs text-jg-text-muted">Precio de vitrina</p>
                </div>
              </div>

              <ul className="space-y-1 text-xs text-jg-text-muted">
                {resultado.precios.detalle.map((linea) => <li key={linea}>• {linea}</li>)}
              </ul>
              <p className="text-xs text-jg-text-muted">Tablero de referencia con datos simulados; no reemplaza la consulta oficial ni un peritaje.</p>

              <Button asChild className="h-12 w-full bg-jg-red text-white hover:bg-jg-red-dark">
                <a href={mensajeWhatsApp()} target="_blank" rel="noopener noreferrer">Recibir oferta por WhatsApp</a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
