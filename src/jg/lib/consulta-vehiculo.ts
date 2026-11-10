export type DatosConsulta = {
  tipo: 'moto' | 'carro';
  placa: string;
  marca: string;
  modelo: string;
  cilindraje: string;
  anio: number;
  kilometraje: number;
  ciudad: string;
  precioAspirado: number;
};

export type ReporteVehiculo = {
  soatVence: Date;
  soatVigente: boolean;
  tecnoVence: Date | null;
  tecnoVigente: boolean;
  tecnoExenta: boolean;
  accidentes: number;
  duenos: number;
  impuestosAlDia: boolean;
  generado: Date;
};

export type PrecioSugerido = {
  compra: number;
  venta: number;
  referencia: number;
  detalle: string[];
};

// Generador pseudoaleatorio determinista: la misma placa siempre produce el mismo reporte simulado.
function semilla(texto: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i += 1) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sumarDias(base: Date, dias: number): Date {
  const fecha = new Date(base.getTime());
  fecha.setDate(fecha.getDate() + dias);
  return fecha;
}

/** Simula la consulta automatizada de documentos (demostración visual, no consulta el RUNT). */
export function simularReporte(datos: DatosConsulta, ahora: Date): ReporteVehiculo {
  const azar = semilla(`${datos.placa}|${datos.tipo}|${datos.anio}`);
  const soatVence = sumarDias(ahora, Math.round(azar() * 430) - 70);
  const edad = ahora.getFullYear() - datos.anio;
  const tecnoExenta = edad < (datos.tipo === 'moto' ? 2 : 6);
  const tecnoVence = tecnoExenta ? null : sumarDias(ahora, Math.round(azar() * 400) - 80);
  const accidentes = azar() > 0.78 ? 1 + Math.floor(azar() * 2) : 0;
  const duenos = 1 + Math.min(4, Math.floor(azar() * (1 + edad / 4)));
  const impuestosAlDia = azar() > 0.25;
  return {
    soatVence,
    soatVigente: soatVence.getTime() >= ahora.getTime(),
    tecnoVence,
    tecnoVigente: tecnoExenta || (tecnoVence !== null && tecnoVence.getTime() >= ahora.getTime()),
    tecnoExenta,
    accidentes,
    duenos,
    impuestosAlDia,
    generado: ahora,
  };
}

type Comparable = { type: 'moto' | 'carro'; brand: string; model: string; year: number; price: number };

const redondear = (valor: number) => Math.max(500_000, Math.round(valor / 100_000) * 100_000);

/** Calcula el precio sugerido de compra (retoma) y de venta según modelo, año, kilometraje y estado del reporte. */
export function calcularPreciosSugeridos(
  datos: DatosConsulta,
  reporte: ReporteVehiculo,
  inventario: Comparable[],
  anioActual: number,
): PrecioSugerido {
  const marca = datos.marca.trim().toLocaleLowerCase('es-CO');
  const modelo = datos.modelo.trim().toLocaleLowerCase('es-CO');
  const detalle: string[] = [];

  const mismoModelo = inventario.filter((v) =>
    v.type === datos.tipo && v.price > 0
    && v.brand.trim().toLocaleLowerCase('es-CO') === marca
    && v.model.trim().toLocaleLowerCase('es-CO') === modelo);
  const mismaMarca = inventario.filter((v) =>
    v.type === datos.tipo && v.price > 0 && v.brand.trim().toLocaleLowerCase('es-CO') === marca);
  const candidatos = mismoModelo.length > 0 ? mismoModelo : mismaMarca;

  let referencia: number;
  if (candidatos.length > 0) {
    const ajustados = candidatos.map((v) => v.price * Math.pow(0.92, v.year - datos.anio));
    referencia = ajustados.reduce((suma, valor) => suma + valor, 0) / ajustados.length;
    detalle.push(`Base: ${candidatos.length} vehículo(s) similar(es) del inventario ajustados por año.`);
  } else {
    const nuevo = datos.tipo === 'moto' ? 9_000_000 : 70_000_000;
    const edad = Math.max(0, anioActual - datos.anio);
    referencia = nuevo * Math.pow(0.9, edad);
    detalle.push('Base: curva de depreciación del mercado (sin comparables en inventario).');
  }

  let factor = 1;
  const edad = Math.max(1, anioActual - datos.anio);
  const esperado = edad * (datos.tipo === 'moto' ? 7_000 : 14_000);
  if (datos.kilometraje > 0) {
    const exceso = (datos.kilometraje - esperado) / esperado;
    const ajusteKm = Math.max(-0.12, Math.min(0.1, -exceso * 0.08));
    factor += ajusteKm;
    detalle.push(ajusteKm >= 0 ? 'Kilometraje por debajo del promedio: suma valor.' : 'Kilometraje por encima del promedio: resta valor.');
  }
  if (reporte.accidentes > 0) {
    factor -= 0.08 * reporte.accidentes;
    detalle.push(`${reporte.accidentes} reporte(s) de accidente: descuento aplicado.`);
  }
  if (reporte.duenos > 2) {
    factor -= 0.03 * (reporte.duenos - 2);
    detalle.push('Más de dos dueños anteriores: descuento leve.');
  }
  if (!reporte.impuestosAlDia) {
    factor -= 0.02;
    detalle.push('Impuestos pendientes: se descuentan de la oferta.');
  }
  if (!reporte.soatVigente || !reporte.tecnoVigente) {
    factor -= 0.015;
    detalle.push('Documentos vencidos: costo de ponerlos al día.');
  }

  const ajustado = referencia * Math.max(0.5, factor);
  return {
    referencia: redondear(referencia),
    compra: redondear(ajustado * 0.88),
    venta: redondear(ajustado * 1.06),
    detalle,
  };
}
