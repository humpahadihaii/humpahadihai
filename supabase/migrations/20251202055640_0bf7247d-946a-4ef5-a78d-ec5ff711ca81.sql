-- Add status column to profiles if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema='public' 
                 AND table_name='profiles' 
                 AND column_name='status') THEN
    ALTER TABLE public.profiles ADD COLUMN status text DEFAULT 'active' CHECK (status IN ('active', 'pending', 'disabled'));
  END IF;
END $$;

-- Update profiles RLS policies for new RBAC system
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Super admin can do everything
CREATE POLICY "Super admin full access to profiles"
ON public.profiles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);

-- Admin can view all and update non-super-admin profiles
CREATE POLICY "Admin can view all profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "Admin can update non-super-admin profiles"
ON public.profiles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
  )
  AND (
    -- Cannot modify super_admins unless you are super_admin
    NOT EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = profiles.id AND role = 'super_admin'
    )
    OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  )
);

-- Content managers and moderators can view profiles (read-only)
CREATE POLICY "Content managers and moderators can view profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role IN ('content_manager', 'moderator', 'content_editor')
  )
);

-- Users can view and update their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Update user_roles RLS policies
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

-- Super admin can manage all roles including super_admin assignments
CREATE POLICY "Super admin can manage all roles"
ON public.user_roles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);

-- Admin can manage roles except super_admin
CREATE POLICY "Admin can manage non-super-admin roles"
ON public.user_roles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
  AND role != 'super_admin'
);

-- Users can view their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());

-- Ensure joshihj2580+1@gmail.com has super_admin role
DO $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Get user ID from auth.users via profiles
  SELECT id INTO target_user_id
  FROM public.profiles
  WHERE email = 'joshihj2580+1@gmail.com';

  IF target_user_id IS NOT NULL THEN
    -- Insert super_admin role if not exists
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'super_admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Update profile status to active
    UPDATE public.profiles
    SET status = 'active'
    WHERE id = target_user_id;
  END IF;
END $$;

-- Create function to trigger password reset (for super_admin/admin)
CREATE OR REPLACE FUNCTION public.admin_reset_user_password(target_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email text;
  is_super_admin boolean;
  is_admin boolean;
  target_is_super_admin boolean;
BEGIN
  -- Check if caller has admin privileges
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  ) INTO is_super_admin;
  
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) INTO is_admin;

  IF NOT (is_super_admin OR is_admin) THEN
    RAISE EXCEPTION 'Only admins can reset passwords';
  END IF;

  -- Check if target is super_admin
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = target_user_id AND role = 'super_admin'
  ) INTO target_is_super_admin;

  -- Only super_admin can reset super_admin passwords
  IF target_is_super_admin AND NOT is_super_admin THEN
    RAISE EXCEPTION 'Only super_admin can reset super_admin passwords';
  END IF;

  -- Get user email
  SELECT email INTO user_email FROM public.profiles WHERE id = target_user_id;

  IF user_email IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Return user email for frontend to trigger password reset
  RETURN json_build_object(
    'success', true,
    'email', user_email,
    'message', 'Password reset can be triggered for this user'
  );
END;
$$;