CREATE TABLE public.vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('moto','carro')),
  brand text NOT NULL, model text NOT NULL, year int NOT NULL,
  displacement text, price numeric NOT NULL,
  status text NOT NULL DEFAULT 'disponible' CHECK (status IN ('disponible','no_disponible','vendido','aliado')),
  description text, image_urls text[] DEFAULT '{}', mileage int, transmission text, fuel text,
  featured boolean NOT NULL DEFAULT false, created_at timestamptz DEFAULT now(),
  tag text CHECK (tag IN ('recien_ingresado','precio_rebajado','separado')),
  instagram_url text, consignado boolean NOT NULL DEFAULT false, original_price numeric,
  placa_completa text, ciudad text, property_card_urls text[] DEFAULT '{}'
);
GRANT SELECT ON public.vehicles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicles TO authenticated;
GRANT ALL ON public.vehicles TO service_role;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_select_vehicles" ON public.vehicles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "auth_insert_vehicles" ON public.vehicles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_vehicles" ON public.vehicles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_vehicles" ON public.vehicles FOR DELETE TO authenticated USING (true);

CREATE TABLE public.vehicle_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, phone text NOT NULL, email text,
  vehicle_type text NOT NULL CHECK (vehicle_type IN ('moto','carro')),
  brand text NOT NULL, model text NOT NULL, year int, displacement text, mileage int,
  condition text, asking_price numeric, description text, image_urls text[] DEFAULT '{}', instagram_url text,
  status text NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente','aprobado','rechazado')),
  created_at timestamptz DEFAULT now(),
  placa_completa text, ciudad text, property_card_urls text[] DEFAULT '{}', modalidad text
);
GRANT INSERT ON public.vehicle_submissions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicle_submissions TO authenticated;
GRANT ALL ON public.vehicle_submissions TO service_role;
ALTER TABLE public.vehicle_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert_submissions" ON public.vehicle_submissions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "auth_select_submissions" ON public.vehicle_submissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_update_submissions" ON public.vehicle_submissions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'submission', title text NOT NULL, message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false, related_id uuid, created_at timestamptz DEFAULT now()
);
GRANT INSERT ON public.notifications TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert_notifications" ON public.notifications FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "auth_select_notifications" ON public.notifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_update_notifications" ON public.notifications FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_notifications" ON public.notifications FOR DELETE TO authenticated USING (true);

CREATE TABLE public.consultas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('whatsapp_click','retoma','cotizacion_tramite','cita','cotizacion_seguro')),
  vehicle_title text, contact text, notes text, created_at timestamptz DEFAULT now()
);
GRANT INSERT ON public.consultas TO anon;
GRANT SELECT, INSERT, DELETE ON public.consultas TO authenticated;
GRANT ALL ON public.consultas TO service_role;
ALTER TABLE public.consultas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert_consultas" ON public.consultas FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "auth_select_consultas" ON public.consultas FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_delete_consultas" ON public.consultas FOR DELETE TO authenticated USING (true);

CREATE TABLE public.sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_title text NOT NULL,
  sale_type text NOT NULL CHECK (sale_type IN ('directa','consignacion')),
  sale_price numeric NOT NULL DEFAULT 0, commission_amount numeric NOT NULL DEFAULT 0,
  commission_rate numeric NOT NULL DEFAULT 0, tramites_income numeric NOT NULL DEFAULT 0,
  net_income numeric NOT NULL DEFAULT 0, sale_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales TO authenticated;
