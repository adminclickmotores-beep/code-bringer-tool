import { createFileRoute } from "@tanstack/react-router";
import { CatalogPage } from "@/jg/pages/CatalogPage";
import { useJg } from "@/jg/JgApp";
import { routeHead } from "@/lib/seo";

export const Route = createFileRoute("/catalogo")({
  head: () => routeHead("/catalogo"),
  component: Page,
});

function Page() {
  const j = useJg();
  return <CatalogPage vehicles={j.vehicles} loading={j.loading} onVehicleClick={j.openVehicle} />;
}
