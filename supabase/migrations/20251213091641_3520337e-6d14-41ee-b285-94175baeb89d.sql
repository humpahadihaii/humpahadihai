-- Drop existing policy
DROP POLICY IF EXISTS "Admins can view site visits" ON public.site_visits;

-- Create new policy using profiles.role directly for reliability
CREATE POLICY "Admins can view site visits" ON public.site_visits
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('super_admin', 'admin', 'analytics_viewer')
  )
);

-- Also ensure page_views and bookings_summary have proper policies
DROP POLICY IF EXISTS "Admins can view page views" ON public.page_views;
CREATE POLICY "Admins can view page views" ON public.page_views
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('super_admin', 'admin', 'analytics_viewer')
  )
);

DROP POLICY IF EXISTS "Admins can view bookings summary" ON public.bookings_summary;
CREATE POLICY "Admins can view bookings summary" ON public.bookings_summary
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('super_admin', 'admin', 'analytics_viewer')
  )
);