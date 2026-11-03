import { createFileRoute } from "@tanstack/react-router";
import { TermsPage } from "@/jg/pages/LegalPages";
import { useJg } from "@/jg/JgApp";
import { routeHead } from "@/lib/seo";

export const Route = createFileRoute("/terminos")({
  head: () => routeHead("/terminos"),
  component: Page,
});

function Page() {
  const j = useJg();
  return <TermsPage onNavigate={j.navigate} />;
}
