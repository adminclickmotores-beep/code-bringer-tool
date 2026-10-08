import { createFileRoute } from "@tanstack/react-router";
import { ContactPage } from "@/jg/pages/ContactPage";
import { useJg } from "@/jg/JgApp";

export const Route = createFileRoute("/contacto")({
  head: () => ({
    meta: [
      { title: "Contacto | JG Motors" },
      { name: "description", content: "Contáctanos por WhatsApp o visítanos en Yumbo, Valle del Cauca." },
      { property: "og:title", content: "Contacto | JG Motors" },
      { property: "og:description", content: "Contáctanos por WhatsApp o visítanos en Yumbo, Valle del Cauca." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  const j = useJg();
  return <ContactPage />;
}
