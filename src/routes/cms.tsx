import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { CmsPage } from "@/jg/pages/CmsPage";
import { AdminLogin } from "@/jg/components/AdminLogin";
import { useJg } from "@/jg/JgApp";
import { AccesoCompraventa } from "@/jg/components/AccesoCompraventa";
import { useEsCompraventa } from "@/jg/lib/dealers";
import { routeHead } from "@/lib/seo";

export const Route = createFileRoute("/cms")({
  head: () => routeHead("/cms", { noindex: true }),
  component: Page,
});

type EventoInstalar = Event & { prompt: () => Promise<void> };

function Page() {
  const j = useJg();
  const [instalar, setInstalar] = useState<EventoInstalar | null>(null);

  useEffect(() => {
    // El CRM se instala con su propio nombre y abre directo en /cms
    const enlace = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    const anterior = enlace?.getAttribute("href") ?? null;
    if (enlace) enlace.setAttribute("href", "/crm.webmanifest");
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    const alInstalar = (e: Event) => {
      e.preventDefault();
      setInstalar(e as EventoInstalar);
    };
    window.addEventListener("beforeinstallprompt", alInstalar);
    return () => {
      window.removeEventListener("beforeinstallprompt", alInstalar);
      if (enlace && anterior) enlace.setAttribute("href", anterior);
    };
  }, []);

  const esCompraventa = useEsCompraventa(j.session?.user.id ?? null);
  if (j.authLoading) return null;
  if (!j.session) {
    return <AdminLogin onBack={() => j.navigate("home")} onSuccess={j.refreshSession} />;
  }
  if (esCompraventa === null) return null;
  if (esCompraventa) return <AccesoCompraventa onIr={() => j.navigate("compraventas")} />;
  return (
    <>
      <CmsPage userEmail={j.session.user.email || ""} onLogout={j.logout} />
      {instalar && (
        <button
          type="button"
          onClick={() => {
            void instalar.prompt();
            setInstalar(null);
          }}
          className="fixed bottom-4 left-4 z-50 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg"
          style={{ marginBottom: "env(safe-area-inset-bottom)" }}
        >
          <Download className="h-4 w-4" />
          Instalar CRM en el celular
        </button>
      )}
    </>
  );
}
