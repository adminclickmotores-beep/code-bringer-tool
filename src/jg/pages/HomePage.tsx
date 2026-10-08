import { useState } from 'react';
import {
  ShieldCheck,
  Award,
  Zap,
  Bike,
  Car,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Handshake,
  Search,
  FileText,
  ChevronDown,
  HelpCircle,
} from 'lucide-react';
import { Vehicle, whatsappLink, logConsulta } from '@/jg/lib/supabase';
import { VehicleCard } from '@/jg/components/VehicleCard';

interface HomePageProps {
  vehicles: Vehicle[];
  loading: boolean;
  onNavigate: (page: string) => void;
  onVehicleClick: (vehicle: Vehicle) => void;
}

const heroImage = 'https://images.pexels.com/photos/38570/lamborghini-car-speed-prestige-38570.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

function BankLogo({ name }: { name: string }) {
  const logos: Record<string, React.ReactElement> = {
    Sufi: (
      <svg viewBox="0 0 120 40" className="h-8" fill="none">
        <text x="10" y="28" font-family="Poppins, Arial" font-size="20" font-weight="700" fill="#E2E8F0">Sufi</text>
        <circle cx="100" cy="20" r="6" fill="#E53E3E" opacity="0.8" />
      </svg>
    ),
    'Banco de Bogotá': (
      <svg viewBox="0 0 140 40" className="h-8" fill="none">
        <text x="5" y="28" font-family="Poppins, Arial" font-size="14" font-weight="600" fill="#E2E8F0">Banco de Bogotá</text>
      </svg>
    ),
    'Santander Finandina': (
      <svg viewBox="0 0 150 40" className="h-8" fill="none">
        <text x="5" y="28" font-family="Poppins, Arial" font-size="14" font-weight="600" fill="#E2E8F0">Santander</text>
        <text x="85" y="28" font-family="Poppins, Arial" font-size="12" font-weight="400" fill="#A0AEC0">Finandina</text>
      </svg>
    ),
  };
  return logos[name] ?? <span className="text-sm font-medium text-gray-600">{name}</span>;
}

const faqItems = [
  {
    q: '¿Qué es una retoma y cómo funciona?',
    a: 'La retoma es cuando recibimos tu moto o carro actual de menor valor como cuota inicial para que puedas adquirir un vehículo de mayor valor. El saldo se financia con nuestros bancos aliados.',
  },
  {
    q: '¿Qué incluye el trámite de traspaso?',
    a: 'Gestionamos todo el traspaso legal a nombre del nuevo dueño ante el RUNT y el Ministerio de Transporte. Sin complicaciones ni costos adicionales para ti.',
  },
  {
    q: '¿Cómo funciona la consignación de mi vehículo?',
    a: 'Pagas un único valor de $100.000 COP para pauta digital dedicada. Nosotros nos encargamos de publicar, buscar comprador y gestionar la venta. Al concretar, cobramos 3% para carros y 5% para motos.',
  },
  {
    q: '¿Puedo financiar un vehículo usado?',
    a: 'Sí. Trabajamos con Sufi, Banco de Bogotá y Santander Finandina para ofrecerte las mejores opciones de crédito, sujeto a estudio crediticio según tu perfil.',
  },
  {
    q: '¿Los vehículos están verificados?',
    a: 'Cada vehículo pasa por una inspección técnica completa. Garantizamos que no tienen chicharrones ni fallas ocultas. Todos llevan el sello "Verificado JG - Listo para Traspaso".',
  },
];

