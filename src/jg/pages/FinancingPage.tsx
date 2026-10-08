import { useState } from 'react';
import {
  Calculator,
  ChevronDown,
  Landmark,
  TrendingUp,
  Info,
  Briefcase,
  UserCheck,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import { formatCOP, whatsappLink } from '@/jg/lib/supabase';

const banks = [
  'Sufi',
  'Banco de Bogotá',
  'Banco Santander',
  'Banco Davivienda',
  'BBVA Colombia',
  'Scotiabank Colpatria',
];

const terms = [12, 24, 36, 48, 60, 72];
const monthlyRate = 0.018; // 1.8% monthly

export function FinancingPage() {
  const [amount, setAmount] = useState(20000000);
  const [term, setTerm] = useState(36);
  const [downPayment, setDownPayment] = useState(0);
  const [openAccordion, setOpenAccordion] = useState<string | null>('empleado');

  const financedAmount = Math.max(amount - downPayment, 0);
  const monthlyPayment = financedAmount > 0
    ? (financedAmount * monthlyRate * Math.pow(1 + monthlyRate, term)) /
      (Math.pow(1 + monthlyRate, term) - 1)
    : 0;

  const requirements = [
    {
      id: 'empleado',
      icon: Briefcase,
      title: 'Empleados',
      items: [
        'Documento de identidad vigente',
        'Certificado laboral (máximo 30 días de expedido)',
        'Últimos 2 desprendibles de pago',
        'Soportes de ingresos (extractos bancarios)',
        'Certificado de retención de fuente (si aplica)',
      ],
    },
    {
      id: 'independiente',
      icon: UserCheck,
      title: 'Independientes',
      items: [
        'Documento de identidad vigente',
        'Registro mercantil o RUT',
        'Declaración de renta del último año',
        'Extractos bancarios de los últimos 3 meses',
        'Soporte de ingresos mensuales',
      ],
    },
    {
      id: 'pensionado',
      icon: HelpCircle,
      title: 'Pensionados',
      items: [
        'Documento de identidad vigente',
        'Resolución o certificado de pensión',
        'Último comprobante de pago de pensión',
        'Certificación bancaria',
        'Soporte de residencia',
      ],
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="border-b border-jg-silver/50 bg-jg-carbon/50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="badge bg-jg-red/15 text-jg-red border border-jg-red/30">
            <TrendingUp className="h-3.5 w-3.5" />
            Financiación
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            Financia tu Vehículo
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-gray-400 sm:text-base">
            Trabajamos con las principales entidades bancarias de Colombia para ofrecerte las mejores
            opciones de crédito. Simula tu cuota mensual y conoce los requisitos según tu perfil.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Bank Logos Strip */}
        <div className="mb-10">
          <h2 className="section-title text-center">Financiamos tu vehículo con las mejores entidades</h2>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
            {banks.map((bank) => (
              <div
                key={bank}
                className="card flex h-20 w-44 items-center justify-center gap-2 p-4 text-center transition-all hover:border-jg-red/40"
              >
                <Landmark className="h-5 w-5 text-jg-red/60" />
                <span className="text-xs font-medium text-gray-300">{bank}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Simulator + Requirements */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Simulator */}
          <div className="card overflow-hidden">
            <div className="border-b border-jg-silver/50 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-jg-dark text-jg-red">
                  <Calculator className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-white">Simulador de Crédito</h2>
                  <p className="text-xs text-gray-400">Tasa promedio: 1.8% mensual</p>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-6">
              {/* Amount */}
              <div>
                <label className="label-field">
                  Valor del vehículo: <span className="text-jg-red">{formatCOP(amount)}</span>
                </label>
                <input
                  type="range"
                  min="1000000"
                  max="100000000"
                  step="500000"
                  value={amount}
                  onChange={(e) => setAmount(parseInt(e.target.value))}
                  className="w-full accent-jg-red"
                />
                <div className="mt-1 flex justify-between text-[10px] text-gray-500">
                  <span>$1M</span>
                  <span>$100M</span>
                </div>
              </div>

              {/* Down Payment */}
              <div>
                <label className="label-field">
                  Cuota inicial: <span className="text-jg-red">{formatCOP(downPayment)}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max={Math.floor(amount * 0.5)}
                  step="500000"
                  value={downPayment}
                  onChange={(e) => setDownPayment(parseInt(e.target.value))}
                  className="w-full accent-jg-red"
                />
                <div className="mt-1 flex justify-between text-[10px] text-gray-500">
                  <span>$0</span>
                  <span>50% del valor</span>
                </div>
              </div>

              {/* Term */}
              <div>
                <label className="label-field">Plazo en meses</label>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {terms.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTerm(t)}
                      className={`rounded-lg border py-2 text-sm font-medium transition-all ${
                        term === t
                          ? 'border-jg-red bg-jg-red/10 text-jg-red'
                          : 'border-jg-silver text-gray-400 hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Results — only Valor financiado, Plazo, Cuota mensual */}
              <div className="space-y-3 rounded-xl border border-jg-silver/50 bg-jg-dark p-5">
                <div>
                  <p className="text-xs text-gray-500">Valor financiado</p>
                  <p className="font-display text-lg font-bold text-white">{formatCOP(financedAmount)}</p>
                </div>
                <div className="border-t border-jg-silver/50 pt-3">
                  <p className="text-xs text-gray-500">Plazo</p>
                  <p className="font-display text-lg font-bold text-white">{term} meses</p>
                </div>
                <div className="border-t border-jg-silver/50 pt-3">
                  <p className="text-xs text-gray-500">Cuota mensual estimada</p>
                  <p className="font-display text-3xl font-bold text-gradient">{formatCOP(Math.round(monthlyPayment))}</p>
                </div>
              </div>

              {/* Exemption note */}
              <div className="flex items-start gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400" />
                <p className="text-xs text-gray-400">
                  JG Motors NO otorga crédito directo. La financiación se gestiona exclusivamente a
                  través de entidades bancarias aliadas (Sufi, Banco de Bogotá, Santander) sujeto a
                  estudio crediticio.
                </p>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div>
            <h2 className="section-title mb-5">Requisitos de Crédito</h2>
            <div className="space-y-3">
              {requirements.map((req) => (
                <div key={req.id} className="card overflow-hidden">
                  <button
                    onClick={() => setOpenAccordion(openAccordion === req.id ? null : req.id)}
                    className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-jg-dark/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-jg-dark text-jg-red">
                        <req.icon className="h-4 w-4" />
                      </div>
                      <span className="font-display text-base font-bold text-white">{req.title}</span>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-gray-400 transition-transform ${
                        openAccordion === req.id ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openAccordion === req.id && (
                    <div className="animate-slide-down border-t border-jg-silver/50 px-5 py-4">
                      <ul className="space-y-2.5">
                        {req.items.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-sm text-gray-300">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-5 card p-5">
              <h3 className="font-display text-base font-bold text-white">¿Necesitas asesoría?</h3>
              <p className="mt-1 text-sm text-gray-400">
                Te ayudamos a encontrar la mejor opción de financiamiento según tu perfil y presupuesto.
              </p>
              <a
                href={whatsappLink('Hola JG Motors, me gustaría asesoría sobre financiación de un vehículo.')}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 btn-primary w-full"
              >
                Hablar con un asesor
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
