import { createFileRoute } from "@tanstack/react-router";
import { SellPage } from "@/jg/pages/SellPage";
import { useJg } from "@/jg/JgApp";

export const Route = createFileRoute("/vender")({
  head: () => ({
    meta: [
      { title: "Vende tu Vehículo | JG Motors" },
      { name: "description", content: "Vende tu moto o carro: compra directa en efectivo, consignación o publicación gratis." },
      { property: "og:title", content: "Vende tu Vehículo | JG Motors" },
      { property: "og:description", content: "Vende tu moto o carro: compra directa en efectivo, consignación o publicación gratis." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  const j = useJg();
  return <SellPage />;
}
