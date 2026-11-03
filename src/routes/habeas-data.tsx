import { createFileRoute } from "@tanstack/react-router";
import { HabeasDataPage } from "@/jg/pages/LegalPages";
import { useJg } from "@/jg/JgApp";
import { routeHead } from "@/lib/seo";

export const Route = createFileRoute("/habeas-data")({
  head: () => routeHead("/habeas-data"),
  component: Page,
});

function Page() {
  const j = useJg();
  return <HabeasDataPage onNavigate={j.navigate} />;
}
