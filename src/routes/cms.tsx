import { createFileRoute } from "@tanstack/react-router";
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

function Page() {
  const j = useJg();
  const esCompraventa = useEsCompraventa(j.session?.user.id ?? null);
  if (j.authLoading) return null;
  if (!j.session) {
    return <AdminLogin onBack={() => j.navigate("home")} onSuccess={j.refreshSession} />;
  }
  if (esCompraventa === null) return null;
  if (esCompraventa) return <AccesoCompraventa onIr={() => j.navigate("compraventas")} />;
  return <CmsPage userEmail={j.session.user.email || ""} onLogout={j.logout} />;
}
