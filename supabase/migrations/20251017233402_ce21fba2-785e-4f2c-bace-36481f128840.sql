-- Update handle_new_user function to grant admin role to admin.footprintiq@gmail.com
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- Check if user is the designated admin
  IF NEW.email = 'admin.footprintiq@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role, subscription_tier)
    VALUES (NEW.id, 'admin', 'premium');
  ELSE
    INSERT INTO public.user_roles (user_id, role, subscription_tier)
    VALUES (NEW.id, 'free', 'free');
  END IF;
  
  RETURN NEW;
END;
$function$;