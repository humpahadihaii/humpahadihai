-- Create site_visits table for raw visit data
CREATE TABLE public.site_visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  referrer TEXT,
  device TEXT,
  browser TEXT,
  country TEXT,
  ip_hash TEXT, -- Hashed IP for uniqueness without storing actual IP
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create page_views table for aggregated counts
CREATE TABLE public.page_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page TEXT NOT NULL UNIQUE,
  count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create internal_events table for custom event tracking
CREATE TABLE public.internal_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bookings_summary table for booking analytics
CREATE TABLE public.bookings_summary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id UUID,
  listing_id UUID,
  product_id UUID,
  booking_type TEXT,
  url TEXT,
  device TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings_summary ENABLE ROW LEVEL SECURITY;

-- Public can insert (for tracking)
CREATE POLICY "Anyone can insert site visits" ON public.site_visits FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert page views" ON public.page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update page views" ON public.page_views FOR UPDATE USING (true);
CREATE POLICY "Anyone can insert events" ON public.internal_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert booking summaries" ON public.bookings_summary FOR INSERT WITH CHECK (true);

-- Admins can view all analytics data
CREATE POLICY "Admins can view site visits" ON public.site_visits FOR SELECT 
  USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'analytics_viewer'::app_role));

CREATE POLICY "Admins can view page views" ON public.page_views FOR SELECT 
  USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'analytics_viewer'::app_role));

CREATE POLICY "Admins can view events" ON public.internal_events FOR SELECT 
  USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'analytics_viewer'::app_role));

CREATE POLICY "Admins can view booking summaries" ON public.bookings_summary FOR SELECT 
  USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'analytics_viewer'::app_role));

-- Create index for faster queries
CREATE INDEX idx_site_visits_created_at ON public.site_visits(created_at DESC);
CREATE INDEX idx_site_visits_url ON public.site_visits(url);
CREATE INDEX idx_page_views_page ON public.page_views(page);
CREATE INDEX idx_internal_events_created_at ON public.internal_events(created_at DESC);
CREATE INDEX idx_bookings_summary_created_at ON public.bookings_summary(created_at DESC);