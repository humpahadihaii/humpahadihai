-- Create analytics_settings table for admin controls
CREATE TABLE IF NOT EXISTS public.analytics_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analytics_enabled boolean NOT NULL DEFAULT true,
  ad_personalization_enabled boolean NOT NULL DEFAULT false,
  anonymize_ip boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Insert default settings
INSERT INTO public.analytics_settings (id, analytics_enabled, ad_personalization_enabled, anonymize_ip)
VALUES (gen_random_uuid(), true, false, true)
ON CONFLICT DO NOTHING;

-- Create ga_events table for server-side event logging
CREATE TABLE IF NOT EXISTS public.ga_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  client_id text,
  user_id_hash text,
  status text NOT NULL DEFAULT 'pending',
  ga_response jsonb,
  retry_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  sent_at timestamp with time zone
);

-- Enable RLS on analytics_settings
ALTER TABLE public.analytics_settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read analytics settings (needed for gtag conditional loading)
CREATE POLICY "Anyone can view analytics settings"
ON public.analytics_settings FOR SELECT
USING (true);

-- Only super_admin and admin can update settings
CREATE POLICY "Admins can update analytics settings"
ON public.analytics_settings FOR UPDATE
USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Enable RLS on ga_events
ALTER TABLE public.ga_events ENABLE ROW LEVEL SECURITY;

-- Only admins can view ga_events
CREATE POLICY "Admins can view ga events"
ON public.ga_events FOR SELECT
USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Allow service role to insert (for edge functions)
CREATE POLICY "Service can insert ga events"
ON public.ga_events FOR INSERT
WITH CHECK (true);

-- Allow service role to update (for retry logic)
CREATE POLICY "Admins can update ga events"
ON public.ga_events FOR UPDATE
USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_ga_events_status ON public.ga_events(status);
CREATE INDEX IF NOT EXISTS idx_ga_events_created_at ON public.ga_events(created_at DESC);