import { createFileRoute } from "@tanstack/react-router";
import { SellPage } from "@/jg/pages/SellPage";
import { useJg } from "@/jg/JgApp";
import { routeHead } from "@/lib/seo";

export const Route = createFileRoute("/vender")({
  head: () => routeHead("/vender"),
  component: Page,
});

function Page() {
  const j = useJg();
  return <SellPage />;
}
