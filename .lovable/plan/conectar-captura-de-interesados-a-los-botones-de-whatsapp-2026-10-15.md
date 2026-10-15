# Conectar captura de interesados a los botones de WhatsApp

## Objetivo
Que al tocar el botón de WhatsApp en cualquier vehículo se abra primero la ventanita (InterestCaptureModal) pidiendo Nombre, Celular y Habeas Data; al confirmar, se guarde el registro en `buyer_interests` y luego se abra WhatsApp (al dueño si es tercero activo, a ClickMotores si es propio/consignado/aliado).

## Estado actual
- `InterestCaptureModal.tsx` ya existe y funciona: valida nombre, celular colombiano (10 dígitos, empieza por 3), casilla de Habeas Data, guarda en `buyer_interests` y abre WhatsApp.
- `VehicleCard.tsx` y `VehicleDetailModal.tsx` abren WhatsApp directo sin pedir datos.
- La pestaña "Interesados" en Admin ya existe pero está vacía porque nada escribe en la tabla desde el catálogo.

## Cambios

### 1. `src/jg/components/VehicleCard.tsx`
- Importar `InterestCaptureModal` y añadir estado `showInterest`.
- El botón de WhatsApp deja de ser un `<a>` directo: al hacer clic (cuando `contact !== 'none'`) abre el modal en vez de navegar.
- Se mantiene `logConsulta('whatsapp_click', ...)` al abrir el modal.
- Renderizar `<InterestCaptureModal vehicle={vehicle} target={contact} whatsappHref={waHref} onClose={...} />` cuando `showInterest` es true.

### 2. `src/jg/components/VehicleDetailModal.tsx`
- Mismo patrón: estado `showInterest`; el botón grande "Consultar/Contactar por WhatsApp" abre el modal en lugar de navegar directo.
- El modal se renderiza encima (z-index 70 ya lo soporta) con `target={contact}` y `whatsappHref={contactHref}`.
- Los enlaces secundarios (agendar cita de consignados, Instagram) no cambian.

### 3. Verificación
- `bunx tsgo` sin errores de TypeScript.
- `bunx vitest run` con las pruebas existentes pasando.
- Prueba en el preview: clic en WhatsApp de un vehículo → aparece la ventanita → llenar datos → se abre WhatsApp y el registro queda visible en Admin → pestaña "Interesados".

## Notas técnicas
- No se toca la base de datos (la tabla `buyer_interests` y sus permisos ya existen).
- Los avisos expirados siguen sin mostrar botón de contacto (sin cambios).
- No se cambia ninguna regla de negocio: solo se intercepta el clic de contacto.
