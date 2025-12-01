-- Add last_active_at column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_active_at timestamp with time zone DEFAULT now();

-- Update the handle_new_user function to use the correct super admin email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name, last_active_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    now()
  );
  
  -- If it's the main super admin email, grant super_admin role immediately
  IF NEW.email = 'joshihj2580+1@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'super_admin');
  ELSE
    -- Create admin request for approval
    INSERT INTO public.admin_requests (user_id, email, full_name, status)
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'full_name',
      'pending'
    );
  END IF;
  
  RETURN NEW;
END;
$function$;