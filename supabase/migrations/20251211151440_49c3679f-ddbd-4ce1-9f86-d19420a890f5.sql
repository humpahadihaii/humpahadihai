-- =============================================
-- PHASE 1: Interactive Discovery Map - Database Setup
-- =============================================

-- 1. Add geo columns to villages (if not exists)
ALTER TABLE villages ADD COLUMN IF NOT EXISTS lat numeric;
ALTER TABLE villages ADD COLUMN IF NOT EXISTS lng numeric;
ALTER TABLE villages ADD COLUMN IF NOT EXISTS map_visible boolean DEFAULT true;
ALTER TABLE villages ADD COLUMN IF NOT EXISTS map_featured boolean DEFAULT false;
ALTER TABLE villages ADD COLUMN IF NOT EXISTS map_priority integer DEFAULT 0;

-- 2. Add geo columns to tourism_providers
ALTER TABLE tourism_providers ADD COLUMN IF NOT EXISTS lat numeric;
ALTER TABLE tourism_providers ADD COLUMN IF NOT EXISTS lng numeric;
ALTER TABLE tourism_providers ADD COLUMN IF NOT EXISTS map_visible boolean DEFAULT true;
ALTER TABLE tourism_providers ADD COLUMN IF NOT EXISTS map_featured boolean DEFAULT false;

-- 3. Add geo columns to tourism_listings
ALTER TABLE tourism_listings ADD COLUMN IF NOT EXISTS lat numeric;
ALTER TABLE tourism_listings ADD COLUMN IF NOT EXISTS lng numeric;
ALTER TABLE tourism_listings ADD COLUMN IF NOT EXISTS map_visible boolean DEFAULT true;
ALTER TABLE tourism_listings ADD COLUMN IF NOT EXISTS map_featured boolean DEFAULT false;

-- 4. Add geo columns to travel_packages
ALTER TABLE travel_packages ADD COLUMN IF NOT EXISTS start_lat numeric;
ALTER TABLE travel_packages ADD COLUMN IF NOT EXISTS start_lng numeric;
ALTER TABLE travel_packages ADD COLUMN IF NOT EXISTS map_visible boolean DEFAULT true;
ALTER TABLE travel_packages ADD COLUMN IF NOT EXISTS map_featured boolean DEFAULT false;

-- 5. Add geo columns to local_products
ALTER TABLE local_products ADD COLUMN IF NOT EXISTS lat numeric;
ALTER TABLE local_products ADD COLUMN IF NOT EXISTS lng numeric;
ALTER TABLE local_products ADD COLUMN IF NOT EXISTS map_visible boolean DEFAULT true;

-- 6. Add geo columns to cms_events
ALTER TABLE cms_events ADD COLUMN IF NOT EXISTS lat numeric;
ALTER TABLE cms_events ADD COLUMN IF NOT EXISTS lng numeric;
ALTER TABLE cms_events ADD COLUMN IF NOT EXISTS map_visible boolean DEFAULT true;

-- 7. Create map_highlights table for custom polygons/areas
CREATE TABLE IF NOT EXISTS map_highlights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  description text,
  image_url text,
  highlight_type text NOT NULL DEFAULT 'area', -- 'area', 'trail', 'region', 'custom'
  geometry_type text NOT NULL DEFAULT 'polygon', -- 'polygon', 'polyline', 'circle'
  coordinates jsonb NOT NULL DEFAULT '[]'::jsonb, -- Array of [lng, lat] pairs
  center_lat numeric,
  center_lng numeric,
  radius_meters numeric, -- For circle type
  stroke_color text DEFAULT '#3b82f6',
  fill_color text DEFAULT '#3b82f680',
  stroke_width integer DEFAULT 2,
  linked_villages uuid[] DEFAULT '{}',
  linked_districts uuid[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  priority integer DEFAULT 0,
  status text DEFAULT 'published', -- 'draft', 'pending', 'published'
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 8. Create map_poi_cache for pre-computed POI data (for performance)
CREATE TABLE IF NOT EXISTS map_poi_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL, -- 'village', 'provider', 'listing', 'package', 'product', 'event'
  entity_id uuid NOT NULL,
  title text NOT NULL,
  slug text,
  excerpt text,
  image_url text,
  lat numeric NOT NULL,
  lng numeric NOT NULL,
  category text,
  subcategory text,
  district_id uuid,
  district_name text,
  village_id uuid,
  village_name text,
  price_min numeric,
  price_max numeric,
  rating numeric,
  tags text[] DEFAULT '{}',
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  properties jsonb DEFAULT '{}'::jsonb, -- Additional entity-specific properties
  cached_at timestamptz DEFAULT now(),
  UNIQUE(entity_type, entity_id)
);

