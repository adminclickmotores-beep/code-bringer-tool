import {
  MapPin,
  Phone,

  Facebook,
  Clock,
  MessageCircle,
  Send,
} from 'lucide-react';
import { WHATSAPP_DISPLAY, FACEBOOK_URL, whatsappLink } from '@/jg/lib/supabase';
import { useState } from 'react';

export function ContactPage() {
  const [form, setForm] = useState({ name: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `*Mensaje de Contacto - ClickMotores*

*Nombre:* ${form.name}

*Mensaje:*
${form.message}`;

    window.open(whatsappLink(text), '_blank');
    setSent(true);
  };

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="border-b border-jg-silver/50 bg-jg-carbon/50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="badge bg-jg-red/15 text-jg-red border border-jg-red/30">
            <MapPin className="h-3.5 w-3.5" />
            Yumbo, Valle del Cauca
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold text-jg-text-dark sm:text-4xl md:text-5xl">
            Contáctanos
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-gray-600 sm:text-base">
            Estamos en Yumbo, Valle del Cauca. Escríbenos por WhatsApp, llámanos o visítanos. Te
            ayudamos a encontrar el vehículo ideal o a vender el tuyo.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Contact Info */}
          <div className="space-y-4">
            <a
              href={whatsappLink('Hola ClickMotores, me gustaría más información.')}
              target="_blank"
              rel="noopener noreferrer"
              className="card group flex items-center gap-4 p-5 transition-all hover:border-green-500/40"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/15 text-green-400 transition-transform group-hover:scale-110">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">WhatsApp / Teléfono</p>
                <p className="font-display text-lg font-bold text-jg-text-dark">{WHATSAPP_DISPLAY}</p>
              </div>
              <Send className="h-4 w-4 text-gray-600 transition-colors group-hover:text-green-400" />
            </a>



            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="card group flex items-center gap-4 p-5 transition-all hover:border-blue-500/40"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400 transition-transform group-hover:scale-110">
                <Facebook className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Facebook</p>
                <p className="font-display text-base font-bold text-jg-text-dark">ClickMotores</p>
              </div>
              <Send className="h-4 w-4 text-gray-600 transition-colors group-hover:text-blue-400" />
            </a>

            <div className="card flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/15 text-yellow-400">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Horario de atención</p>
                <p className="font-display text-base font-bold text-jg-text-dark">Lun - Sáb: 8:00 AM - 6:00 PM</p>
              </div>
            </div>

            <div className="card flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-jg-red/15 text-jg-red">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Ubicación</p>
                <p className="font-display text-base font-bold text-jg-text-dark">Yumbo, Valle del Cauca, Colombia</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="card overflow-hidden">
            <div className="border-b border-jg-silver/50 px-6 py-5">
              <h2 className="font-display text-xl font-bold text-jg-text-dark">Envíanos un mensaje</h2>
              <p className="mt-1 text-sm text-gray-600">
                Se enviará por WhatsApp a {WHATSAPP_DISPLAY}.
              </p>
            </div>

            {sent ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/15">
                  <MessageCircle className="h-8 w-8 text-green-400" />
                </div>
                <h3 className="font-display text-xl font-bold text-jg-text-dark">¡Mensaje enviado!</h3>
                <p className="mt-2 max-w-md text-sm text-gray-600">
                  Hemos abierto WhatsApp con el mensaje listo para enviar. Te
                  responderemos a la brevedad.
                </p>
                <button onClick={() => setSent(false)} className="mt-6 btn-secondary">
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 p-6">
                <div>
                  <label className="label-field">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Tu nombre"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label-field">Mensaje *</label>
                  <textarea
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="¿En qué podemos ayudarte?"
                    rows={5}
                    className="input-field resize-none"
                  />
                </div>
                <button type="submit" className="btn-primary w-full">
                  <Send className="h-4 w-4" />
                  Enviar mensaje
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
