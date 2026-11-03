import { ArrowRight, Calendar, Gauge, MapPin, ShieldCheck } from 'lucide-react';

interface MockVehiculo {
  id: string;
  titulo: string;
  tipo: 'moto' | 'carro';
  precio: string;
  km: string;
  ano: string;
  ciudad: string;
  imagen: string;
  insignia: '100% Verificado' | 'Único Dueño' | 'Peritado';
}

const INVENTARIO_EJEMPLO: MockVehiculo[] = [
  {
    id: 'demo-dr150',
    titulo: 'Suzuki DR 150',
    tipo: 'moto',
    precio: '$11.500.000',
    km: '8.200 km',
    ano: '2024',
    ciudad: 'Cali',
    imagen:
      'https://images.pexels.com/photos/1416169/pexels-photo-1416169.jpeg?auto=compress&cs=tinysrgb&w=800',
    insignia: '100% Verificado',
  },
  {
    id: 'demo-nmax',
    titulo: 'Yamaha NMAX Connected',
    tipo: 'moto',
    precio: '$14.900.000',
    km: '3.500 km',
    ano: '2025',
    ciudad: 'Yumbo',
    imagen:
      'https://images.pexels.com/photos/1416169/pexels-photo-1416169.jpeg?auto=compress&cs=tinysrgb&w=800',
    insignia: 'Único Dueño',
  },
  {
    id: 'demo-voge',
    titulo: 'Voge 300R',
    tipo: 'moto',
    precio: '$16.200.000',
    km: '6.800 km',
    ano: '2024',
    ciudad: 'Cali',
    imagen:
      'https://images.pexels.com/photos/1416169/pexels-photo-1416169.jpeg?auto=compress&cs=tinysrgb&w=800',
    insignia: 'Peritado',
  },
  {
    id: 'demo-mazda3',
    titulo: 'Mazda 3 Touring',
    tipo: 'carro',
    precio: '$72.900.000',
    km: '38.000 km',
    ano: '2022',
    ciudad: 'Cali',
    imagen:
      'https://images.pexels.com/photos/1416169/pexels-photo-1416169.jpeg?auto=compress&cs=tinysrgb&w=800',
    insignia: '100% Verificado',
  },
  {
    id: 'demo-onix',
    titulo: 'Chevrolet Onix Turbo',
    tipo: 'carro',
    precio: '$58.500.000',
    km: '25.400 km',
    ano: '2023',
    ciudad: 'Yumbo',
    imagen:
      'https://images.pexels.com/photos/1416169/pexels-photo-1416169.jpeg?auto=compress&cs=tinysrgb&w=800',
    insignia: 'Único Dueño',
  },
];

function estiloInsignia(insignia: MockVehiculo['insignia']): string {
  if (insignia === '100% Verificado') return 'bg-[#FF1E27]/90 text-white border-[#FF1E27]';
  if (insignia === 'Peritado') return 'bg-black/70 text-emerald-300 border-white/20';
  return 'bg-black/70 text-white border-white/20';
}

export function FeaturedInventory({ onVerTodo }: { onVerTodo: () => void }) {
  return (
    <div>
      <style>{`
        @media (hover: hover) and (pointer: fine) {
          .fi-card { position: relative; transition: transform 220ms cubic-bezier(0.23, 1, 0.32, 1), border-color 220ms ease, box-shadow 220ms ease; }
          .fi-card:hover { transform: scale(1.03) translateY(-4px); }
          .fi-card::after { content: ""; position: absolute; left: 1.25rem; right: 1.25rem; bottom: 0; height: 2px; border-radius: 9999px; background: #FF1E27; transform: scaleX(0); transition: transform 300ms cubic-bezier(0.23, 1, 0.32, 1); }
          .fi-card:hover::after { transform: scaleX(1); }
          .fi-img { transition: transform 400ms cubic-bezier(0.23, 1, 0.32, 1); }
          .fi-card:hover .fi-img { transform: scale(1.08); }
        }
        @media (prefers-reduced-motion: reduce) {
          .fi-card, .fi-img { transition: none; }
          .fi-card::after { display: none; }
          .fi-card:hover { transform: none; }
          .fi-card:hover .fi-img { transform: none; }
        }
      `}</style>
      <div className="grid w-full min-w-0 grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {INVENTARIO_EJEMPLO.map((v) => (
          <article
            key={v.id}
            className="fi-card group w-full min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl [-webkit-backdrop-filter:blur(20px)] hover:border-white/25 hover:shadow-[0_16px_50px_rgba(255,30,39,0.18)]"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <img
                src={v.imagen}
                alt={v.titulo}
                loading="lazy"
                className="fi-img h-full w-full max-w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
              <span
                className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide backdrop-blur-md ${estiloInsignia(v.insignia)}`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                {v.insignia}
              </span>
              <span className="absolute right-3 top-3 rounded-full border border-white/20 bg-black/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-200 backdrop-blur-md">
                {v.tipo === 'moto' ? 'Moto' : 'Carro'}
              </span>
            </div>

            <div className="min-w-0 p-4 sm:p-5">
              <h3 className="truncate font-display text-base font-bold text-white sm:text-lg">
                {v.titulo}
              </h3>
              <p className="mt-1 text-xl font-extrabold tracking-tight text-[#FF1E27] sm:text-2xl">
                {v.precio}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-300 sm:text-[13px]">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                  {v.ano}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Gauge className="h-3.5 w-3.5 text-gray-400" />
                  {v.km}
                </span>
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                  <span className="truncate">Matrícula {v.ciudad}</span>
                </span>
              </div>
              <button
                type="button"
                onClick={onVerTodo}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-bold text-white backdrop-blur-md transition-colors hover:border-[#FF1E27]/60 hover:bg-[#FF1E27]/20"
              >
                Ver detalle
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
