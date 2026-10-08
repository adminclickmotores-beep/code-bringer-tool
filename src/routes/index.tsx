import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/jg/pages/HomePage";
import { useJg } from "@/jg/JgApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JG Motors | Motos y Carros Usados en Yumbo y Cali" },
      { name: "description", content: "Compraventa de carros y motos usadas en Yumbo y Cali. Compra directa, consignación, retomas, financiación y trámites de tránsito." },
      { property: "og:title", content: "JG Motors | Motos y Carros Usados en Yumbo y Cali" },
      { property: "og:description", content: "Compraventa de carros y motos usadas en Yumbo y Cali. Compra directa, consignación, retomas, financiación y trámites de tránsito." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  const j = useJg();
  return <HomePage vehicles={j.vehicles} loading={j.loading} onNavigate={j.navigate} onVehicleClick={j.openVehicle} />;
}
