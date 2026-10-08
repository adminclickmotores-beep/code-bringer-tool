import { createFileRoute } from "@tanstack/react-router";
import { TermsPage } from "@/jg/pages/LegalPages";
import { useJg } from "@/jg/JgApp";

export const Route = createFileRoute("/terminos")({
  head: () => ({
    meta: [
      { title: "Términos y Condiciones | JG Motors" },
      { name: "description", content: "Términos y condiciones de uso de los servicios de JG Motors." },
      { property: "og:title", content: "Términos y Condiciones | JG Motors" },
      { property: "og:description", content: "Términos y condiciones de uso de los servicios de JG Motors." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  const j = useJg();
  return <TermsPage onNavigate={j.navigate} />;
}
