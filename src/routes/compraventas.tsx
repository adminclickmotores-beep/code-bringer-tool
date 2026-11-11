import { createFileRoute } from "@tanstack/react-router";
import { CompraventasPage } from "@/jg/pages/CompraventasPage";
import { routeHead } from "@/lib/seo";

export const Route = createFileRoute("/compraventas")({
  head: () => routeHead("/compraventas"),
  component: CompraventasPage,
});
