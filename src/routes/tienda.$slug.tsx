import { createFileRoute } from "@tanstack/react-router";
import { TiendaPage } from "@/jg/pages/TiendaPage";
import { routeHead } from "@/lib/seo";

export const Route = createFileRoute("/tienda/$slug")({
  head: ({ params }) => routeHead(`/tienda/${params.slug}`),
  component: Page,
});

function Page() {
  const { slug } = Route.useParams();
  return <TiendaPage slug={slug} />;
}
