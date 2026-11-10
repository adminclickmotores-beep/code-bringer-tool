import { MessageCircle } from 'lucide-react';
import { whatsappLink } from '@/jg/lib/supabase';

export function BotonWhatsappFlotante() {
  return (
    <a
      href={whatsappLink('Hola ClickMotores, me gustaría más información.')}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="fixed z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/50 transition-transform hover:scale-110"
      style={{
        right: 'max(1rem, env(safe-area-inset-right))',
        bottom: 'max(1rem, env(safe-area-inset-bottom))',
      }}
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
