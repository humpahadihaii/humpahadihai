-- ============================================
-- FIX INFINITE RECURSION IN user_roles RLS
-- ============================================

-- Step 1: Add role column to profiles if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'role'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN role app_role;
  END IF;
END $$;

-- Step 2: Sync existing roles from user_roles to profiles
UPDATE public.profiles p
SET role = (
  SELECT ur.role 
  FROM public.user_roles ur 
  WHERE ur.user_id = p.id
  ORDER BY 
    CASE ur.role
      WHEN 'super_admin' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'content_manager' THEN 3
      WHEN 'content_editor' THEN 4
      WHEN 'moderator' THEN 5
      WHEN 'editor' THEN 6
      WHEN 'user' THEN 7
      ELSE 8
    END
  LIMIT 1
)
WHERE EXISTS (
  SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id
);

-- Step 3: Create NON-RECURSIVE functions
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = _user_id LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.user_has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = _user_id AND role = _role
  )
$$;

-- Step 4: Create trigger to sync user_roles to profiles
CREATE OR REPLACE FUNCTION public.sync_role_to_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.profiles
    SET role = NEW.role
    WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles
    SET role = (
      SELECT ur.role 
      FROM public.user_roles ur 
      WHERE ur.user_id = OLD.user_id
      AND ur.id != OLD.id
      ORDER BY 
        CASE ur.role
          WHEN 'super_admin' THEN 1
          WHEN 'admin' THEN 2
          WHEN 'content_manager' THEN 3
          WHEN 'content_editor' THEN 4
          WHEN 'moderator' THEN 5
          WHEN 'editor' THEN 6
          WHEN 'user' THEN 7
          ELSE 8
        END
      LIMIT 1
    )
    WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS sync_user_role_to_profile ON public.user_roles;
CREATE TRIGGER sync_user_role_to_profile
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_role_to_profile();

-- Step 5: Recreate user_roles policies WITHOUT recursion
DROP POLICY IF EXISTS "Admin can manage non-super-admin roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admin can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

CREATE POLICY "Super admin can manage all roles"
ON public.user_roles
FOR ALL
USING (public.user_has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admin can manage non-super-admin roles"
ON public.user_roles
FOR ALL
USING (
  public.user_has_role(auth.uid(), 'admin') 
  AND role != 'super_admin'
);

CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());

-- Step 6: Recreate profiles policies
DROP POLICY IF EXISTS "Super admin full access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update non-super-admin profiles" ON public.profiles;
DROP POLICY IF EXISTS "Content managers and moderators can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Super admin full access to profiles"
ON public.profiles
FOR ALL
USING (public.user_has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admin can view all profiles"
ON public.profiles
FOR SELECT
USING (public.user_has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update non-super-admin profiles"
ON public.profiles
FOR UPDATE
USING (
  public.user_has_role(auth.uid(), 'admin')
  AND (
    NOT public.user_has_role(id, 'super_admin')
    OR public.user_has_role(auth.uid(), 'super_admin')
  )
);

CREATE POLICY "Content managers and moderators can view profiles"
ON public.profiles
FOR SELECT
USING (
  public.user_has_role(auth.uid(), 'content_manager')
  OR public.user_has_role(auth.uid(), 'content_editor')
  OR public.user_has_role(auth.uid(), 'moderator')
);

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Step 7: Update handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF NEW.email = 'joshihj2580+1@gmail.com' THEN
    INSERT INTO public.profiles (id, email, full_name, last_active_at, role, status)
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'full_name',
      now(),
      'super_admin',
      'active'
    );
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'super_admin');
  ELSE
    INSERT INTO public.profiles (id, email, full_name, last_active_at, status)
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'full_name',
      now(),
      'pending'
    );
    
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