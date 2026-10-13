# Día 2 — Catálogo inteligente: expirados al final y contacto según tipo de aviso

## Objetivo
Que el catálogo público y la ficha de cada vehículo reflejen las reglas del negocio:

1. **Avisos de terceros expirados**: siguen visibles, pero van al final del listado, con etiqueta "Expirado" y **sin botón de contacto**.
2. **Avisos de terceros activos**: el botón de WhatsApp contacta **directamente al propietario** (para ayudarle a vender rápido y que nos refieran).
3. **Vehículos propios, consignación y aliados**: el contacto sigue siendo ClickMotores (comisión por venta), como hoy.

## Cambios

### 1. Datos del propietario en el inventario (base de datos)
- Migración aditiva en `vehicles`: columnas nuevas y opcionales `owner_name` (texto) y `owner_phone` (texto), con GRANTs y comentario explicativo. Sin tocar columnas existentes.
- En el panel Admin, al crear/editar un vehículo con "Dueño del aviso = Tercero", aparecen dos campos nuevos: **Nombre del propietario** y **WhatsApp del propietario**. Se guardan junto al vehículo.

### 2. Orden inteligente del catálogo (`CatalogPage.tsx`)
- Nuevo orden: disponibles primero → no disponibles → **expirados de terceros** → vendidos al final.
- Los expirados se muestran con la etiqueta "Expirado" (reutiliza `listingStatus` de `plans.ts`).

### 3. Tarjeta de vehículo (`VehicleCard.tsx`)
- Si el aviso es de tercero y está **expirado**: no se muestra el botón de WhatsApp; en su lugar un texto "Anuncio expirado".
- Si es de tercero y está **activo**: el botón de WhatsApp abre el chat del **propietario** (`owner_phone`) con mensaje prellenado que incluye el título del vehículo y la placa enmascarada, mencionando que lo vio en ClickMotores.
- Si es propio/consignación/aliado: sin cambios, contacta a ClickMotores.

### 4. Ficha de detalle (`VehicleDetailModal.tsx`)
- Misma lógica: expirado → aviso "Este anuncio expiró" sin botón de contacto; tercero activo → botón verde "Contactar al propietario" vía WhatsApp; resto → botón actual a ClickMotores.

## Detalles técnicos
- `listingStatus(v)` de `src/jg/lib/plans.ts` ya decide permanente/activo/por_vencer/expirado; se reutiliza en catálogo, tarjeta y ficha.
- `owner_phone` se normaliza a formato internacional (57 + número) al armar el enlace `wa.me`; si falta el teléfono del propietario, el botón cae al número de ClickMotores.
- Migración: `ALTER TABLE vehicles ADD COLUMN owner_name text, ADD COLUMN owner_phone text;` + grants; tipos regenerados automáticamente.
- Pruebas: se agregan tests de las reglas de orden y de contacto en `src/test/listing-rules.test.ts`; se verifica TypeScript estricto sin errores.

## Fuera de alcance (siguientes días)
- Captura de interesados con microformulario (Día 3).
- Renovación de planes desde Admin con WhatsApp (Día 3/4).
