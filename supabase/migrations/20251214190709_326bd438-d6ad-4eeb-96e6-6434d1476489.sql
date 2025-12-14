
-- Create route_categories table for organizing routes by type/region
CREATE TABLE public.route_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'map-pin',
  cover_image TEXT,
  sort_order INTEGER DEFAULT 0,
  route_type TEXT DEFAULT 'region',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create junction table for route categories and districts
CREATE TABLE public.route_category_districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_category_id UUID NOT NULL REFERENCES public.route_categories(id) ON DELETE CASCADE,
  district_id UUID NOT NULL REFERENCES public.districts(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(route_category_id, district_id)
);

-- Create place_guides table for comprehensive place guide data
CREATE TABLE public.place_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id UUID REFERENCES public.districts(id),
  village_id UUID REFERENCES public.villages(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT DEFAULT 'attraction',
  short_description TEXT,
  about_the_place TEXT,
  how_to_reach JSONB DEFAULT '{}',
  routes_transport TEXT,
  weather_info TEXT,
  things_to_do TEXT[] DEFAULT '{}',
  local_tips TEXT,
  emergency_info JSONB DEFAULT '{}',
  cover_image TEXT,
  gallery_images TEXT[] DEFAULT '{}',
  latitude NUMERIC,
  longitude NUMERIC,
  google_maps_url TEXT,
  status TEXT DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT false,
  has_full_guide BOOLEAN DEFAULT false,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.route_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_category_districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.place_guides ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public can view active route categories"
  ON public.route_categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can view route category districts"
  ON public.route_category_districts FOR SELECT
  USING (true);

CREATE POLICY "Public can view published place guides"
  ON public.place_guides FOR SELECT
  USING (status = 'published');

-- Admin write policies for route_categories
CREATE POLICY "Admins can manage route categories"
  ON public.route_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'content_manager')
    )
  );

-- Admin write policies for route_category_districts
CREATE POLICY "Admins can manage route category districts"
  ON public.route_category_districts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'content_manager')
    )
  );

-- Admin write policies for place_guides
CREATE POLICY "Admins can manage place guides"
  ON public.place_guides FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'content_manager')
    )
  );

-- Create indexes for performance
CREATE INDEX idx_route_categories_slug ON public.route_categories(slug);
CREATE INDEX idx_route_categories_active ON public.route_categories(is_active, sort_order);
CREATE INDEX idx_route_category_districts_category ON public.route_category_districts(route_category_id);
CREATE INDEX idx_route_category_districts_district ON public.route_category_districts(district_id);
CREATE INDEX idx_place_guides_slug ON public.place_guides(slug);
CREATE INDEX idx_place_guides_district ON public.place_guides(district_id);
CREATE INDEX idx_place_guides_status ON public.place_guides(status);

-- Seed initial route categories
INSERT INTO public.route_categories (name, slug, description, icon, route_type, sort_order) VALUES
('Kumaon Region', 'kumaon-region', 'Explore the beautiful Kumaon hills with its lakes, temples, and wildlife', 'mountain', 'region', 1),
('Garhwal Region', 'garhwal-region', 'Discover the sacred Garhwal region with Char Dham and adventure destinations', 'mountain-snow', 'region', 2),
('Pilgrimage Routes', 'pilgrimage-routes', 'Sacred journeys to holy shrines and temples of Uttarakhand', 'church', 'pilgrimage', 3),
('Trekking Routes', 'trekking-routes', 'Adventure trails through meadows, glaciers, and high-altitude passes', 'footprints', 'trek', 4),
('Scenic Drives', 'scenic-drives', 'Breathtaking road journeys through mountains and valleys', 'car', 'scenic', 5);

-- Trigger for updated_at
CREATE TRIGGER update_route_categories_updated_at
  BEFORE UPDATE ON public.route_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_place_guides_updated_at
  BEFORE UPDATE ON public.place_guides
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
