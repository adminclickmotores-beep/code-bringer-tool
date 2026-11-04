import { useEffect, useMemo, useState } from 'react';
import { Loader2, MessageCircle, Send, X } from 'lucide-react';

// ── Punto de integración del chatbot ─────────────────────────────────────────
// Conecta aquí tu API Key o Webhook de WhatsApp Business / automatización.
// Opciones soportadas: OpenAI, Claude, webhook de Make/Integromat o Landbot.
//
//   1. Si usas OpenAI o Claude directo: pon tu endpoint en CHAT_API_URL y tu
//      clave en CHAT_API_KEY, y llama a enviarAlProveedor() desde enviar().
//   2. Si usas Make / Landbot / WhatsApp Business: pega la URL del webhook en
//      CHAT_WEBHOOK_URL y envía { mensaje, historial, pagina } por POST.
// ─────────────────────────────────────────────────────────────────────────────
const CHAT_API_URL = '';
const CHAT_API_KEY = '';
const CHAT_WEBHOOK_URL = '';

type Mensaje = { rol: 'bot' | 'usuario'; texto: string };

const SALUDO: Mensaje = {
  rol: 'bot',
  texto: 'Hola, soy el asistente de ClickMotores. ¿Buscas carro o moto? Te ayudo con inventario, financiación y SOAT.',
};

// Envía el mensaje del usuario a tu API externa (OpenAI / Claude) y devuelve la respuesta.
// Conecta aquí tu API Key: agrega el header Authorization con CHAT_API_KEY.
async function enviarAlProveedor(historial: Mensaje[]): Promise<string> {
  if (!CHAT_API_URL) throw new Error('Sin proveedor configurado');
  const res = await fetch(CHAT_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Conecta aquí tu API Key o token del proveedor de IA.
      ...(CHAT_API_KEY ? { Authorization: `Bearer ${CHAT_API_KEY}` } : {}),
    },
    body: JSON.stringify({
      mensajes: historial.map((m) => ({ rol: m.rol, texto: m.texto })),
      pagina: typeof window !== 'undefined' ? window.location.pathname : '/',
    }),
  });
  if (!res.ok) throw new Error(`Proveedor respondió ${res.status}`);
  const data = (await res.json()) as { respuesta?: string };
  return data.respuesta ?? 'Gracias por tu mensaje. Un asesor te contactará enseguida.';
}

// Envía el mensaje a un webhook de automatización (Make / Landbot / WhatsApp Business).
// Conecta aquí tu Webhook: pega la URL de Make o Landbot en CHAT_WEBHOOK_URL.
async function enviarAlWebhook(texto: string, historial: Mensaje[]): Promise<string | null> {
  if (!CHAT_WEBHOOK_URL) return null;
  const res = await fetch(CHAT_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mensaje: texto,
      historial: historial.map((m) => ({ rol: m.rol, texto: m.texto })),
      pagina: typeof window !== 'undefined' ? window.location.pathname : '/',
      origen: 'clickmotores-web',
    }),
  });
  if (!res.ok) return null;
  try {
    const data = (await res.json()) as { respuesta?: string };
    return data.respuesta ?? null;
  } catch {
    return null;
  }
}

// Respuesta local de respaldo cuando aún no hay proveedor conectado.
function respuestaLocal(texto: string): string {
  const t = texto.toLowerCase();
  if (t.includes('finan')) return 'Con gusto: financiamos carros y motos con bancos aliados. Cuéntame qué vehículo te gusta y te conecto con un asesor por WhatsApp.';
  if (t.includes('soat') || t.includes('seguro')) return 'Te cotizamos SOAT y seguro en menos de 10 minutos. Déjame tu placa y tu WhatsApp y lo gestionamos ya mismo.';
  if (t.includes('vend') || t.includes('consign')) return 'Puedes vender por compra directa o consignación ($100.000 la pauta + 3% carros / 5% motos). ¿Qué marca, modelo y año es tu vehículo?';
  if (t.includes('hola') || t.includes('buenas')) return '¡Hola! ¿Buscas comprar o vender? Si me dices marca y presupuesto te muestro opciones del inventario verificado.';
  return 'Anotado. Un asesor de ClickMotores (Yumbo / Cali) te responderá enseguida. ¿Me confirmas tu nombre y tu WhatsApp?';
}

