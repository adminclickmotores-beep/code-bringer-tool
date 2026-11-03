import { createFileRoute } from "@tanstack/react-router";
import { TermsPage } from "@/jg/pages/LegalPages";
import { useJg } from "@/jg/JgApp";

export const Route = createFileRoute("/terminos")({
  head: () => ({
    meta: [
      { title: "Términos y Condiciones | ClickMotores" },
      { name: "description", content: "Términos y condiciones de la plataforma ClickMotores, operada legalmente por JG Motors." },
      { property: "og:title", content: "Términos y Condiciones | ClickMotores" },
      { property: "og:description", content: "Términos y condiciones de la plataforma ClickMotores, operada legalmente por JG Motors." },
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
