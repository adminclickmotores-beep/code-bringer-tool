import { useState } from 'react';
import { MessageCircle, X, Car, Handshake, Headphones } from 'lucide-react';
import { whatsappLink } from '@/jg/lib/supabase';

interface SalesChatbotProps {
  onNavigate: (page: string) => void;
}

export function SalesChatbot({ onNavigate }: SalesChatbotProps) {
  const [open, setOpen] = useState(false);

  const quickReplies = [
    {
      icon: Car,
      label: 'Ver catálogo de vehículos',
      action: () => {
        onNavigate('catalog');
        setOpen(false);
      },
    },
    {
      icon: Handshake,
      label: 'Quiero vender / consignar',
      action: () => {
        onNavigate('sell');
        setOpen(false);
      },
    },
    {
      icon: Headphones,
      label: 'Hablar con un asesor',
      action: () => {
        window.open(whatsappLink('Hola, me gustaría hablar con un asesor de ClickMotores.'), '_blank');
        setOpen(false);
      },
    },
  ];

  return (
    <div className="fixed bottom-5 left-5 z-50">
      {open && (
        <div className="absolute bottom-16 left-0 w-72 animate-scale-in rounded-2xl border border-jg-silver bg-jg-carbon shadow-2xl">
          <div className="flex items-center justify-between rounded-t-2xl border-b border-jg-silver/50 bg-jg-black/50 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-jg-red/15 text-jg-red">
                <MessageCircle className="h-4 w-4" />
              </div>
              <span className="font-display text-sm font-bold text-jg-text-dark">Asistente ClickMotores</span>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-lg p-1 text-gray-600 transition-colors hover:bg-jg-silver hover:text-jg-text-dark">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3 p-4">
            <div className="rounded-xl rounded-tl-sm bg-jg-dark px-3 py-2.5 text-sm text-gray-600">
              ¡Hola! 🚗🏍️ ¿Buscas comprar un vehículo verificado o vender el tuyo?
            </div>
            <div className="space-y-2">
              {quickReplies.map((reply, idx) => (
                <button
                  key={idx}
                  onClick={reply.action}
                  className="flex w-full items-center gap-2.5 rounded-lg border border-jg-silver/50 bg-jg-dark px-3 py-2.5 text-left text-sm text-gray-600 transition-all hover:border-jg-red/40 hover:text-jg-text-dark"
                >
                  <reply.icon className="h-4 w-4 shrink-0 text-jg-red" />
                  {reply.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-jg-red shadow-lg shadow-jg-red/30 transition-all duration-300 hover:scale-110 hover:bg-jg-red-dark"
        aria-label="Asistente ClickMotores"
      >
        {open ? <X className="h-6 w-6 text-jg-text-dark" /> : <MessageCircle className="h-6 w-6 text-jg-text-dark" />}
        {!open && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-jg-red opacity-75" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-jg-red" />
          </span>
        )}
      </button>
    </div>
  );
}
