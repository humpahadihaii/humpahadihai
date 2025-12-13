
-- Content Categories table (Food, Temples, Culture, etc.)
CREATE TABLE public.content_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  district_id UUID REFERENCES public.districts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'folder',
  hero_image TEXT,
  sort_order INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  seo_title TEXT,
  seo_description TEXT,
  seo_image_url TEXT,
  seo_schema JSONB,
  share_templates JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  UNIQUE(district_id, slug)
);

-- Content Subcategories table (Sweets, Main Dishes, etc.)
CREATE TABLE public.content_subcategories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.content_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  hero_image TEXT,
  sort_order INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  seo_title TEXT,
  seo_description TEXT,
  seo_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(category_id, slug)
);

-- Cultural Content table (Bal Mithai, Temples, etc. - the detail pages)
CREATE TABLE public.cultural_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  district_id UUID NOT NULL REFERENCES public.districts(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.content_categories(id) ON DELETE CASCADE,
  subcategory_id UUID REFERENCES public.content_subcategories(id) ON DELETE SET NULL,
  
  -- Basic Info
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  short_intro TEXT,
  hero_image TEXT,
  image_gallery TEXT[],
  
  -- Detailed Content (flexible for different content types)
  cultural_significance TEXT,
  origin_history TEXT,
  ingredients JSONB, -- For food items
  preparation_method TEXT,
  taste_description TEXT,
  consumption_occasions TEXT,
  famous_places JSONB, -- Array of {name, location, optional_listing_id}
  shelf_life_tips TEXT,
  price_range TEXT,
  dos_and_donts TEXT,
  fun_facts TEXT,
  
  -- For temples/places
  timings TEXT,
  entry_fee TEXT,
  how_to_reach JSONB,
  things_to_do TEXT[],
  local_customs TEXT,
  historical_significance TEXT,
  spiritual_significance TEXT,
  
  -- Coordinates
  latitude NUMERIC,
  longitude NUMERIC,
  google_maps_url TEXT,
  
  -- FAQ
  faqs JSONB, -- Array of {question, answer}
  
  -- Visibility & Status
  is_featured BOOLEAN DEFAULT false,
  is_highlighted BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  
  -- SEO
  seo_title TEXT,
  seo_description TEXT,
  seo_image_url TEXT,
  seo_schema JSONB,
  share_templates JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  
  UNIQUE(district_id, category_id, slug)
);

-- Enable RLS
ALTER TABLE public.content_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cultural_content ENABLE ROW LEVEL SECURITY;

-- RLS Policies for content_categories
CREATE POLICY "Anyone can view published categories" ON public.content_categories
  FOR SELECT USING (status = 'published');

CREATE POLICY "Staff can view all categories" ON public.content_categories
  FOR SELECT USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'content_manager'::app_role) OR
    has_role(auth.uid(), 'content_editor'::app_role)
  );

CREATE POLICY "Admins can manage categories" ON public.content_categories
  FOR ALL USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'content_manager'::app_role)
  );

-- RLS Policies for content_subcategories
CREATE POLICY "Anyone can view published subcategories" ON public.content_subcategories
  FOR SELECT USING (status = 'published');

CREATE POLICY "Staff can view all subcategories" ON public.content_subcategories
  FOR SELECT USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'content_manager'::app_role) OR
    has_role(auth.uid(), 'content_editor'::app_role)
  );

CREATE POLICY "Admins can manage subcategories" ON public.content_subcategories
  FOR ALL USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'content_manager'::app_role)
  );

-- RLS Policies for cultural_content
CREATE POLICY "Anyone can view published content" ON public.cultural_content
  FOR SELECT USING (status = 'published');

CREATE POLICY "Staff can view all content" ON public.cultural_content
  FOR SELECT USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'content_manager'::app_role) OR
    has_role(auth.uid(), 'content_editor'::app_role)
  );

CREATE POLICY "Admins can manage content" ON public.cultural_content
  FOR ALL USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'content_manager'::app_role)
  );

-- Create indexes for performance
CREATE INDEX idx_content_categories_district ON public.content_categories(district_id);
CREATE INDEX idx_content_categories_slug ON public.content_categories(slug);
CREATE INDEX idx_content_subcategories_category ON public.content_subcategories(category_id);
CREATE INDEX idx_cultural_content_district ON public.cultural_content(district_id);
CREATE INDEX idx_cultural_content_category ON public.cultural_content(category_id);
CREATE INDEX idx_cultural_content_subcategory ON public.cultural_content(subcategory_id);
CREATE INDEX idx_cultural_content_slug ON public.cultural_content(slug);

-- Trigger for updated_at
CREATE TRIGGER update_content_categories_updated_at
  BEFORE UPDATE ON public.content_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_subcategories_updated_at
  BEFORE UPDATE ON public.content_subcategories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cultural_content_updated_at
  BEFORE UPDATE ON public.cultural_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
