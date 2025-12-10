-- Add/update RLS policies for admin-only tables to restrict access to super_admin and admin roles only

-- Drop existing policies on admin_activity_logs if they exist and recreate
DROP POLICY IF EXISTS "Admins can view activity logs" ON public.admin_activity_logs;
DROP POLICY IF EXISTS "Admins can insert activity logs" ON public.admin_activity_logs;
DROP POLICY IF EXISTS "Only super_admin and admin can view activity logs" ON public.admin_activity_logs;
DROP POLICY IF EXISTS "Only super_admin and admin can insert activity logs" ON public.admin_activity_logs;

-- Create strict admin-only policies for admin_activity_logs
CREATE POLICY "Only super_admin and admin can view activity logs"
ON public.admin_activity_logs
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Only super_admin and admin can insert activity logs"
ON public.admin_activity_logs
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Drop and recreate policies for analytics_settings
DROP POLICY IF EXISTS "Admins can manage analytics settings" ON public.analytics_settings;
DROP POLICY IF EXISTS "Only super_admin and admin can manage analytics settings" ON public.analytics_settings;

CREATE POLICY "Only super_admin and admin can manage analytics settings"
ON public.analytics_settings
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Drop and recreate policies for site_settings
DROP POLICY IF EXISTS "Admins can manage settings" ON public.site_settings;
DROP POLICY IF EXISTS "Only super_admin and admin can manage site settings" ON public.site_settings;

CREATE POLICY "Only super_admin and admin can manage site settings"
ON public.site_settings
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Keep public read access for site_settings (needed for frontend)
DROP POLICY IF EXISTS "Anyone can view settings" ON public.site_settings;
CREATE POLICY "Anyone can view site settings"
ON public.site_settings
FOR SELECT
TO anon, authenticated
USING (true);