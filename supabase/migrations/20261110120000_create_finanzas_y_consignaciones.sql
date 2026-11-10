CREATE TABLE IF NOT EXISTS public.movimientos_financieros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL CHECK (tipo IN ('gasto','compra','pago','peritaje')),
  concepto text NOT NULL CHECK (char_length(concepto) BETWEEN 2 AND 160),
  monto numeric NOT NULL DEFAULT 0 CHECK (monto >= 0),
  fecha date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.movimientos_financieros TO authenticated;
GRANT ALL ON public.movimientos_financieros TO service_role;

ALTER TABLE public.movimientos_financieros ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_select_movimientos_financieros" ON public.movimientos_financieros;
CREATE POLICY "auth_select_movimientos_financieros" ON public.movimientos_financieros FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_movimientos_financieros" ON public.movimientos_financieros;
CREATE POLICY "auth_insert_movimientos_financieros" ON public.movimientos_financieros FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_movimientos_financieros" ON public.movimientos_financieros;
CREATE POLICY "auth_update_movimientos_financieros" ON public.movimientos_financieros FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_movimientos_financieros" ON public.movimientos_financieros;
CREATE POLICY "auth_delete_movimientos_financieros" ON public.movimientos_financieros FOR DELETE TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.control_consignaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente text NOT NULL CHECK (char_length(cliente) BETWEEN 2 AND 100),
  telefono text,
  vehiculo text NOT NULL CHECK (char_length(vehiculo) BETWEEN 2 AND 160),
  tipo_vehiculo text NOT NULL DEFAULT 'carro' CHECK (tipo_vehiculo IN ('carro','moto')),
  precio_venta numeric NOT NULL DEFAULT 0 CHECK (precio_venta >= 0),
  pauta_valor numeric NOT NULL DEFAULT 100000 CHECK (pauta_valor >= 0),
  pauta_pagada boolean NOT NULL DEFAULT false,
  comision_estado text NOT NULL DEFAULT 'pendiente' CHECK (comision_estado IN ('pendiente','cobrada')),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.control_consignaciones TO authenticated;
GRANT ALL ON public.control_consignaciones TO service_role;

ALTER TABLE public.control_consignaciones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_select_control_consignaciones" ON public.control_consignaciones;
CREATE POLICY "auth_select_control_consignaciones" ON public.control_consignaciones FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_control_consignaciones" ON public.control_consignaciones;
CREATE POLICY "auth_insert_control_consignaciones" ON public.control_consignaciones FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_control_consignaciones" ON public.control_consignaciones;
CREATE POLICY "auth_update_control_consignaciones" ON public.control_consignaciones FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_control_consignaciones" ON public.control_consignaciones;
CREATE POLICY "auth_delete_control_consignaciones" ON public.control_consignaciones FOR DELETE TO authenticated USING (true);
