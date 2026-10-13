CREATE TABLE public.plate_registry (
  plate_normalized text PRIMARY KEY,
  first_free_at timestamptz NOT NULL DEFAULT now(),
  submission_id uuid
);
GRANT SELECT ON public.plate_registry TO authenticated;
GRANT ALL ON public.plate_registry TO service_role;
ALTER TABLE public.plate_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY auth_select_plate_registry ON public.plate_registry FOR SELECT TO authenticated USING (true);

ALTER TABLE public.vehicles ADD COLUMN listing_owner text NOT NULL DEFAULT 'jg';
ALTER TABLE public.vehicles ADD COLUMN expires_at timestamptz;
ALTER TABLE public.vehicles ADD COLUMN featured_until timestamptz;
ALTER TABLE public.vehicles ADD COLUMN plan_type text;
ALTER TABLE public.vehicles ADD CONSTRAINT vehicles_listing_owner_chk CHECK (listing_owner IN ('jg','tercero'));
ALTER TABLE public.vehicle_submissions ADD COLUMN plate_normalized text;

CREATE OR REPLACE FUNCTION public.set_listing_expiry()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.listing_owner = 'tercero' THEN
    IF NEW.expires_at IS NULL THEN
      NEW.expires_at := COALESCE(NEW.created_at, now()) + interval '20 days';
    END IF;
  ELSE
    NEW.expires_at := NULL;
    NEW.featured_until := NULL;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER vehicles_set_listing_expiry BEFORE INSERT OR UPDATE ON public.vehicles
FOR EACH ROW EXECUTE FUNCTION public.set_listing_expiry();