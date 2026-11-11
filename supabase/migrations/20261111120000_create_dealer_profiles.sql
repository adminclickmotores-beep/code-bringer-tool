-- Compraventas: perfil de negocio + catálogo propio (vehicles.dealer_id)
CREATE TABLE IF NOT EXISTS public.dealer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name text NOT NULL CHECK (char_length(business_name) BETWEEN 2 AND 80),
  slug text NOT NULL UNIQUE CHECK (char_length(slug) BETWEEN 2 AND 60 AND slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  phone text NOT NULL CHECK (phone ~ '^[0-9]{10}$'),
  city text CHECK (city IS NULL OR char_length(city) <= 80),
  description text CHECK (description IS NULL OR char_length(description) <= 500),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.dealer_profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dealer_profiles TO authenticated;
GRANT ALL ON public.dealer_profiles TO service_role;

ALTER TABLE public.dealer_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_dealer_profiles" ON public.dealer_profiles;
CREATE POLICY "public_select_dealer_profiles" ON public.dealer_profiles FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "owner_insert_dealer_profiles" ON public.dealer_profiles;
CREATE POLICY "owner_insert_dealer_profiles" ON public.dealer_profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "owner_update_dealer_profiles" ON public.dealer_profiles;
CREATE POLICY "owner_update_dealer_profiles" ON public.dealer_profiles FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "owner_delete_dealer_profiles" ON public.dealer_profiles;
CREATE POLICY "owner_delete_dealer_profiles" ON public.dealer_profiles FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.es_compraventa()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.dealer_profiles WHERE user_id = auth.uid());
$$;

GRANT EXECUTE ON FUNCTION public.es_compraventa() TO anon, authenticated;

-- Vehículos de cada compraventa
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS dealer_id uuid REFERENCES public.dealer_profiles(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS vehicles_dealer_id_idx ON public.vehicles (dealer_id);

-- Permisos (permisivos) de la compraventa sobre SUS vehículos
DROP POLICY IF EXISTS "dealer_insert_own_vehicles" ON public.vehicles;
CREATE POLICY "dealer_insert_own_vehicles" ON public.vehicles FOR INSERT TO authenticated
  WITH CHECK (dealer_id IN (SELECT id FROM public.dealer_profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "dealer_update_own_vehicles" ON public.vehicles;
CREATE POLICY "dealer_update_own_vehicles" ON public.vehicles FOR UPDATE TO authenticated
  USING (dealer_id IN (SELECT id FROM public.dealer_profiles WHERE user_id = auth.uid()))
  WITH CHECK (dealer_id IN (SELECT id FROM public.dealer_profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "dealer_delete_own_vehicles" ON public.vehicles;
CREATE POLICY "dealer_delete_own_vehicles" ON public.vehicles FOR DELETE TO authenticated
  USING (dealer_id IN (SELECT id FROM public.dealer_profiles WHERE user_id = auth.uid()));

-- Límites (restrictivos): una cuenta de compraventa solo toca sus propios vehículos,
-- no puede destacarlos ni marcarlos como de JG. Las cuentas de administración no se ven afectadas.
DROP POLICY IF EXISTS "dealer_limit_insert_vehicles" ON public.vehicles;
CREATE POLICY "dealer_limit_insert_vehicles" ON public.vehicles AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (
    NOT public.es_compraventa()
    OR (
      dealer_id IN (SELECT id FROM public.dealer_profiles WHERE user_id = auth.uid())
      AND featured = false AND consignado = false AND listing_owner = 'tercero'
    )
  );

DROP POLICY IF EXISTS "dealer_limit_update_vehicles" ON public.vehicles;
CREATE POLICY "dealer_limit_update_vehicles" ON public.vehicles AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (
    NOT public.es_compraventa()
    OR dealer_id IN (SELECT id FROM public.dealer_profiles WHERE user_id = auth.uid())
  )
  WITH CHECK (
    NOT public.es_compraventa()
    OR (
      dealer_id IN (SELECT id FROM public.dealer_profiles WHERE user_id = auth.uid())
      AND featured = false AND consignado = false AND listing_owner = 'tercero'
    )
  );

DROP POLICY IF EXISTS "dealer_limit_delete_vehicles" ON public.vehicles;
CREATE POLICY "dealer_limit_delete_vehicles" ON public.vehicles AS RESTRICTIVE FOR DELETE TO authenticated
  USING (
    NOT public.es_compraventa()
    OR dealer_id IN (SELECT id FROM public.dealer_profiles WHERE user_id = auth.uid())
  );

-- Las cuentas de compraventa no pueden leer ni modificar los datos internos del negocio
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'buyer_interests', 'consultas', 'leads', 'movimientos_financieros',
    'control_consignaciones', 'notifications', 'plate_registry', 'sales', 'vehicle_submissions'
  ]
  LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format('DROP POLICY IF EXISTS "dealer_block_select" ON public.%I', t);
      EXECUTE format('CREATE POLICY "dealer_block_select" ON public.%I AS RESTRICTIVE FOR SELECT TO authenticated USING (NOT public.es_compraventa())', t);
      EXECUTE format('DROP POLICY IF EXISTS "dealer_block_update" ON public.%I', t);
      EXECUTE format('CREATE POLICY "dealer_block_update" ON public.%I AS RESTRICTIVE FOR UPDATE TO authenticated USING (NOT public.es_compraventa())', t);
      EXECUTE format('DROP POLICY IF EXISTS "dealer_block_delete" ON public.%I', t);
      EXECUTE format('CREATE POLICY "dealer_block_delete" ON public.%I AS RESTRICTIVE FOR DELETE TO authenticated USING (NOT public.es_compraventa())', t);
    END IF;
  END LOOP;
END $$;
