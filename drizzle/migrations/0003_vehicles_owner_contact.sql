ALTER TABLE public.vehicles ADD COLUMN owner_name text, ADD COLUMN owner_phone text;
COMMENT ON COLUMN public.vehicles.owner_name IS 'Nombre del propietario (solo avisos de terceros) para contacto directo por WhatsApp.';
COMMENT ON COLUMN public.vehicles.owner_phone IS 'WhatsApp del propietario (solo avisos de terceros); el contacto público va directo a este número.';