-- 9. Create indexes for spatial queries
CREATE INDEX IF NOT EXISTS idx_villages_lat_lng ON villages(lat, lng) WHERE lat IS NOT NULL AND lng IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_districts_lat_lng ON districts(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tourism_providers_lat_lng ON tourism_providers(lat, lng) WHERE lat IS NOT NULL AND lng IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tourism_listings_lat_lng ON tourism_listings(lat, lng) WHERE lat IS NOT NULL AND lng IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_travel_packages_lat_lng ON travel_packages(start_lat, start_lng) WHERE start_lat IS NOT NULL AND start_lng IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_local_products_lat_lng ON local_products(lat, lng) WHERE lat IS NOT NULL AND lng IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cms_events_lat_lng ON cms_events(lat, lng) WHERE lat IS NOT NULL AND lng IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_district_places_lat_lng ON district_places(map_lat, map_lng) WHERE map_lat IS NOT NULL AND map_lng IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_district_hotels_lat_lng ON district_hotels(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- 10. Create indexes on map_poi_cache
CREATE INDEX IF NOT EXISTS idx_map_poi_cache_lat_lng ON map_poi_cache(lat, lng);
CREATE INDEX IF NOT EXISTS idx_map_poi_cache_entity_type ON map_poi_cache(entity_type);
CREATE INDEX IF NOT EXISTS idx_map_poi_cache_district ON map_poi_cache(district_id);
CREATE INDEX IF NOT EXISTS idx_map_poi_cache_featured ON map_poi_cache(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_map_poi_cache_active ON map_poi_cache(is_active) WHERE is_active = true;

-- 11. Create indexes on map_highlights
CREATE INDEX IF NOT EXISTS idx_map_highlights_active ON map_highlights(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_map_highlights_featured ON map_highlights(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_map_highlights_center ON map_highlights(center_lat, center_lng);

-- 12. Enable RLS on new tables
ALTER TABLE map_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE map_poi_cache ENABLE ROW LEVEL SECURITY;

-- 13. RLS policies for map_highlights
CREATE POLICY "Anyone can view active map highlights"
  ON map_highlights FOR SELECT
  USING (is_active = true AND status = 'published');

CREATE POLICY "Staff can view all map highlights"
  ON map_highlights FOR SELECT
  USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'content_manager'::app_role)
  );

CREATE POLICY "Admins can manage map highlights"
  ON map_highlights FOR ALL
  USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Content managers can create pending highlights"
  ON map_highlights FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'content_manager'::app_role) AND
    status = 'pending'
  );

-- 14. RLS policies for map_poi_cache (read-only for public, admin can refresh)
CREATE POLICY "Anyone can view active POI cache"
  ON map_poi_cache FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage POI cache"
  ON map_poi_cache FOR ALL
  USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role)
  );

