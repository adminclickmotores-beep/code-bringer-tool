import { createFileRoute } from "@tanstack/react-router";
import { AdminPage } from "@/jg/pages/AdminPage";
import { AdminLogin } from "@/jg/components/AdminLogin";
import { useJg } from "@/jg/JgApp";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Panel Administrativo | JG Motors" },
      { name: "description", content: "Panel interno de JG Motors para inventario, leads y ventas." },
      { property: "og:title", content: "Panel Administrativo | JG Motors" },
      { property: "og:description", content: "Panel interno de JG Motors." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Page,
});

function Page() {
  const j = useJg();
  if (j.authLoading) return null;
  if (!j.session) {
    return <AdminLogin onBack={() => j.navigate("home")} onSuccess={j.refreshSession} />;
  }
  return (
    <AdminPage
      vehicles={j.vehicles}
      loading={j.loading}
      onRefresh={j.loadVehicles}
      onLogout={j.logout}
      userEmail={j.session.user.email || ""}
      adminSection={j.adminSection}
      onSectionChange={j.setAdminSection}
      notifications={j.notifications}
      onNotificationsRead={j.loadNotifications}
    />
  );
}
