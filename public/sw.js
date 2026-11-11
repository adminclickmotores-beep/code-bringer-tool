// Service worker mínimo: hace la app instalable. No guarda datos en caché
// para que el CRM siempre muestre información actualizada de la nube.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
