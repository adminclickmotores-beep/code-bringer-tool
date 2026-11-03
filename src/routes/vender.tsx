import { createFileRoute } from "@tanstack/react-router";
import { SellPage } from "@/jg/pages/SellPage";
import { useJg } from "@/jg/JgApp";

export const Route = createFileRoute("/vender")({
  head: () => ({
    meta: [
      { title: "Vende tu Carro o Moto | Vitrina Virtual ClickMotores" },
      { name: "description", content: "Publica gratis en la plataforma digital ClickMotores, solicita compra directa de contado o gestiona tu vehículo en consignación." },
      { property: "og:title", content: "Vende tu Carro o Moto | Vitrina Virtual ClickMotores" },
      { property: "og:description", content: "Publica gratis en la plataforma digital ClickMotores, solicita compra directa de contado o gestiona tu vehículo en consignación." },
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
