import { Menu, X, Facebook, Lock, Instagram, Phone } from 'lucide-react';
import { useState } from 'react';
import { Logo } from './Logo';
import { WHATSAPP_DISPLAY, FACEBOOK_URL, INSTAGRAM_URL, whatsappLink } from '@/jg/lib/supabase';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: 'home', label: 'Inicio' },
  { id: 'catalog', label: 'Inventario' },
  { id: 'sell', label: 'Vende tu Vehículo' },
  { id: 'financing', label: 'Financiación' },
  { id: 'contact', label: 'Contacto' },
];

export function Header({ currentPage, onNavigate }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (page: string) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-jg-silver/30 bg-jg-black/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button onClick={() => handleNav('home')} className="transition-transform hover:scale-105">
            <Logo />
          </button>

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  currentPage === item.id
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {item.label}
                {currentPage === item.id && (
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-jg-red" />
                )}
              </button>
            ))}
            <button
              onClick={() => handleNav('admin')}
              className={`flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-200 ${
                currentPage === 'admin'
                  ? 'border-jg-red bg-jg-red/10 text-jg-red'
                  : 'border-jg-silver text-gray-300 hover:border-jg-red/50 hover:text-white'
              }`}
            >
              <Lock className="h-3.5 w-3.5" />
              CMS
            </button>
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 transition-colors hover:text-jg-red"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 transition-colors hover:text-jg-red"
              aria-label="Facebook"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href={whatsappLink('Hola ClickMotores, me gustaría más información.')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary !px-4 !py-2"
            >
              <Phone className="h-3.5 w-3.5" />
              {WHATSAPP_DISPLAY}
            </a>
          </div>

          <button
            className="rounded-lg p-2 text-gray-300 lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menú"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="animate-slide-down border-t border-jg-silver/30 bg-jg-black lg:hidden">
            <nav className="space-y-1 px-4 py-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`block w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${
                    currentPage === item.id
                      ? 'bg-jg-red/10 text-jg-red'
                      : 'text-gray-300 hover:bg-jg-silver'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => handleNav('admin')}
                className={`flex w-full items-center gap-2 rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${
                  currentPage === 'admin'
                    ? 'border border-jg-red bg-jg-red/10 text-jg-red'
                    : 'border border-jg-silver text-gray-300 hover:bg-jg-silver'
                }`}
              >
                <Lock className="h-4 w-4" />
                CMS · Panel de Control
              </button>
              <div className="flex items-center gap-4 px-4 pt-3">
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-jg-red" aria-label="Instagram">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-jg-red" aria-label="Facebook">
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href={whatsappLink('Hola ClickMotores, me gustaría más información.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary !px-4 !py-2 text-xs"
                >
                  <Phone className="h-3.5 w-3.5" />
                  WhatsApp
                </a>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
