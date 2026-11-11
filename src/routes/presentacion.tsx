import { createFileRoute } from "@tanstack/react-router";
import { Download, Printer } from "lucide-react";
import { routeHead } from "@/lib/seo";

export const Route = createFileRoute("/presentacion")({
  head: () => routeHead("/presentacion", { noindex: true }),
  component: PresentacionPage,
});

interface Diapositiva {
  titulo: string;
  subtitulo: string;
  puntos: string[];
}

const DIAPOSITIVAS: Diapositiva[] = [
  {
    titulo: "ClickMotores",
    subtitulo: "Tu vitrina virtual para comprar y vender carros y motos en Colombia",
    puntos: ["Vehículos verificados", "Publicación gratis por 20 días", "Operada por JG Motors · Yumbo, Cali"],
  },
  {
    titulo: "El problema que resolvemos",
    subtitulo: "Vender un vehículo hoy toma tiempo, dinero y desconfianza",
    puntos: [
      "Anuncios sueltos que nadie encuentra",
      "Curiosos que no compran y trámites confusos",
      "Miedo a estafas en el traspaso y el pago",
    ],
  },
  {
    titulo: "Catálogo con fotos reales",
    subtitulo: "Tus clientes encuentran el vehículo en segundos",
    puntos: [
      "Filtros por marca, tipo y precio",
      "Fotos reales, precio claro e historial legal",
      "Contacto directo por WhatsApp desde cada vehículo",
      "Favoritos y botón para compartir en redes",
    ],
  },
  {
    titulo: "Vende tu vehículo",
    subtitulo: "Tres caminos, tú eliges el tuyo",
    puntos: [
      "Publicación gratis por 20 días",
      "Planes para más visibilidad: $20.000, $35.000 y $50.000",
      "Compra directa de contado",
      "Consulta de reportes del vehículo antes de publicar",
    ],
  },
  {
    titulo: "Consignación profesional",
    subtitulo: "Nosotros lo vendemos por ti",
    puntos: [
      "Pauta de $100.000 y comisión solo al vender",
      "3% en carros y 5% en motos",
      "Promoción, atención de interesados y traspaso",
    ],
  },
  {
    titulo: "Para compraventas aliadas",
    subtitulo: "Tu propio catálogo con tu marca",
    puntos: [
      "Publica tus vehículos gratis con el nombre de tu negocio",
      "Comparte un enlace propio con tus clientes",
      "CRM para seguir a cada cliente y a quién lo atendió",
      "Catálogo imprimible en un clic",
    ],
  },
  {
    titulo: "Financiación y SOAT",
    subtitulo: "Todo el proceso en un solo lugar",
    puntos: [
      "Simula tu crédito con entidades aliadas",
      "Cotiza tu SOAT en línea",
      "Acompañamiento en el traspaso legal",
    ],
  },
  {
    titulo: "Confianza y respaldo",
    subtitulo: "Un negocio real, con datos protegidos",
    puntos: [
      "JG Motors, NIT 1130674978-2",
      "Términos y política de Habeas Data publicados",
      "Atención humana por WhatsApp",
    ],
  },
  {
    titulo: "Empieza hoy",
    subtitulo: "clickmotores.lovable.app",
    puntos: ["WhatsApp: +57 333 276 5584", "Publica tu primer vehículo gratis", "Yumbo, Valle del Cauca · Colombia"],
  },
];

function descargarImagen(): void {
  const lienzo = document.createElement("canvas");
  lienzo.width = 1200;
  lienzo.height = 630;
  const c = lienzo.getContext("2d");
  if (!c) return;
  c.fillStyle = "#070707";
  c.fillRect(0, 0, 1200, 630);
  const brillo = c.createRadialGradient(1000, 120, 10, 1000, 120, 500);
  brillo.addColorStop(0, "rgba(220,38,38,0.35)");
  brillo.addColorStop(1, "rgba(220,38,38,0)");
  c.fillStyle = brillo;
  c.fillRect(0, 0, 1200, 630);
  c.fillStyle = "#dc2626";
  c.fillRect(70, 90, 90, 6);
  c.fillStyle = "#ffffff";
  c.font = "800 96px 'Plus Jakarta Sans', Arial, sans-serif";
  c.fillText("ClickMotores", 70, 210);
  c.font = "600 42px 'Plus Jakarta Sans', Arial, sans-serif";
  c.fillText("Compra y vende carros y motos", 70, 300);
  c.fillText("verificados en Colombia", 70, 355);
  c.fillStyle = "#a3a3a3";
  c.font = "500 30px 'Plus Jakarta Sans', Arial, sans-serif";
  c.fillText("Publica gratis 20 días  ·  Financiación  ·  SOAT  ·  Traspaso", 70, 440);
  c.fillStyle = "#dc2626";
  c.fillRect(70, 500, 330, 64);
  c.fillStyle = "#ffffff";
  c.font = "700 28px 'Plus Jakarta Sans', Arial, sans-serif";
  c.fillText("clickmotores.lovable.app", 90, 542);
  const enlace = document.createElement("a");
  enlace.download = "clickmotores-compartir-1200x630.png";
  enlace.href = lienzo.toDataURL("image/png");
  enlace.click();
}

function PresentacionPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <style>{`
        @page { size: 1280px 720px; margin: 0; }
        @media print {
          body * { visibility: hidden; }
          .area-impresion, .area-impresion * { visibility: visible; }
          .area-impresion { position: absolute; left: 0; top: 0; width: 1280px; }
          .diapositiva { width: 1280px !important; height: 720px !important; aspect-ratio: auto !important; break-after: page; border: 0 !important; border-radius: 0 !important; padding: 64px !important; }
          .diapositiva h2 { font-size: 56px !important; }
          .diapositiva p.sub { font-size: 28px !important; }
          .diapositiva li { font-size: 26px !important; }
        }
      `}</style>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="mr-auto text-2xl font-extrabold text-foreground">Presentación comercial</h1>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-base font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Printer className="h-4 w-4" /> Guardar como PDF
        </button>
        <button
          type="button"
          onClick={descargarImagen}
          className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-base font-semibold text-foreground hover:bg-accent"
        >
          <Download className="h-4 w-4" /> Descargar imagen 1200x630
        </button>
      </div>

      <div className="area-impresion space-y-6">
        {DIAPOSITIVAS.map((d, i) => (
          <section
            key={d.titulo}
            className="diapositiva relative flex aspect-video flex-col justify-center overflow-hidden rounded-xl border border-border bg-background p-6 sm:p-12"
          >
            <span className="mb-4 block h-1 w-16 bg-primary" />
            <h2 className="text-3xl font-extrabold text-foreground sm:text-5xl">{d.titulo}</h2>
            <p className="sub mt-2 text-base text-muted-foreground sm:text-xl">{d.subtitulo}</p>
            <ul className="mt-6 space-y-2">
              {d.puntos.map((p) => (
                <li key={p} className="flex gap-3 text-sm text-foreground sm:text-lg">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  {p}
                </li>
              ))}
            </ul>
            <span className="absolute bottom-4 right-6 text-xs text-muted-foreground">
              ClickMotores · {i + 1}/{DIAPOSITIVAS.length}
            </span>
          </section>
        ))}
      </div>
    </main>
  );
}
