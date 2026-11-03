import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/jg/pages/HomePage";
import { useJg } from "@/jg/JgApp";
import { routeHead } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => routeHead("/"),
  component: Page,
});

function Page() {
  const j = useJg();
  return <HomePage vehicles={j.vehicles} loading={j.loading} onNavigate={j.navigate} onVehicleClick={j.openVehicle} />;
}