export function HomePage({ vehicles, loading, onNavigate, onVehicleClick }: HomePageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const featured = vehicles.filter((v) => v.featured).slice(0, 6);
  const displayVehicles = featured.length > 0 ? featured : vehicles.slice(0, 6);

  const motosCount = vehicles.filter((v) => v.type === 'moto').length;
  const carrosCount = vehicles.filter((v) => v.type === 'carro').length;

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative flex min-h-[85vh] items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="ClickMotores" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-jg-black via-jg-black/85 to-jg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-jg-black via-transparent to-jg-black/50" />
          <div className="absolute inset-0 grid-pattern opacity-30" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="animate-fade-up flex items-center gap-2">
              <span className="badge bg-jg-red/15 text-jg-red border border-jg-red/30">
                <Zap className="h-3.5 w-3.5" />
                Yumbo, Valle del Cauca
              </span>
            </div>
            <h1 className="mt-5 animate-fade-up font-display text-4xl font-bold leading-tight text-jg-text-dark animate-delay-100 sm:text-5xl md:text-6xl">
              Tu próximo vehículo
              <br />
              <span className="text-gradient">está aquí</span>
            </h1>
            <p className="mt-5 max-w-xl animate-fade-up text-base leading-relaxed text-gray-600 animate-delay-200 sm:text-lg">
              Compra y venta de motos de bajo, mediano y alto cilindraje, y carros multimarca en
              excelente estado. <span className="font-semibold text-jg-text-dark">100% verificados</span>,
              sin chicharrones, con trámite de traspaso legal incluido a nombre del nuevo dueño.
            </p>

            <div className="mt-8 flex animate-fade-up animate-delay-300 flex-wrap gap-3">
              <button onClick={() => onNavigate('catalog')} className="btn-primary">
                Ver Inventario
                <ArrowRight className="h-4 w-4" />
              </button>
              <button onClick={() => onNavigate('sell')} className="btn-secondary">
                Vende tu Vehículo
              </button>
            </div>

            <div className="mt-10 flex animate-fade-up animate-delay-400 gap-6 sm:gap-10">
              <div>
                <p className="font-display text-3xl font-bold text-jg-text-dark">{motosCount}</p>
                <p className="text-xs text-gray-600">Motos disponibles</p>
              </div>
              <div className="border-l border-jg-silver pl-6 sm:pl-10">
                <p className="font-display text-3xl font-bold text-jg-text-dark">{carrosCount}</p>
                <p className="text-xs text-gray-600">Carros disponibles</p>
              </div>
              <div className="border-l border-jg-silver pl-6 sm:pl-10">
                <p className="font-display text-3xl font-bold text-jg-text-dark">100%</p>
                <p className="text-xs text-gray-600">Verificados</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="border-t border-jg-silver/50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="section-title">
              ¿Por qué elegir <span className="text-gradient">ClickMotores?</span>
            </h2>
            <p className="section-subtitle">
              Transparencia, confianza y calidad en cada vehículo que vendemos
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: '100% Verificados',
                desc: 'Cada vehículo pasa por una inspección técnica completa. Garantizamos que no tienen chicharrones ni fallas ocultas.',
                color: 'text-green-400',
              },
              {
                icon: Award,
                title: 'Traspaso Legal Incluido',
                desc: 'Gestionamos todo el trámite de traspaso a nombre del nuevo dueño. Sin complicaciones, sin dolores de cabeza.',
                color: 'text-blue-400',
              },
              {
                icon: Handshake,
                title: 'Consignación y Retomas',
                desc: 'Vendemos tu vehículo por consignación o recibimos tu moto como parte de pago. Soluciones flexibles para ti.',
                color: 'text-yellow-400',
              },
            ].map((item, idx) => (
              <div key={idx} className="card group p-6 transition-all duration-300 hover:border-jg-red/40">
                <div className={`mb-4 inline-flex rounded-xl bg-jg-dark p-3 ${item.color} transition-transform group-hover:scale-110`}>
                  <item.icon className="h-7 w-7" />
                </div>
                <h3 className="font-display text-lg font-bold text-jg-text-dark">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="card group flex items-center gap-5 p-6 transition-all hover:border-jg-red/40">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-jg-dark text-jg-red transition-transform group-hover:scale-110">
                <Bike className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-jg-text-dark">Motos Multicilindraje</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Desde bajo cilindraje para la ciudad hasta alto cilindraje deportivo. Todas
                  verificadas y listas para rodar.
                </p>
              </div>
            </div>
            <div className="card group flex items-center gap-5 p-6 transition-all hover:border-jg-red/40">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-jg-dark text-jg-red transition-transform group-hover:scale-110">
                <Car className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-jg-text-dark">Carros Multimarca</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Sedanes, SUVs y compactos de todas las marcas. En excelente estado y con
                  documentación al día.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bank Logos Strip — vectorized white/light */}
      <section className="border-t border-jg-silver/50 bg-jg-carbon/50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="section-title">Financiamos tu vehículo con las mejores entidades</h2>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6">
            {['Sufi', 'Banco de Bogotá', 'Santander Finandina'].map((bank) => (
              <div key={bank} className="card flex h-20 w-52 items-center justify-center p-4 transition-all hover:border-jg-red/40">
                <BankLogo name={bank} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Inventory */}
      <section className="border-t border-jg-silver/50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="section-title">Inventario Destacado</h2>
              <p className="section-subtitle">
                Una selección de nuestros mejores vehículos disponibles
              </p>
            </div>
            <button
              onClick={() => onNavigate('catalog')}
              className="hidden items-center gap-2 text-sm font-medium text-jg-red transition-colors hover:text-jg-red-light sm:flex"
            >
              Ver todo
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, idx) => (
                <div key={idx} className="card overflow-hidden">
                  <div className="aspect-[4/3] animate-pulse bg-jg-dark" />
                  <div className="space-y-3 p-4">
                    <div className="h-5 w-3/4 animate-pulse rounded bg-jg-dark" />
                    <div className="h-4 w-1/2 animate-pulse rounded bg-jg-dark" />
                    <div className="h-8 w-1/3 animate-pulse rounded bg-jg-dark" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayVehicles.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {displayVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} onClick={() => onVehicleClick(vehicle)} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Search className="mb-4 h-12 w-12 text-gray-600" />
              <p className="text-gray-600">No hay vehículos destacados en este momento.</p>
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <button onClick={() => onNavigate('catalog')} className="btn-primary">
              Ver Inventario Completo
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Trámites y Seguros Module */}
      <section className="border-t border-jg-silver/50 bg-jg-carbon/50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <span className="badge bg-blue-500/15 text-blue-400 border border-blue-500/30">
              <FileText className="h-3.5 w-3.5" />
              Servicios Adicionales
            </span>
            <h2 className="mt-4 section-title">Trámites de Tránsito y Seguros Automotrices</h2>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-jg-dark text-blue-400">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-jg-text-dark">Gestión de Trámites de Tránsito</h3>
              <ul className="mt-3 space-y-2">
                {[
                  'Traspasos',
                  'Levantamiento e inscripción de prendas',
                  'Traslado y radicación de cuenta',
                  'Certificados de tradición (embargos)',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href={whatsappLink('Hola ClickMotores, me gustaría solicitar gestión de trámites de tránsito.')}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => logConsulta('cotizacion_tramite')}
                className="mt-5 btn-primary w-full"
              >
                Solicitar Gestión de Trámites
              </a>
            </div>

            <div className="card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-jg-dark text-jg-red">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-jg-text-dark">SOAT y Pólizas Todo Riesgo</h3>
              <ul className="mt-3 space-y-2">
                {[
                  'Cotizaciones multiaseguradora',
                  'Asesoría personalizada sin costo',
                  'SOAT con descuento especial',
                  'Pólizas todo riesgo para auto y moto',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href={whatsappLink('Hola ClickMotores, me gustaría cotizar un seguro o SOAT para mi vehículo.')}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => logConsulta('cotizacion_seguro')}
                className="mt-5 btn-primary w-full"
              >
                Cotizar Seguro o SOAT
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Consignment CTA */}
      <section className="border-t border-jg-silver/50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="card relative overflow-hidden p-8 sm:p-12">
            <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-jg-red/10 to-transparent" />
            <div className="relative z-10 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <span className="badge bg-jg-red/15 text-jg-red border border-jg-red/30">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Consignación
                </span>
                <h2 className="mt-4 font-display text-2xl font-bold text-jg-text-dark sm:text-3xl">
                  Vende o Consigna tu Vehículo
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
                  Pago único de <span className="font-semibold text-jg-text-dark">$100.000 COP</span> para
                  pauta publicitaria y búsqueda de compradores. Comisión del{' '}
                  <span className="font-semibold text-jg-text-dark">3%</span> para carros y{' '}
                  <span className="font-semibold text-jg-text-dark">5%</span> para motos al concretar la
                  venta. También aceptamos retomas.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button onClick={() => onNavigate('sell')} className="btn-primary">
                    Quiero Vender
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <a
                    href={whatsappLink('Hola, me gustaría información sobre la consignación de mi vehículo.')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                  >
                    Consultar por WhatsApp
                  </a>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  'Evaluación y precio justo para tu vehículo',
                  'Pauta publicitaria profesional incluida',
                  'Red de compradores interesados',
                  'Trámite legal completamente gestionado',
                  'Retomas disponibles como parte de pago',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-green-400" />
                    <span className="text-sm text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-jg-silver/50 bg-jg-carbon/50 py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <span className="badge bg-jg-red/15 text-jg-red border border-jg-red/30">
              <HelpCircle className="h-3.5 w-3.5" />
              Preguntas Frecuentes
            </span>
            <h2 className="mt-4 section-title">Resolvemos tus dudas</h2>
          </div>

          <div className="space-y-3">
            {faqItems.map((item, idx) => (
              <div key={idx} className="card overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-jg-dark/50"
                >
                  <span className="font-display text-sm font-bold text-jg-text-dark">{item.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-gray-600 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="animate-slide-down border-t border-jg-silver/50 px-5 py-4">
                    <p className="text-sm leading-relaxed text-gray-600">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
