import { createFileRoute } from "@tanstack/react-router";
import { CatalogPage } from "@/jg/pages/CatalogPage";
import { useJg } from "@/jg/JgApp";

export const Route = createFileRoute("/catalogo")({
  head: () => ({
    meta: [
      { title: "Catálogo de Motos y Carros | JG Motors" },
      { name: "description", content: "Explora motos y carros usados 100% verificados con traspaso incluido en Yumbo y Cali." },
      { property: "og:title", content: "Catálogo de Motos y Carros | JG Motors" },
      { property: "og:description", content: "Explora motos y carros usados 100% verificados con traspaso incluido en Yumbo y Cali." },
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
