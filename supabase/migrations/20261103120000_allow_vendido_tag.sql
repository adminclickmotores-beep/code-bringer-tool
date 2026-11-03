-- Permite la etiqueta comercial 'vendido', que el CMS ofrece en el
-- formulario de inventario pero el CHECK original rechazaba, lo que
-- impedía guardar el vehículo con "No fue posible guardar el vehículo".
ALTER TABLE public.vehicles DROP CONSTRAINT IF EXISTS vehicles_tag_check;
ALTER TABLE public.vehicles ADD CONSTRAINT vehicles_tag_check
  CHECK (tag IN ('recien_ingresado', 'precio_rebajado', 'separado', 'vendido'));
