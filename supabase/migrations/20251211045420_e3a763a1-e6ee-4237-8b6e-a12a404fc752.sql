-- Create homepage_visits table for tracking unique daily visitors
CREATE TABLE public.homepage_visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_key TEXT NOT NULL,
  ip TEXT,
  ua TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for fast lookups by visitor_key and date
CREATE INDEX idx_homepage_visits_visitor_key_date ON public.homepage_visits (visitor_key, created_at);
CREATE INDEX idx_homepage_visits_created_at ON public.homepage_visits (created_at);

-- Enable RLS
ALTER TABLE public.homepage_visits ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public tracking)
CREATE POLICY "Anyone can insert homepage visits"
ON public.homepage_visits
FOR INSERT
WITH CHECK (true);

-- Only admins can view
CREATE POLICY "Admins can view homepage visits"
ON public.homepage_visits
FOR SELECT
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'analytics_viewer'::app_role)
);

-- Create a view for cached summary (can be used as simple cache)
CREATE OR REPLACE VIEW public.homepage_visits_summary AS
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE) as today
FROM public.homepage_visits;