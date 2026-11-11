-- Aprobación inmediata: la compraventa queda aprobada al registrarse si completó todos sus datos
CREATE OR REPLACE FUNCTION public.proteger_aprobacion_compraventa()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.aprobada := (
      length(btrim(coalesce(NEW.business_name, ''))) >= 2
      AND coalesce(NEW.phone, '') ~ '^[0-9]{10}$'
      AND length(btrim(coalesce(NEW.city, ''))) >= 2
      AND length(btrim(coalesce(NEW.description, ''))) >= 10
    );
    RETURN NEW;
  END IF;
  IF NEW.aprobada IS DISTINCT FROM OLD.aprobada AND OLD.user_id = auth.uid() THEN
    RAISE EXCEPTION 'No puedes cambiar la aprobación de tu propia cuenta de compraventa';
  END IF;
  RETURN NEW;
END;
$$;

-- Límite de 80 publicaciones por compraventa (además de estar aprobada)
DROP POLICY IF EXISTS "dealer_insert_own_vehicles" ON public.vehicles;
CREATE POLICY "dealer_insert_own_vehicles" ON public.vehicles FOR INSERT TO authenticated
  WITH CHECK (
    dealer_id IN (SELECT id FROM public.dealer_profiles WHERE user_id = auth.uid() AND aprobada)
    AND (SELECT count(*) FROM public.vehicles v WHERE v.dealer_id = vehicles.dealer_id) < 80
  );
