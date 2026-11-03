import { createFileRoute } from "@tanstack/react-router";
import { ContactPage } from "@/jg/pages/ContactPage";
import { useJg } from "@/jg/JgApp";

export const Route = createFileRoute("/contacto")({
  head: () => ({
    meta: [
      { title: "Contacto y Asesoría | ClickMotores Vitrina Virtual" },
      { name: "description", content: "Comunícate con ClickMotores por WhatsApp o agenda tu asesoría para comprar, vender o publicar tu vehículo." },
      { property: "og:title", content: "Contacto y Asesoría | ClickMotores Vitrina Virtual" },
      { property: "og:description", content: "Comunícate con ClickMotores por WhatsApp o agenda tu asesoría para comprar, vender o publicar tu vehículo." },
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
