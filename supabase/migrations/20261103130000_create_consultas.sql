CREATE TABLE IF NOT EXISTS public.consultas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('whatsapp_click','retoma','cotizacion_tramite','cita','cotizacion_seguro')),
  vehicle_title text,
  contact text,
  notes text,
  created_at timestamptz DEFAULT now()
);

GRANT INSERT ON public.consultas TO anon;
GRANT SELECT, INSERT, DELETE ON public.consultas TO authenticated;
GRANT ALL ON public.consultas TO service_role;

ALTER TABLE public.consultas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_consultas" ON public.consultas;
CREATE POLICY "anon_insert_consultas" ON public.consultas FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_select_consultas" ON public.consultas;
CREATE POLICY "auth_select_consultas" ON public.consultas FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_delete_consultas" ON public.consultas;
CREATE POLICY "auth_delete_consultas" ON public.consultas FOR DELETE TO authenticated USING (true);