export function ChatWidget() {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState<Mensaje[]>([SALUDO]);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!abierto) return;
    try {
      const guardados = sessionStorage.getItem('cm-chat');
      if (guardados) setMensajes(JSON.parse(guardados) as Mensaje[]);
    } catch {
      /* sin historial previo */
    }
  }, [abierto]);

  useEffect(() => {
    try {
      sessionStorage.setItem('cm-chat', JSON.stringify(mensajes.slice(-30)));
    } catch {
      /* almacenamiento no disponible */
    }
  }, [mensajes]);

  // Recibe el texto del usuario, lo envía al proveedor/webhook y agrega la respuesta al chat.
  const enviar = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const limpio = texto.trim();
    if (!limpio || enviando) return;
    const conUsuario: Mensaje[] = [...mensajes, { rol: 'usuario' as const, texto: limpio }];
    setMensajes(conUsuario);
    setTexto('');
    setEnviando(true);
    try {
      // 1) Intenta el webhook de automatización (Make / Landbot / WhatsApp).
      const porWebhook = await enviarAlWebhook(limpio, conUsuario);
      if (porWebhook) {
        setMensajes([...conUsuario, { rol: 'bot', texto: porWebhook }]);
        return;
      }
      // 2) Intenta la API externa (OpenAI / Claude) si hay URL configurada.
      if (CHAT_API_URL) {
        const respuesta = await enviarAlProveedor(conUsuario);
        setMensajes([...conUsuario, { rol: 'bot', texto: respuesta }]);
        return;
      }
      // 3) Respaldo local mientras conectas tu chatbot real.
      await new Promise((r) => setTimeout(r, 600));
      setMensajes([...conUsuario, { rol: 'bot', texto: respuestaLocal(limpio) }]);
    } catch {
      setMensajes([...conUsuario, { rol: 'bot', texto: 'Tuve un problema de conexión. Escríbenos por WhatsApp y te ayudamos ya mismo.' }]);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed bottom-[max(6rem,calc(env(safe-area-inset-bottom)+4.5rem))] right-[max(1rem,env(safe-area-inset-right))] z-40 flex flex-col items-end gap-3">
      {abierto && (
        <div className="flex h-[min(480px,60vh)] w-[min(360px,calc(100vw-2rem))] animate-scale-in flex-col overflow-hidden rounded-2xl border border-[#FF1E27]/25 bg-black/90 shadow-2xl shadow-black/60 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 bg-black/60 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF1E27]/15 text-[#FF1E27]">
                <MessageCircle className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-bold text-white">Asistente ClickMotores</p>
                <p className="flex items-center gap-1.5 text-[11px] text-gray-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> En línea
                </p>
              </div>
            </div>
            <button type="button" onClick={() => setAbierto(false)} aria-label="Cerrar chat" className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 space-y-2.5 overflow-y-auto p-4">
            {mensajes.map((m, i) => (
              <div key={i} className={m.rol === 'usuario' ? 'flex justify-end' : 'flex justify-start'}>
                <p className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${m.rol === 'usuario' ? 'rounded-br-sm bg-[#FF1E27] text-white' : 'rounded-bl-sm border border-white/10 bg-white/5 text-gray-200'}`}>
                  {m.texto}
                </p>
              </div>
            ))}
            {enviando && (
              <div className="flex justify-start">
                <p className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-gray-400">
                  <Loader2 className="h-4 w-4 animate-spin text-[#FF1E27]" /> Escribiendo…
                </p>
              </div>
            )}
          </div>

          <form onSubmit={enviar} className="flex items-center gap-2 border-t border-white/10 bg-black/60 p-3">
            <input
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Escríbeme: busco moto…"
              aria-label="Escribe tu mensaje"
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/50 px-3.5 py-3 text-base text-white placeholder:text-gray-500 outline-none focus:border-[#FF1E27]"
            />
            <button type="submit" disabled={enviando || !texto.trim()} aria-label="Enviar mensaje" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FF1E27] text-white shadow-lg shadow-[#FF1E27]/30 hover:bg-[#D9111A] disabled:opacity-50">
              {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-label={abierto ? 'Cerrar asistente' : 'Abrir asistente ClickMotores'}
        className="flex h-14 w-14 items-center justify-center rounded-full border border-[#FF1E27]/40 bg-black/85 text-[#FF1E27] shadow-lg shadow-[#FF1E27]/25 backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:bg-[#FF1E27] hover:text-white"
      >
        {abierto ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!abierto && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF1E27] opacity-75" />
            <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-black bg-[#FF1E27]" />
          </span>
        )}
      </button>
    </div>
  );
}
