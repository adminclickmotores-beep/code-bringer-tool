-- Compraventas: solo las aprobadas por el administrador pueden publicar (gratis)
ALTER TABLE public.dealer_profiles ADD COLUMN IF NOT EXISTS aprobada boolean NOT NULL DEFAULT false;

-- Las compraventas que ya existían se dejan aprobadas para no cortarles su acceso
UPDATE public.dealer_profiles SET aprobada = true WHERE aprobada = false;

-- Nadie puede aprobarse a sí mismo: al registrarse siempre entra como pendiente
CREATE OR REPLACE FUNCTION public.proteger_aprobacion_compraventa()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.aprobada := false;
    RETURN NEW;
  END IF;
  IF NEW.aprobada IS DISTINCT FROM OLD.aprobada AND OLD.user_id = auth.uid() THEN
    RAISE EXCEPTION 'No puedes aprobar tu propia cuenta de compraventa';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS proteger_aprobacion_compraventa ON public.dealer_profiles;
CREATE TRIGGER proteger_aprobacion_compraventa
  BEFORE INSERT OR UPDATE ON public.dealer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.proteger_aprobacion_compraventa();

-- El administrador (cuenta que no es compraventa) puede aprobar o quitar la aprobación
DROP POLICY IF EXISTS "admin_update_dealer_profiles" ON public.dealer_profiles;
CREATE POLICY "admin_update_dealer_profiles" ON public.dealer_profiles FOR UPDATE TO authenticated
  USING (NOT public.es_compraventa()) WITH CHECK (NOT public.es_compraventa());

-- Solo una compraventa aprobada puede publicar vehículos
DROP POLICY IF EXISTS "dealer_insert_own_vehicles" ON public.vehicles;
CREATE POLICY "dealer_insert_own_vehicles" ON public.vehicles FOR INSERT TO authenticated
  WITH CHECK (dealer_id IN (SELECT id FROM public.dealer_profiles WHERE user_id = auth.uid() AND aprobada));

-- Una compraventa no puede cambiar la publicación (destacado, vencimiento, dueño del anuncio)
CREATE OR REPLACE FUNCTION public.proteger_publicacion_compraventa()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.dealer_profiles WHERE user_id = auth.uid())
     AND (
       NEW.featured IS DISTINCT FROM OLD.featured
       OR NEW.expires_at IS DISTINCT FROM OLD.expires_at
       OR NEW.listing_owner IS DISTINCT FROM OLD.listing_owner
       OR NEW.dealer_id IS DISTINCT FROM OLD.dealer_id
     ) THEN
    RAISE EXCEPTION 'Esa parte de la publicación solo la cambia el administrador';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS proteger_publicacion_compraventa ON public.vehicles;
CREATE TRIGGER proteger_publicacion_compraventa
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.proteger_publicacion_compraventa();
