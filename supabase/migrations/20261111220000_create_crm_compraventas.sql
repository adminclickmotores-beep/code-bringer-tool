-- CRM para compraventas: clientes y seguimientos de cada negocio
CREATE TABLE IF NOT EXISTS public.crm_clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id uuid NOT NULL REFERENCES public.dealer_profiles(id) ON DELETE CASCADE,
  nombre text NOT NULL CHECK (char_length(nombre) BETWEEN 2 AND 100),
  telefono text NOT NULL CHECK (char_length(telefono) BETWEEN 7 AND 20),
  correo text CHECK (correo IS NULL OR char_length(correo) <= 120),
  interes text CHECK (interes IS NULL OR char_length(interes) <= 200),
  presupuesto numeric CHECK (presupuesto IS NULL OR presupuesto >= 0),
  origen text NOT NULL DEFAULT 'otro',
  etapa text NOT NULL DEFAULT 'nuevo' CHECK (etapa IN ('nuevo', 'contactado', 'negociando', 'vendido', 'perdido')),
  notas text CHECK (notas IS NULL OR char_length(notas) <= 1000),
  proximo_contacto date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS crm_clientes_dealer_idx ON public.crm_clientes (dealer_id);

CREATE TABLE IF NOT EXISTS public.crm_seguimientos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL REFERENCES public.crm_clientes(id) ON DELETE CASCADE,
  dealer_id uuid NOT NULL REFERENCES public.dealer_profiles(id) ON DELETE CASCADE,
  nota text NOT NULL CHECK (char_length(nota) BETWEEN 1 AND 1000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS crm_seguimientos_cliente_idx ON public.crm_seguimientos (cliente_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_clientes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_seguimientos TO authenticated;
GRANT ALL ON public.crm_clientes TO service_role;
GRANT ALL ON public.crm_seguimientos TO service_role;

ALTER TABLE public.crm_clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_seguimientos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dealer_crm_clientes_select" ON public.crm_clientes;
CREATE POLICY "dealer_crm_clientes_select" ON public.crm_clientes FOR SELECT TO authenticated
  USING (dealer_id IN (SELECT id FROM public.dealer_profiles WHERE user_id = auth.uid() AND aprobada = true));

DROP POLICY IF EXISTS "dealer_crm_clientes_insert" ON public.crm_clientes;
CREATE POLICY "dealer_crm_clientes_insert" ON public.crm_clientes FOR INSERT TO authenticated
  WITH CHECK (dealer_id IN (SELECT id FROM public.dealer_profiles WHERE user_id = auth.uid() AND aprobada = true));

DROP POLICY IF EXISTS "dealer_crm_clientes_update" ON public.crm_clientes;
CREATE POLICY "dealer_crm_clientes_update" ON public.crm_clientes FOR UPDATE TO authenticated
  USING (dealer_id IN (SELECT id FROM public.dealer_profiles WHERE user_id = auth.uid() AND aprobada = true))
  WITH CHECK (dealer_id IN (SELECT id FROM public.dealer_profiles WHERE user_id = auth.uid() AND aprobada = true));

DROP POLICY IF EXISTS "dealer_crm_clientes_delete" ON public.crm_clientes;
CREATE POLICY "dealer_crm_clientes_delete" ON public.crm_clientes FOR DELETE TO authenticated
  USING (dealer_id IN (SELECT id FROM public.dealer_profiles WHERE user_id = auth.uid() AND aprobada = true));

DROP POLICY IF EXISTS "dealer_crm_seguimientos_select" ON public.crm_seguimientos;
CREATE POLICY "dealer_crm_seguimientos_select" ON public.crm_seguimientos FOR SELECT TO authenticated
  USING (dealer_id IN (SELECT id FROM public.dealer_profiles WHERE user_id = auth.uid() AND aprobada = true));

DROP POLICY IF EXISTS "dealer_crm_seguimientos_insert" ON public.crm_seguimientos;
CREATE POLICY "dealer_crm_seguimientos_insert" ON public.crm_seguimientos FOR INSERT TO authenticated
  WITH CHECK (
    dealer_id IN (SELECT id FROM public.dealer_profiles WHERE user_id = auth.uid() AND aprobada = true)
    AND cliente_id IN (SELECT id FROM public.crm_clientes WHERE dealer_id = crm_seguimientos.dealer_id)
  );

DROP POLICY IF EXISTS "dealer_crm_seguimientos_delete" ON public.crm_seguimientos;
CREATE POLICY "dealer_crm_seguimientos_delete" ON public.crm_seguimientos FOR DELETE TO authenticated
  USING (dealer_id IN (SELECT id FROM public.dealer_profiles WHERE user_id = auth.uid() AND aprobada = true));
