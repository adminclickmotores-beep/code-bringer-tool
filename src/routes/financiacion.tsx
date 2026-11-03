import { createFileRoute } from "@tanstack/react-router";
import { FinancingPage } from "@/jg/pages/FinancingPage";
import { useJg } from "@/jg/JgApp";

export const Route = createFileRoute("/financiacion")({
  head: () => ({
    meta: [
      { title: "Financiación de Vehículos Multimarca | ClickMotores" },
      { name: "description", content: "Financiación ágil para carros y motos usadas a través de ClickMotores con las principales entidades aliadas." },
      { property: "og:title", content: "Financiación de Vehículos Multimarca | ClickMotores" },
      { property: "og:description", content: "Financiación ágil para carros y motos usadas a través de ClickMotores con las principales entidades aliadas." },
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
