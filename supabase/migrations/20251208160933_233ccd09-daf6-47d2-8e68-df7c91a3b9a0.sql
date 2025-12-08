
-- Create district_places table for "Places to Visit"
CREATE TABLE public.district_places (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  district_id UUID NOT NULL REFERENCES public.districts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  short_description TEXT,
  full_description TEXT,
  image_url TEXT,
  map_lat NUMERIC,
  map_lng NUMERIC,
  google_maps_url TEXT,
  is_highlighted BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create district_foods table for "Local Food"
CREATE TABLE public.district_foods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  district_id UUID NOT NULL REFERENCES public.districts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create district_festivals table for "Festivals & Culture"
CREATE TABLE public.district_festivals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  district_id UUID NOT NULL REFERENCES public.districts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  month TEXT,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tourism_providers table
CREATE TABLE public.tourism_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'other',
  district_id UUID REFERENCES public.districts(id) ON DELETE SET NULL,
  village_id UUID REFERENCES public.villages(id) ON DELETE SET NULL,
  contact_name TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  website_url TEXT,
  description TEXT,
  image_url TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  rating NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tourism_listings table
CREATE TABLE public.tourism_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.tourism_providers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  short_description TEXT,
  full_description TEXT,
  category TEXT NOT NULL DEFAULT 'stay',
  district_id UUID REFERENCES public.districts(id) ON DELETE SET NULL,
  base_price NUMERIC,
  price_unit TEXT,
  image_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tourism_inquiries table
CREATE TABLE public.tourism_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES public.tourism_listings(id) ON DELETE SET NULL,
  provider_id UUID REFERENCES public.tourism_providers(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  preferred_dates TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  source TEXT DEFAULT 'website',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.district_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.district_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.district_festivals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tourism_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tourism_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tourism_inquiries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for district_places
CREATE POLICY "Anyone can view active district places" ON public.district_places
  FOR SELECT USING (is_active = true);

CREATE POLICY "Staff can view all district places" ON public.district_places
  FOR SELECT USING (
    has_role(auth.uid(), 'super_admin') OR 
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'content_manager') OR
    has_role(auth.uid(), 'editor')
  );

CREATE POLICY "Admins can manage district places" ON public.district_places
  FOR ALL USING (
    has_role(auth.uid(), 'super_admin') OR 
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'content_manager')
  );

-- RLS Policies for district_foods
CREATE POLICY "Anyone can view active district foods" ON public.district_foods
  FOR SELECT USING (is_active = true);

CREATE POLICY "Staff can view all district foods" ON public.district_foods
  FOR SELECT USING (
    has_role(auth.uid(), 'super_admin') OR 
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'content_manager') OR
    has_role(auth.uid(), 'editor')
  );

CREATE POLICY "Admins can manage district foods" ON public.district_foods
  FOR ALL USING (
    has_role(auth.uid(), 'super_admin') OR 
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'content_manager')
  );

-- RLS Policies for district_festivals
CREATE POLICY "Anyone can view active district festivals" ON public.district_festivals
  FOR SELECT USING (is_active = true);

CREATE POLICY "Staff can view all district festivals" ON public.district_festivals
  FOR SELECT USING (
    has_role(auth.uid(), 'super_admin') OR 
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'content_manager') OR
    has_role(auth.uid(), 'editor')
  );

CREATE POLICY "Admins can manage district festivals" ON public.district_festivals
  FOR ALL USING (
    has_role(auth.uid(), 'super_admin') OR 
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'content_manager')
  );

-- RLS Policies for tourism_providers
CREATE POLICY "Anyone can view active tourism providers" ON public.tourism_providers
  FOR SELECT USING (is_active = true);

CREATE POLICY "Staff can view all tourism providers" ON public.tourism_providers
  FOR SELECT USING (
    has_role(auth.uid(), 'super_admin') OR 
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'content_manager')
  );

CREATE POLICY "Admins can manage tourism providers" ON public.tourism_providers
  FOR ALL USING (
    has_role(auth.uid(), 'super_admin') OR 
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'content_manager')
  );

-- RLS Policies for tourism_listings
CREATE POLICY "Anyone can view active tourism listings" ON public.tourism_listings
  FOR SELECT USING (is_active = true);

CREATE POLICY "Staff can view all tourism listings" ON public.tourism_listings
  FOR SELECT USING (
    has_role(auth.uid(), 'super_admin') OR 
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'content_manager')
  );

CREATE POLICY "Admins can manage tourism listings" ON public.tourism_listings
  FOR ALL USING (
    has_role(auth.uid(), 'super_admin') OR 
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'content_manager')
  );

-- RLS Policies for tourism_inquiries
CREATE POLICY "Anyone can submit tourism inquiries" ON public.tourism_inquiries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Staff can view tourism inquiries" ON public.tourism_inquiries
  FOR SELECT USING (
    has_role(auth.uid(), 'super_admin') OR 
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'content_manager')
  );

CREATE POLICY "Admins can manage tourism inquiries" ON public.tourism_inquiries
  FOR ALL USING (
    has_role(auth.uid(), 'super_admin') OR 
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'content_manager')
  );

-- Add indexes for performance
CREATE INDEX idx_district_places_district ON public.district_places(district_id);
CREATE INDEX idx_district_foods_district ON public.district_foods(district_id);
CREATE INDEX idx_district_festivals_district ON public.district_festivals(district_id);
CREATE INDEX idx_tourism_providers_district ON public.tourism_providers(district_id);
CREATE INDEX idx_tourism_listings_provider ON public.tourism_listings(provider_id);
CREATE INDEX idx_tourism_listings_district ON public.tourism_listings(district_id);
CREATE INDEX idx_tourism_inquiries_listing ON public.tourism_inquiries(listing_id);
CREATE INDEX idx_tourism_inquiries_provider ON public.tourism_inquiries(provider_id);

-- Updated_at triggers
CREATE TRIGGER update_district_places_updated_at BEFORE UPDATE ON public.district_places
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_district_foods_updated_at BEFORE UPDATE ON public.district_foods
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_district_festivals_updated_at BEFORE UPDATE ON public.district_festivals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tourism_providers_updated_at BEFORE UPDATE ON public.tourism_providers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tourism_listings_updated_at BEFORE UPDATE ON public.tourism_listings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tourism_inquiries_updated_at BEFORE UPDATE ON public.tourism_inquiries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
