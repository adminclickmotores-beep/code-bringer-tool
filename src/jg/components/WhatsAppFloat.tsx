import { MessageCircle } from 'lucide-react';
import { whatsappLink } from '@/jg/lib/supabase';

export function WhatsAppFloat() {
  return (
    <a
      href={whatsappLink('Hola JG Motors, me gustaría obtener información sobre sus vehículos.')}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 shadow-lg shadow-green-500/30 transition-all duration-300 hover:scale-110 hover:bg-green-600 animate-pulse-red"
      aria-label="WhatsApp"
    >
      <MessageCircle className="h-7 w-7 text-white" />
      <span className="absolute -top-1 -right-1 flex h-4 w-4">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex h-4 w-4 rounded-full bg-green-500" />
      </span>
    </a>
  );
}
