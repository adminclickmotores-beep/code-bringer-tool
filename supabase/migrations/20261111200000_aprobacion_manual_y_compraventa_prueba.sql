-- Aprobación manual: toda compraventa nueva entra pendiente y el administrador autoriza el acceso la primera vez
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

-- Compraventa de prueba (queda pendiente para probar la aprobación desde el CMS)
-- Correo: prueba.compraventa@example.com  ·  Contraseña: Prueba123
DO $$
DECLARE
  uid uuid;
BEGIN
  SELECT id INTO uid FROM auth.users WHERE email = 'prueba.compraventa@example.com';
  IF uid IS NULL THEN
    uid := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change, email_change_token_new
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
      'prueba.compraventa@example.com', crypt('Prueba123', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now(),
      '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (
      gen_random_uuid(), uid,
      jsonb_build_object('sub', uid::text, 'email', 'prueba.compraventa@example.com', 'email_verified', true),
      'email', uid::text, now(), now(), now()
    );
  END IF;

  INSERT INTO public.dealer_profiles (user_id, business_name, slug, phone, city, description)
  VALUES (
    uid, 'Autos de Prueba', 'autos-de-prueba', '3001234567', 'Cali',
    'Compraventa de prueba para verificar el registro y la aprobación del administrador.'
  )
  ON CONFLICT DO NOTHING;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'No se pudo crear la compraventa de prueba: %', SQLERRM;
END $$;
