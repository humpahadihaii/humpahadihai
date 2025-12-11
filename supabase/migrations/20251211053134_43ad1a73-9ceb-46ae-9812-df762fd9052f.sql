-- Add public read access for notify settings and templates (needed for edge function)
CREATE POLICY "Public can view notify settings"
ON public.booking_notify_settings FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Public can view active notify templates"
ON public.booking_notify_templates FOR SELECT
TO anon, authenticated
USING (is_active = true);