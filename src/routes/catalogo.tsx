import { createFileRoute } from "@tanstack/react-router";
import { CatalogPage } from "@/jg/pages/CatalogPage";
import { useJg } from "@/jg/JgApp";

export const Route = createFileRoute("/catalogo")({
  head: () => ({
    meta: [
      { title: "Catálogo Multimarca de Carros y Motos | ClickMotores" },
      { name: "description", content: "Explora la vitrina virtual de ClickMotores con vehículos multimarca verificados, fotos reales y precios transparentes." },
      { property: "og:title", content: "Catálogo Multimarca de Carros y Motos | ClickMotores" },
      { property: "og:description", content: "Explora la vitrina virtual de ClickMotores con vehículos multimarca verificados, fotos reales y precios transparentes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  const j = useJg();
  return <CatalogPage vehicles={j.vehicles} loading={j.loading} onVehicleClick={j.openVehicle} />;
}
