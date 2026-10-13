# Candado de placa única + vigencia de 20 días (solo terceros)

## Qué verá el cliente
- Al enviar "Publicar gratis" con una placa que ya usó sus 20 días gratis, el formulario muestra: "Esta placa ya usó su periodo gratuito. Para volver a publicarla elige un plan (desde $20.000 COP)" con botón de WhatsApp para pagar.
- Compra Directa y Consignación no se bloquean por placa (son negocios de JG Motors).
- Los avisos de terceros vencen 20 días después de publicarse. Los propios, aliados y consignación nunca vencen.

## Qué verás en Admin
- En cada vehículo de tercero: estado "Activo", "Por vencer" (últimos 3 días) o "Expirado", con la fecha de vencimiento.
- Botón para renovar manualmente tras validar el pago: +30 días (Simple), +30 días destacado, +90 días destacado.

## Reglas
1. La placa se normaliza (mayúsculas, sin espacios ni guiones) antes de comparar.
2. Cada placa obtiene 20 días gratis una sola vez, aunque el cliente borre y vuelva a publicar.
3. La vigencia se calcula en el servidor, no en el navegador, para que no se pueda saltar.
4. Vencimiento = fecha de publicación + 20 días; renovaciones suman días desde hoy o desde el vencimiento actual (lo que sea mayor).

## Detalles técnicos
- Migración:
  - Tabla `plate_registry` (placa normalizada única, primera fecha gratis, id de publicación). GRANT a service_role; RLS con lectura solo autenticados.
  - En `vehicles`: columnas `listing_owner` ('jg' | 'tercero', default 'jg'), `expires_at` timestamptz nulo, `featured_until` timestamptz nulo, `plan_type` text nulo.
  - En `vehicle_submissions`: `plate_normalized` text.
- `vehicle-submission.functions.ts`: si `saleMode = publicar_gratis`, consultar `plate_registry`; si existe, rechazar con mensaje de pago; si no, registrar la placa al guardar.
- Al aprobar una publicación gratuita en Admin y crearla en inventario: `listing_owner='tercero'`, `expires_at = now() + 20 días`.
- Nueva función de servidor protegida `renewListing` (requiere sesión admin) que actualiza `expires_at`, `featured_until`, `plan_type`.
- Utilidad compartida `listingStatus(vehicle, now)` en `plans.ts` + pruebas: tercero a 21 días = Expirado; propio sin fecha = siempre Activo; placa repetida = rechazada.
- El catálogo público (expirados al final y sin contacto) queda para el siguiente paso.
