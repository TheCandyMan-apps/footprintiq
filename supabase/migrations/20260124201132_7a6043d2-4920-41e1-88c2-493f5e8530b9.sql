-- Update handle_new_user function to also create consent record
-- This runs server-side with SECURITY DEFINER, bypassing RLS timing issues

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Create profile with persona from metadata
  INSERT INTO public.profiles (user_id, email, full_name, persona)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'persona', 'standard')
  )
  ON CONFLICT (user_id) DO UPDATE SET
    persona = COALESCE(EXCLUDED.persona, profiles.persona),
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name);
  
  -- Create user_roles entry
  IF NEW.email = 'admin.footprintiq@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role, subscription_tier)
    VALUES (NEW.id, 'admin', 'premium')
    ON CONFLICT (user_id) DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role, subscription_tier)
    VALUES (NEW.id, 'free', 'free')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  -- Create consent record if user_agent provided in metadata
  IF NEW.raw_user_meta_data->>'user_agent' IS NOT NULL THEN
    INSERT INTO public.consents (user_id, consent_type, consent_text, user_agent)
    VALUES (
      NEW.id,
      'gdpr_signup',
      'I consent to FootprintIQ processing my personal data for scan services only, and I have read and agree to the Privacy Policy and Terms of Service.',
      COALESCE(NEW.raw_user_meta_data->>'user_agent', 'unknown')
    )
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$function$;