-- Datos de quien atendió al cliente (asesor) en el CRM de compraventas
ALTER TABLE public.crm_clientes ADD COLUMN IF NOT EXISTS asesor_nombre text CHECK (asesor_nombre IS NULL OR char_length(asesor_nombre) <= 100);
ALTER TABLE public.crm_clientes ADD COLUMN IF NOT EXISTS asesor_telefono text CHECK (asesor_telefono IS NULL OR char_length(asesor_telefono) <= 20);
