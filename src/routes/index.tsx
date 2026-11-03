import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/jg/pages/HomePage";
import { useJg } from "@/jg/JgApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ClickMotores | Vitrina Virtual y Comercializadora de Carros y Motos Multimarca" },
      { name: "description", content: "Plataforma digital, vitrina virtual y comercializadora multimarca de carros y motos usadas. Publica gratis, compra de contado, consignación y financiación con ClickMotores." },
      { property: "og:title", content: "ClickMotores | Vitrina Virtual y Comercializadora de Carros y Motos Multimarca" },
      { property: "og:description", content: "Plataforma digital, vitrina virtual y comercializadora multimarca de carros y motos usadas. Publica gratis, compra de contado, consignación y financiación con ClickMotores." },
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
