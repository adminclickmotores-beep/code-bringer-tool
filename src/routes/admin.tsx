import { createFileRoute } from "@tanstack/react-router";
import { AdminPage } from "@/jg/pages/AdminPage";
import { AdminLogin } from "@/jg/components/AdminLogin";
import { useJg } from "@/jg/JgApp";
import { routeHead } from "@/lib/seo";

export const Route = createFileRoute("/admin")({
  head: () => routeHead("/admin", { noindex: true }),
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
      onAddVehicle={j.addVehicle}
      onUpdateVehicle={j.updateVehicle}
      onUpdateVehicleStatus={j.updateVehicleStatus}
      onDeleteVehicle={j.deleteVehicle}
      userEmail={j.session.user.email || ""}
    />
  );
}
