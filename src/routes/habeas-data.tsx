import { createFileRoute } from "@tanstack/react-router";
import { HabeasDataPage } from "@/jg/pages/LegalPages";
import { useJg } from "@/jg/JgApp";

export const Route = createFileRoute("/habeas-data")({
  head: () => ({
    meta: [
      { title: "Política de Habeas Data | JG Motors" },
      { name: "description", content: "Política de tratamiento de datos personales de JG Motors." },
      { property: "og:title", content: "Política de Habeas Data | JG Motors" },
      { property: "og:description", content: "Política de tratamiento de datos personales de JG Motors." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  const j = useJg();
  return <HabeasDataPage onNavigate={j.navigate} />;
}
