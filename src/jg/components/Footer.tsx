import { MapPin, Phone, Facebook, Clock, ShieldCheck, Zap, Award, Instagram, FileText, ShieldAlert } from 'lucide-react';
import { Logo } from './Logo';
import { WHATSAPP_DISPLAY, FACEBOOK_URL, INSTAGRAM_URL, INSTAGRAM_HANDLE, whatsappLink } from '@/jg/lib/supabase';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="border-t border-jg-silver/30 bg-jg-carbon">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Logo />
            <p className="text-sm leading-relaxed text-gray-400">
              Compramos, vendemos y consignamos carros y motos en toda Colombia. Vehículos 100%
              verificados con trámite de traspaso legal incluido.
            </p>
            <div className="flex gap-3">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-jg-silver text-gray-400 transition-all hover:border-jg-red hover:text-jg-red"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-jg-silver text-gray-400 transition-all hover:border-jg-red hover:text-jg-red"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href={whatsappLink('Hola, me gustaría información sobre un vehículo.')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-jg-silver text-gray-400 transition-all hover:border-jg-red hover:text-jg-red"
                aria-label="WhatsApp"
              >
                <Phone className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-display text-sm font-bold uppercase tracking-wide text-white">
              Navegación
            </h4>
            <ul className="space-y-2.5">
              {[
                { id: 'home', label: 'Inicio' },
                { id: 'catalog', label: 'Inventario' },
                { id: 'sell', label: 'Vende tu Vehículo' },
                { id: 'financing', label: 'Financiación' },
                { id: 'contact', label: 'Contacto' },
              ].map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className="text-sm text-gray-400 transition-colors hover:text-jg-red"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-display text-sm font-bold uppercase tracking-wide text-white">
              Contacto
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-jg-red" />
                <a href={whatsappLink('Hola JG Motors, me gustaría más información.')} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  {WHATSAPP_DISPLAY}
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <Instagram className="mt-0.5 h-4 w-4 shrink-0 text-jg-red" />
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  {INSTAGRAM_HANDLE}
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-jg-red" />
                <span>Cobertura en toda Colombia</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-jg-red" />
                <span>Lun - Sáb: 8:00 AM - 6:00 PM</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-display text-sm font-bold uppercase tracking-wide text-white">
              Garantías JG Motors
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                <span>100% verificados, sin chicharrones</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <Award className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                <span>Traspaso legal incluido</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <Zap className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400" />
                <span>Consignación y retomas disponibles</span>
              </li>
            </ul>
            <div className="mt-4 space-y-2 border-t border-jg-silver/30 pt-3">
              <button
                onClick={() => onNavigate('terminos')}
                className="flex items-center gap-2 text-xs text-gray-500 transition-colors hover:text-gray-300"
              >
                <FileText className="h-3.5 w-3.5" />
                Términos y Condiciones
              </button>
              <button
                onClick={() => onNavigate('habeas-data')}
                className="flex items-center gap-2 text-xs text-gray-500 transition-colors hover:text-gray-300"
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                Política de Tratamiento de Datos (Habeas Data Ley 1581)
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-jg-silver/30 pt-6 sm:flex-row">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} JG Motors · Comercializadora Virtual. Todos los derechos reservados.
          </p>
          <p className="text-xs text-gray-500">Cobertura en toda Colombia</p>
        </div>
      </div>
    </footer>
  );
}
