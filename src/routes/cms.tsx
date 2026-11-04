import { createFileRoute } from "@tanstack/react-router";
import { CmsPage } from "@/jg/pages/CmsPage";
import { AdminLogin } from "@/jg/components/AdminLogin";
import { useJg } from "@/jg/JgApp";
import { routeHead } from "@/lib/seo";

export const Route = createFileRoute("/cms")({
  head: () => routeHead("/cms", { noindex: true }),
  component: Page,
});

function Page() {
  const j = useJg();
  if (j.authLoading) return null;
  if (!j.session) {
    return <AdminLogin onBack={() => j.navigate("home")} onSuccess={j.refreshSession} />;
  }
  return <CmsPage userEmail={j.session.user.email || ""} onLogout={j.logout} />;
}
