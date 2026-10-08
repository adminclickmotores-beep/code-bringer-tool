import { createFileRoute } from "@tanstack/react-router";
import { FinancingPage } from "@/jg/pages/FinancingPage";
import { useJg } from "@/jg/JgApp";

export const Route = createFileRoute("/financiacion")({
  head: () => ({
    meta: [
      { title: "Financiación de Vehículos | JG Motors" },
      { name: "description", content: "Financiación bancaria para tu moto o carro usado en Yumbo y Cali." },
      { property: "og:title", content: "Financiación de Vehículos | JG Motors" },
      { property: "og:description", content: "Financiación bancaria para tu moto o carro usado en Yumbo y Cali." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  const j = useJg();
  return <FinancingPage />;
}
