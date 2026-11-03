import { useState } from 'react';
import { Bike, Car, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { logConsulta, whatsappLink } from '@/jg/lib/supabase';

type TipoVehiculo = 'carro' | 'moto';
type Estado = 'idle' | 'cargando' | 'exito';

const inputClase =
  'w-full min-w-0 rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-base text-white placeholder:text-gray-500 outline-none transition-colors focus:border-[#FF1E27] focus:ring-2 focus:ring-[#FF1E27]/40';

export function SoatQuoteForm() {
  const [placa, setPlaca] = useState('');
  const [tipo, setTipo] = useState<TipoVehiculo>('carro');
  const [telefono, setTelefono] = useState('');
  const [estado, setEstado] = useState<Estado>('idle');
  const [error, setError] = useState('');

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    const placaLimpia = placa.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const telefonoLimpio = telefono.replace(/\D/g, '');
    if (!/^[A-Z]{3}\d{2}[A-Z]$|^[A-Z]{3}\d{3}$/.test(placaLimpia)) {
      setError('Revisa la placa: usa el formato ABC123 o ABC12D.');
      return;
    }
    if (!/^3\d{9}$/.test(telefonoLimpio)) {
      setError('Escribe un celular colombiano de 10 dígitos que empiece por 3.');
      return;
    }
    setError('');
    setEstado('cargando');
    try {
      await supabase.from('buyer_interests').insert({
        buyer_name: 'Cotización SOAT',
        buyer_phone: telefonoLimpio,
        vehicle_id: null,
        vehicle_title: `SOAT ${tipo === 'carro' ? 'carro' : 'moto'} ${placaLimpia}`,
        vehicle_plate: placaLimpia,
        contact_target: 'jg',
      });
      await logConsulta('cotizacion_seguro', `SOAT ${placaLimpia}`, telefonoLimpio);
      await new Promise((r) => setTimeout(r, 1800));
      setEstado('exito');
    } catch {
      setEstado('idle');
      setError('No pudimos enviar tu solicitud. Intenta de nuevo o escríbenos por WhatsApp.');
    }
  };

  if (estado === 'exito') {
    return (
      <div className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-5 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />
        <p className="mt-3 font-display text-base font-bold text-white">¡Solicitud recibida!</p>
        <p className="mt-2 text-sm leading-relaxed text-gray-300">
          Un asesor especializado de JG Motors se contactará contigo en menos de 10 minutos con
          las cotizaciones de las mejores aseguradoras para tu placa {placa.toUpperCase()}.
        </p>
        <button
          type="button"
          onClick={() => {
            setEstado('idle');
            setPlaca('');
            setTelefono('');
          }}
          className="mt-4 text-sm font-semibold text-gray-300 underline-offset-4 hover:text-white hover:underline"
        >
          Cotizar otra placa
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="mt-4 w-full min-w-0 space-y-3">
      <div>
        <label htmlFor="soat-placa" className="mb-1.5 block text-xs font-semibold text-gray-300">
          Placa del vehículo
        </label>
        <input
          id="soat-placa"
          type="text"
          value={placa}
          onChange={(e) => setPlaca(e.target.value.toUpperCase().slice(0, 7))}
          placeholder="ABC123"
          autoComplete="off"
          className={`${inputClase} uppercase tracking-[0.2em] text-center font-bold`}
        />
      </div>

      <div>
        <span className="mb-1.5 block text-xs font-semibold text-gray-300">Tipo de vehículo</span>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { valor: 'carro', etiqueta: 'Carro', Icono: Car },
              { valor: 'moto', etiqueta: 'Moto', Icono: Bike },
            ] as const
          ).map(({ valor, etiqueta, Icono }) => (
            <button
              key={valor}
              type="button"
              onClick={() => setTipo(valor)}
              aria-pressed={tipo === valor}
              className={`flex min-w-0 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-base font-bold transition-colors ${
                tipo === valor
                  ? 'border-[#FF1E27] bg-[#FF1E27]/15 text-white'
                  : 'border-white/10 bg-black/40 text-gray-400 hover:border-white/25 hover:text-white'
              }`}
            >
              <Icono className="h-4 w-4 shrink-0" />
              {etiqueta}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="soat-telefono" className="mb-1.5 block text-xs font-semibold text-gray-300">
          WhatsApp / Teléfono
        </label>
        <input
          id="soat-telefono"
          type="tel"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value.replace(/\D/g, '').slice(0, 10))}
          placeholder="3001234567"
          inputMode="numeric"
          autoComplete="tel"
          className={inputClase}
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={estado === 'cargando'}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF1E27] px-4 py-3.5 text-base font-bold text-white shadow-lg shadow-[#FF1E27]/30 transition-all hover:bg-[#D9111A] active:bg-[#B30D15] disabled:cursor-wait disabled:opacity-80"
      >
        {estado === 'cargando' ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Calculando mejores tarifas...
          </>
        ) : (
          <>
            <ShieldCheck className="h-5 w-5" />
            Cotizar Seguro o SOAT
          </>
        )}
      </button>

      <p className="text-center text-[11px] leading-relaxed text-gray-500">
        Sin compromiso · Respuesta en menos de 10 minutos ·{' '}
        <a
          href={whatsappLink('Hola ClickMotores, me gustaría cotizar un seguro o SOAT para mi vehículo.')}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-gray-300"
        >
          o escríbenos directo
        </a>
      </p>
    </form>
  );
}
