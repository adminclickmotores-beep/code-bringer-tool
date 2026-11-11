CREATE TABLE IF NOT EXISTS public.crm_oportunidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente text NOT NULL CHECK (char_length(cliente) BETWEEN 2 AND 100),
  telefono text,
  vehiculo_interes text,
  origen text NOT NULL DEFAULT 'whatsapp' CHECK (origen IN ('whatsapp','web','redes','referido','llamada','visita')),
  etapa text NOT NULL DEFAULT 'nuevo' CHECK (etapa IN ('nuevo','contactado','cita','negociacion','vendido','perdido')),
  valor_estimado numeric NOT NULL DEFAULT 0 CHECK (valor_estimado >= 0),
  proxima_accion date,
  notas text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_oportunidades TO authenticated;
GRANT ALL ON public.crm_oportunidades TO service_role;

ALTER TABLE public.crm_oportunidades ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_select_crm_oportunidades" ON public.crm_oportunidades;
CREATE POLICY "auth_select_crm_oportunidades" ON public.crm_oportunidades FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_crm_oportunidades" ON public.crm_oportunidades;
CREATE POLICY "auth_insert_crm_oportunidades" ON public.crm_oportunidades FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_crm_oportunidades" ON public.crm_oportunidades;
CREATE POLICY "auth_update_crm_oportunidades" ON public.crm_oportunidades FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_crm_oportunidades" ON public.crm_oportunidades;
CREATE POLICY "auth_delete_crm_oportunidades" ON public.crm_oportunidades FOR DELETE TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.crm_citas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente text NOT NULL CHECK (char_length(cliente) BETWEEN 2 AND 100),
  telefono text,
  vehiculo text,
  tipo text NOT NULL DEFAULT 'visita' CHECK (tipo IN ('visita','prueba_manejo','entrega','peritaje')),
  fecha_hora timestamptz NOT NULL,
  estado text NOT NULL DEFAULT 'programada' CHECK (estado IN ('programada','realizada','cancelada')),
  notas text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_citas TO authenticated;
GRANT ALL ON public.crm_citas TO service_role;

ALTER TABLE public.crm_citas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_select_crm_citas" ON public.crm_citas;
CREATE POLICY "auth_select_crm_citas" ON public.crm_citas FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_crm_citas" ON public.crm_citas;
CREATE POLICY "auth_insert_crm_citas" ON public.crm_citas FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_crm_citas" ON public.crm_citas;
CREATE POLICY "auth_update_crm_citas" ON public.crm_citas FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_crm_citas" ON public.crm_citas;
CREATE POLICY "auth_delete_crm_citas" ON public.crm_citas FOR DELETE TO authenticated USING (true);
