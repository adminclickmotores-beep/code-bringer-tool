import { createFileRoute } from "@tanstack/react-router";
import { FinancingPage } from "@/jg/pages/FinancingPage";
import { useJg } from "@/jg/JgApp";
import { routeHead } from "@/lib/seo";

export const Route = createFileRoute("/financiacion")({
  head: () => routeHead("/financiacion"),
  component: Page,
});

function Page() {
  const j = useJg();
  return <FinancingPage />;
}
