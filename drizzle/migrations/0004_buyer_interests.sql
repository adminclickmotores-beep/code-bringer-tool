CREATE TABLE public.buyer_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_name text NOT NULL CHECK (char_length(buyer_name) BETWEEN 2 AND 100),
  buyer_phone text NOT NULL CHECK (buyer_phone ~ '^[0-9]{10}$'),
  vehicle_id uuid,
  vehicle_title text,
  vehicle_plate text,
  contact_target text NOT NULL DEFAULT 'jg' CHECK (contact_target IN ('jg','owner')),
  status text NOT NULL DEFAULT 'nuevo',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.buyer_interests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.buyer_interests TO authenticated;
GRANT ALL ON public.buyer_interests TO service_role;
ALTER TABLE public.buyer_interests ENABLE ROW LEVEL SECURITY;
CREATE POLICY anon_insert_buyer_interests ON public.buyer_interests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY auth_select_buyer_interests ON public.buyer_interests FOR SELECT TO authenticated USING (true);
CREATE POLICY auth_update_buyer_interests ON public.buyer_interests FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY auth_delete_buyer_interests ON public.buyer_interests FOR DELETE TO authenticated USING (true);