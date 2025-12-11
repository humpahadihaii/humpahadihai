-- Create geocode cache table
CREATE TABLE IF NOT EXISTS public.geocode_cache (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  address text NOT NULL UNIQUE,
  latitude numeric,
  longitude numeric,
  formatted_address text,
  place_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '30 days')
);

-- Create map settings table
CREATE TABLE IF NOT EXISTS public.map_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  singleton_flag boolean NOT NULL DEFAULT true UNIQUE,
  maps_enabled boolean NOT NULL DEFAULT true,
  show_on_homepage boolean NOT NULL DEFAULT true,
  show_on_districts boolean NOT NULL DEFAULT true,
  show_on_villages boolean NOT NULL DEFAULT true,
  show_on_marketplace boolean NOT NULL DEFAULT true,
  show_on_travel_packages boolean NOT NULL DEFAULT true,
  show_on_hotels boolean NOT NULL DEFAULT true,
  default_zoom integer NOT NULL DEFAULT 9,
  default_lat numeric NOT NULL DEFAULT 30.0668,
  default_lng numeric NOT NULL DEFAULT 79.0193,
  map_style text DEFAULT 'roadmap',
  enable_clustering boolean NOT NULL DEFAULT true,
  enable_street_view boolean NOT NULL DEFAULT false,
  api_key_status text DEFAULT 'unknown',
  last_api_test timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT singleton_check CHECK (singleton_flag = true)
);

-- Insert default map settings
INSERT INTO public.map_settings (singleton_flag)
VALUES (true)
ON CONFLICT (singleton_flag) DO NOTHING;

-- Enable RLS
ALTER TABLE public.geocode_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.map_settings ENABLE ROW LEVEL SECURITY;

-- Geocode cache policies
CREATE POLICY "Anyone can view geocode cache"
ON public.geocode_cache FOR SELECT
USING (true);

CREATE POLICY "Service can insert geocode cache"
ON public.geocode_cache FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can manage geocode cache"
ON public.geocode_cache FOR ALL
USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin'));

-- Map settings policies
CREATE POLICY "Anyone can view map settings"
ON public.map_settings FOR SELECT
USING (true);

CREATE POLICY "Admins can update map settings"
ON public.map_settings FOR UPDATE
USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin'));

-- Create index for geocode cache expiry
CREATE INDEX IF NOT EXISTS idx_geocode_cache_expires ON public.geocode_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_geocode_cache_address ON public.geocode_cache(address);