-- 15. Function to refresh POI cache
CREATE OR REPLACE FUNCTION refresh_map_poi_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Clear existing cache
  DELETE FROM map_poi_cache;
  
  -- Insert villages
  INSERT INTO map_poi_cache (entity_type, entity_id, title, slug, excerpt, image_url, lat, lng, district_id, district_name, is_featured, is_active, properties)
  SELECT 
    'village', v.id, v.name, v.slug, v.tagline, v.thumbnail_image_url,
    v.lat, v.lng, v.district_id, d.name,
    COALESCE(v.map_featured, false), COALESCE(v.map_visible, true) AND v.status = 'published',
    jsonb_build_object('population', v.population, 'altitude', v.altitude)
  FROM villages v
  LEFT JOIN districts d ON v.district_id = d.id
  WHERE v.lat IS NOT NULL AND v.lng IS NOT NULL AND v.status = 'published';
  
  -- Insert tourism providers
  INSERT INTO map_poi_cache (entity_type, entity_id, title, slug, excerpt, image_url, lat, lng, category, district_id, district_name, village_id, village_name, rating, is_featured, is_active, properties)
  SELECT 
    'provider', p.id, p.name, NULL, p.description, p.image_url,
    p.lat, p.lng, p.type, p.district_id, d.name, p.village_id, v.name,
    p.rating, COALESCE(p.map_featured, false), COALESCE(p.map_visible, true) AND p.is_active,
    jsonb_build_object('is_verified', p.is_verified, 'is_local', p.is_local)
  FROM tourism_providers p
  LEFT JOIN districts d ON p.district_id = d.id
  LEFT JOIN villages v ON p.village_id = v.id
  WHERE p.lat IS NOT NULL AND p.lng IS NOT NULL AND p.is_active = true;
  
  -- Insert tourism listings
  INSERT INTO map_poi_cache (entity_type, entity_id, title, slug, excerpt, image_url, lat, lng, category, district_id, district_name, price_min, rating, is_featured, is_active, properties)
  SELECT 
    'listing', l.id, l.title, l.slug, l.short_description, l.thumbnail_image_url,
    l.lat, l.lng, l.category, l.district_id, d.name,
    l.price_per_night, l.rating,
    COALESCE(l.map_featured, false) OR l.is_featured, COALESCE(l.map_visible, true) AND l.is_active,
    jsonb_build_object('provider_id', l.provider_id, 'price_unit', l.price_unit)
  FROM tourism_listings l
  LEFT JOIN districts d ON l.district_id = d.id
  WHERE l.lat IS NOT NULL AND l.lng IS NOT NULL AND l.is_active = true;
  
  -- Insert travel packages
  INSERT INTO map_poi_cache (entity_type, entity_id, title, slug, excerpt, image_url, lat, lng, category, price_min, is_featured, is_active, properties)
  SELECT 
    'package', p.id, p.title, p.slug, p.short_description, p.thumbnail_image_url,
    p.start_lat, p.start_lng, p.region,
    p.price_per_person, COALESCE(p.map_featured, false) OR p.is_featured, COALESCE(p.map_visible, true) AND p.is_active,
    jsonb_build_object('duration_days', p.duration_days, 'destination', p.destination)
  FROM travel_packages p
  WHERE p.start_lat IS NOT NULL AND p.start_lng IS NOT NULL AND p.is_active = true;
  
  -- Insert district places
  INSERT INTO map_poi_cache (entity_type, entity_id, title, slug, excerpt, image_url, lat, lng, category, district_id, district_name, is_featured, is_active)
  SELECT 
    'place', p.id, p.name, NULL, p.short_description, p.image_url,
    p.map_lat, p.map_lng, 'place', p.district_id, d.name,
    p.is_highlighted, p.is_active
  FROM district_places p
  LEFT JOIN districts d ON p.district_id = d.id
  WHERE p.map_lat IS NOT NULL AND p.map_lng IS NOT NULL AND p.is_active = true;
  
  -- Insert events
  INSERT INTO map_poi_cache (entity_type, entity_id, title, slug, excerpt, image_url, lat, lng, category, is_featured, is_active, properties)
  SELECT 
    'event', e.id, e.title, e.slug, e.description, e.banner_image_url,
    e.lat, e.lng, 'event',
    e.is_featured, COALESCE(e.map_visible, true) AND e.status = 'published',
    jsonb_build_object('event_date', e.event_date, 'location', e.location)
  FROM cms_events e
  WHERE e.lat IS NOT NULL AND e.lng IS NOT NULL AND e.status = 'published';
END;
$$;

-- 16. Trigger to update cached_at on map_poi_cache changes
CREATE OR REPLACE FUNCTION update_map_poi_cache_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.cached_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER map_poi_cache_timestamp
  BEFORE UPDATE ON map_poi_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_map_poi_cache_timestamp();

-- 17. Trigger to update map_highlights updated_at
CREATE OR REPLACE FUNCTION update_map_highlights_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER map_highlights_timestamp
  BEFORE UPDATE ON map_highlights
  FOR EACH ROW
  EXECUTE FUNCTION update_map_highlights_timestamp();