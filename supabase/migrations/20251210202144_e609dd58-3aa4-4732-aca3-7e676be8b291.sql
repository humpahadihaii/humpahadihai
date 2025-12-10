-- Drop the broader policies that allow all admin panel roles
DROP POLICY IF EXISTS "Admin panel users can insert activity logs" ON public.admin_activity_logs;
DROP POLICY IF EXISTS "Admin panel users can view activity logs" ON public.admin_activity_logs;

-- Keep only the restrictive policies (already exist):
-- "Only super_admin and admin can view activity logs"
-- "Only super_admin and admin can insert activity logs"

-- Note: The restrictive policies already exist, so admin_activity_logs is now 
-- properly restricted to super_admin and admin only.