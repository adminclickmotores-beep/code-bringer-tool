import { createFileRoute } from "@tanstack/react-router";
import { ContactPage } from "@/jg/pages/ContactPage";
import { useJg } from "@/jg/JgApp";
import { routeHead } from "@/lib/seo";

export const Route = createFileRoute("/contacto")({
  head: () => routeHead("/contacto"),
  component: Page,
});

function Page() {
  const j = useJg();
  return <ContactPage />;
}