GRANT ALL ON public.sales TO service_role;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_sales" ON public.sales FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, phone text NOT NULL, email text,
  vehicle_type text NOT NULL CHECK (vehicle_type IN ('moto','carro')),
  mode text NOT NULL CHECK (mode IN ('compra_directa','consignacion')),
  brand text NOT NULL, model text NOT NULL, year int, displacement text, mileage int,
  condition text, asking_price numeric, description text, image_urls text[] DEFAULT '{}', instagram_url text,
  status text NOT NULL DEFAULT 'nuevo_lead' CHECK (status IN ('nuevo_lead','en_negociacion','cita_inspeccion','aprobado','descartado')),
  notes text, created_at timestamptz DEFAULT now(),
  placa_completa text, ciudad text, property_card_urls text[] DEFAULT '{}', modalidad text
);
GRANT INSERT ON public.leads TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert_leads" ON public.leads FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "auth_select_leads" ON public.leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_update_leads" ON public.leads FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_leads" ON public.leads FOR DELETE TO authenticated USING (true);

CREATE INDEX idx_vehicles_placa ON public.vehicles(placa_completa);
CREATE INDEX idx_submissions_placa ON public.vehicle_submissions(placa_completa);
CREATE INDEX idx_leads_placa ON public.leads(placa_completa);

CREATE POLICY "upload_vehicle_photos" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'vehicle-photos');
CREATE POLICY "read_vehicle_photos" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'vehicle-photos');
CREATE POLICY "delete_vehicle_photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'vehicle-photos');
CREATE POLICY "upload_property_cards" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'property-cards');
CREATE POLICY "read_property_cards" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'property-cards');

INSERT INTO public.vehicles (title, type, brand, model, year, displacement, price, status, description, image_urls, mileage, transmission, fuel, featured) VALUES
('Yamaha FZ 2.0','moto','Yamaha','FZ 2.0',2022,'250cc',13500000,'disponible','Moto en excelente estado, 100% verificada, sin chicharrones. Documentación al día. Traspaso legal incluido.',ARRAY['https://images.pexels.com/photos/10478180/pexels-photo-10478180.jpeg'],12000,NULL,'Gasolina',true),
('Bajaj Boxer 150','moto','Bajaj','Boxer 150',2021,'150cc',6500000,'disponible','Moto económica y confiable. Ideal para trabajo diario. Verificada y con traspaso incluido.',ARRAY['https://images.pexels.com/photos/18349821/pexels-photo-18349821.jpeg'],18000,NULL,'Gasolina',true),
('AKT 125 RTX','moto','AKT','125 RTX',2023,'125cc',5200000,'disponible','Moto de bajo cilindraje, perfecta para ciudad. Garantía de verificación completa.',ARRAY['https://images.pexels.com/photos/18761576/pexels-photo-18761576.jpeg'],5000,NULL,'Gasolina',false),
('Chevrolet Sail','carro','Chevrolet','Sail',2020,NULL,38000000,'disponible','Carro sedán económico, mecánico, full equipo. 100% verificado, sin accidentes. Traspaso legal incluido.',ARRAY['https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg'],35000,'Mecánica','Gasolina',true),
('Renault Sandero','carro','Renault','Sandero',2021,NULL,45000000,'disponible','Sandero Stepway, excelente estado, único dueño. Verificación completa y trámite de traspaso incluido.',ARRAY['https://images.pexels.com/photos/159700/pexels-photo-159700.jpeg'],28000,'Mecánica','Gasolina',true),
('Yamaha YBR 125','moto','Yamaha','YBR 125',2020,'125cc',4800000,'vendido','Moto vendida. Excelente referencia de calidad JG Motors.',ARRAY['https://images.pexels.com/photos/18569298/pexels-photo-18569298.jpeg'],22000,NULL,'Gasolina',false),
('Suzuki Gixxer 250','moto','Suzuki','Gixxer 250',2022,'250cc',14200000,'no_disponible','Moto deportiva de alto cilindraje. Próximamente disponible.',ARRAY['https://images.pexels.com/photos/21350911/pexels-photo-21350911.jpeg'],8000,NULL,'Gasolina',false),
('Mazda 2','carro','Mazda','2',2019,NULL,42000000,'aliado','Vehículo de aliado comercial del gremio. Excelente oportunidad de adquisición.',ARRAY['https://images.pexels.com/photos/21164680/pexels-photo-21164680.jpeg'],32000,'Automática','Gasolina',false);