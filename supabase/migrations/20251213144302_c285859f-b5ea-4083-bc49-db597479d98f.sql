
-- Create destination_guides table (parent destinations like Almora)
CREATE TABLE public.destination_guides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_introduction TEXT,
  hero_image TEXT,
  temperature_info JSONB DEFAULT '{"summer": "", "winter": "", "monsoon": ""}'::jsonb,
  local_people_culture TEXT,
  local_customs_etiquette TEXT,
  best_time_to_visit TEXT,
  ideal_duration TEXT,
  region TEXT, -- Kumaon, Garhwal, Jaunsar
  district_id UUID REFERENCES public.districts(id),
  latitude NUMERIC,
  longitude NUMERIC,
  
  -- SEO fields
  seo_title TEXT,
  seo_description TEXT,
  seo_image_url TEXT,
  seo_schema JSONB,
  share_templates JSONB,
  
  -- Status and ordering
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  sort_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- Create destination_places table (child places like temples, parks)
CREATE TABLE public.destination_places (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  destination_id UUID NOT NULL REFERENCES public.destination_guides(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Temple', 'Nature', 'Market', 'Experience', 'Wildlife', 'Historical', 'Adventure')),
  short_summary TEXT,
  
  -- Detailed content
  how_to_reach JSONB DEFAULT '{"by_road": "", "by_foot": "", "distance_from_destination": ""}'::jsonb,
  things_to_do TEXT[], -- Array of activities
  local_customs_rituals TEXT,
  historical_significance TEXT,
  spiritual_significance TEXT,
  
  -- Practical info
  best_visiting_time TEXT,
  approx_duration TEXT,
  entry_fee TEXT,
  timings TEXT,
  
  -- Location
  latitude NUMERIC,
  longitude NUMERIC,
  google_maps_url TEXT,
  
  -- Media
  main_image TEXT,
  image_gallery TEXT[], -- Array of image URLs
  
  -- SEO fields
  seo_title TEXT,
  seo_description TEXT,
  seo_image_url TEXT,
  seo_schema JSONB,
  share_templates JSONB,
  
  -- Status and ordering
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  sort_order INTEGER DEFAULT 0,
  is_highlighted BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  
  -- Unique slug per destination
  UNIQUE(destination_id, slug)
);

-- Create indexes for performance
CREATE INDEX idx_destination_guides_slug ON public.destination_guides(slug);
CREATE INDEX idx_destination_guides_status ON public.destination_guides(status);
CREATE INDEX idx_destination_guides_district ON public.destination_guides(district_id);
CREATE INDEX idx_destination_places_destination ON public.destination_places(destination_id);
CREATE INDEX idx_destination_places_category ON public.destination_places(category);
CREATE INDEX idx_destination_places_status ON public.destination_places(status);

-- Enable RLS
ALTER TABLE public.destination_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destination_places ENABLE ROW LEVEL SECURITY;

-- RLS Policies for destination_guides
CREATE POLICY "Anyone can view published destination guides"
ON public.destination_guides FOR SELECT
USING (status = 'published');

CREATE POLICY "Staff can view all destination guides"
ON public.destination_guides FOR SELECT
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'content_manager'::app_role) OR
  has_role(auth.uid(), 'content_editor'::app_role) OR
  has_role(auth.uid(), 'editor'::app_role)
);

CREATE POLICY "Staff can manage destination guides"
ON public.destination_guides FOR ALL
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'content_manager'::app_role) OR
  has_role(auth.uid(), 'content_editor'::app_role)
);

-- RLS Policies for destination_places
CREATE POLICY "Anyone can view published destination places"
ON public.destination_places FOR SELECT
USING (status = 'published');

CREATE POLICY "Staff can view all destination places"
ON public.destination_places FOR SELECT
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'content_manager'::app_role) OR
  has_role(auth.uid(), 'content_editor'::app_role) OR
  has_role(auth.uid(), 'editor'::app_role)
);

CREATE POLICY "Staff can manage destination places"
ON public.destination_places FOR ALL
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'content_manager'::app_role) OR
  has_role(auth.uid(), 'content_editor'::app_role)
);

-- Create trigger for updated_at
CREATE TRIGGER update_destination_guides_updated_at
  BEFORE UPDATE ON public.destination_guides
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_destination_places_updated_at
  BEFORE UPDATE ON public.destination_places
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
