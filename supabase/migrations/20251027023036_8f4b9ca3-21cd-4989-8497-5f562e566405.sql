-- Create districts table
CREATE TABLE public.districts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  overview TEXT NOT NULL,
  population TEXT,
  geography TEXT,
  highlights TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create villages table
CREATE TABLE public.villages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  district_id UUID NOT NULL REFERENCES public.districts(id) ON DELETE CASCADE,
  introduction TEXT NOT NULL,
  history TEXT,
  traditions TEXT,
  festivals TEXT,
  foods TEXT,
  recipes TEXT,
  handicrafts TEXT,
  artisans TEXT,
  stories TEXT,
  travel_tips TEXT,
  gallery_images TEXT[], -- Array of image URLs
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create district_highlights table
CREATE TABLE public.district_highlights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  district_id UUID NOT NULL REFERENCES public.districts(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('festival', 'food', 'craft', 'attraction')),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.villages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.district_highlights ENABLE ROW LEVEL SECURITY;

-- RLS Policies for districts
CREATE POLICY "Anyone can view districts" ON public.districts
  FOR SELECT USING (true);

CREATE POLICY "Admins and editors can manage districts" ON public.districts
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

-- RLS Policies for villages
CREATE POLICY "Anyone can view villages" ON public.villages
  FOR SELECT USING (true);

CREATE POLICY "Admins and editors can manage villages" ON public.villages
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

-- RLS Policies for district_highlights
CREATE POLICY "Anyone can view district highlights" ON public.district_highlights
  FOR SELECT USING (true);

CREATE POLICY "Admins and editors can manage district highlights" ON public.district_highlights
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

-- Create indexes for better performance
CREATE INDEX idx_villages_district_id ON public.villages(district_id);
CREATE INDEX idx_district_highlights_district_id ON public.district_highlights(district_id);
CREATE INDEX idx_villages_slug ON public.villages(slug);
CREATE INDEX idx_districts_slug ON public.districts(slug);

-- Add triggers for updated_at
CREATE TRIGGER update_districts_updated_at BEFORE UPDATE ON public.districts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_villages_updated_at BEFORE UPDATE ON public.villages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();