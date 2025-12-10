-- Fix RLS policies for public content tables
-- The issue is that policies are RESTRICTIVE instead of PERMISSIVE
-- Anonymous users need PERMISSIVE policies to read public content

-- TOURISM_LISTINGS: Drop restrictive policy, create permissive
DROP POLICY IF EXISTS "Anyone can view active tourism listings" ON tourism_listings;
CREATE POLICY "Anyone can view active tourism listings" 
  ON tourism_listings 
  FOR SELECT 
  TO anon, authenticated
  USING (is_active = true);

-- TOURISM_PROVIDERS: Drop restrictive policy, create permissive
DROP POLICY IF EXISTS "Anyone can view active tourism providers" ON tourism_providers;
CREATE POLICY "Anyone can view active tourism providers" 
  ON tourism_providers 
  FOR SELECT 
  TO anon, authenticated
  USING (is_active = true);

-- TRAVEL_PACKAGES: Drop restrictive policy, create permissive
DROP POLICY IF EXISTS "Anyone can view active travel packages" ON travel_packages;
CREATE POLICY "Anyone can view active travel packages" 
  ON travel_packages 
  FOR SELECT 
  TO anon, authenticated
  USING (is_active = true);

-- LOCAL_PRODUCTS: Drop restrictive policy, create permissive
DROP POLICY IF EXISTS "Anyone can view active products" ON local_products;
CREATE POLICY "Anyone can view active products" 
  ON local_products 
  FOR SELECT 
  TO anon, authenticated
  USING (is_active = true);

-- LOCAL_PRODUCT_CATEGORIES: Drop restrictive policy, create permissive
DROP POLICY IF EXISTS "Anyone can view active product categories" ON local_product_categories;
CREATE POLICY "Anyone can view active product categories" 
  ON local_product_categories 
  FOR SELECT 
  TO anon, authenticated
  USING (is_active = true);

-- PROMOTION_PACKAGES: Drop restrictive policy, create permissive
DROP POLICY IF EXISTS "Anyone can view active promotion packages" ON promotion_packages;
CREATE POLICY "Anyone can view active promotion packages" 
  ON promotion_packages 
  FOR SELECT 
  TO anon, authenticated
  USING (is_active = true);

-- DISTRICTS: Ensure public read access
DROP POLICY IF EXISTS "Anyone can view districts" ON districts;
CREATE POLICY "Anyone can view districts" 
  ON districts 
  FOR SELECT 
  TO anon, authenticated
  USING (true);

-- VILLAGES: Ensure public read access
DROP POLICY IF EXISTS "Anyone can view villages" ON villages;
CREATE POLICY "Anyone can view villages" 
  ON villages 
  FOR SELECT 
  TO anon, authenticated
  USING (true);

-- DISTRICT_PLACES: Drop restrictive policy, create permissive
DROP POLICY IF EXISTS "Anyone can view active district places" ON district_places;
CREATE POLICY "Anyone can view active district places" 
  ON district_places 
  FOR SELECT 
  TO anon, authenticated
  USING (is_active = true);

-- DISTRICT_FOODS: Drop restrictive policy, create permissive
DROP POLICY IF EXISTS "Anyone can view active district foods" ON district_foods;
CREATE POLICY "Anyone can view active district foods" 
  ON district_foods 
  FOR SELECT 
  TO anon, authenticated
  USING (is_active = true);

-- DISTRICT_FESTIVALS: Ensure public read access
DROP POLICY IF EXISTS "Anyone can view district festivals" ON district_festivals;
CREATE POLICY "Anyone can view district festivals" 
  ON district_festivals 
  FOR SELECT 
  TO anon, authenticated
  USING (is_active = true);

-- FEATURED_HIGHLIGHTS: Ensure public read access for published
DROP POLICY IF EXISTS "Anyone can view featured highlights" ON featured_highlights;
CREATE POLICY "Anyone can view featured highlights" 
  ON featured_highlights 
  FOR SELECT 
  TO anon, authenticated
  USING (status = 'published');

-- CMS_CONTENT_SECTIONS: Ensure public read access for published
DROP POLICY IF EXISTS "Anyone can view published sections" ON cms_content_sections;
CREATE POLICY "Anyone can view published sections" 
  ON cms_content_sections 
  FOR SELECT 
  TO anon, authenticated
  USING (is_published = true);

-- CMS_SITE_SETTINGS: Ensure public read access
DROP POLICY IF EXISTS "Anyone can view site settings" ON cms_site_settings;
CREATE POLICY "Anyone can view site settings" 
  ON cms_site_settings 
  FOR SELECT 
  TO anon, authenticated
  USING (true);

-- GALLERY_ITEMS: Ensure public read access
DROP POLICY IF EXISTS "Anyone can view gallery items" ON gallery_items;
CREATE POLICY "Anyone can view gallery items" 
  ON gallery_items 
  FOR SELECT 
  TO anon, authenticated
  USING (true);

-- CMS_STORIES: Ensure public read access for published
DROP POLICY IF EXISTS "Anyone can view published stories" ON cms_stories;
CREATE POLICY "Anyone can view published stories" 
  ON cms_stories 
  FOR SELECT 
  TO anon, authenticated
  USING (status = 'published');

-- CMS_EVENTS: Ensure public read access for published
DROP POLICY IF EXISTS "Anyone can view published events" ON cms_events;
CREATE POLICY "Anyone can view published events" 
  ON cms_events 
  FOR SELECT 
  TO anon, authenticated
  USING (status = 'published');

-- CMS_PAGES: Ensure public read access for published
DROP POLICY IF EXISTS "Anyone can view published pages" ON cms_pages;
CREATE POLICY "Anyone can view published pages" 
  ON cms_pages 
  FOR SELECT 
  TO anon, authenticated
  USING (status = 'published');

-- CMS_FOOTER_LINKS: Ensure public read access
DROP POLICY IF EXISTS "Anyone can view footer links" ON cms_footer_links;
CREATE POLICY "Anyone can view footer links" 
  ON cms_footer_links 
  FOR SELECT 
  TO anon, authenticated
  USING (true);

-- THOUGHTS: Ensure public read access for approved
DROP POLICY IF EXISTS "Anyone can view approved thoughts" ON thoughts;
CREATE POLICY "Anyone can view approved thoughts" 
  ON thoughts 
  FOR SELECT 
  TO anon, authenticated
  USING (status = 'approved');

-- CONTENT_ITEMS: Ensure public read access for published
DROP POLICY IF EXISTS "Anyone can view published content" ON content_items;
CREATE POLICY "Anyone can view published content" 
  ON content_items 
  FOR SELECT 
  TO anon, authenticated
  USING (status = 'published');

-- DISTRICT_CONTENT: Ensure public read access
DROP POLICY IF EXISTS "Anyone can view district content" ON district_content;
CREATE POLICY "Anyone can view district content" 
  ON district_content 
  FOR SELECT 
  TO anon, authenticated
  USING (true);

-- DISTRICT_HIGHLIGHTS: Ensure public read access
DROP POLICY IF EXISTS "Anyone can view district highlights" ON district_highlights;
CREATE POLICY "Anyone can view district highlights" 
  ON district_highlights 
  FOR SELECT 
  TO anon, authenticated
  USING (true);

-- DISTRICT_HOTELS: Ensure public read access
DROP POLICY IF EXISTS "Anyone can view district hotels" ON district_hotels;
CREATE POLICY "Anyone can view district hotels" 
  ON district_hotels 
  FOR SELECT 
  TO anon, authenticated
  USING (true);

-- FESTIVALS: Ensure public read access
DROP POLICY IF EXISTS "Anyone can view festivals" ON festivals;
CREATE POLICY "Anyone can view festivals" 
  ON festivals 
  FOR SELECT 
  TO anon, authenticated
  USING (true);

-- PAGE_SETTINGS: Ensure public read access
DROP POLICY IF EXISTS "Anyone can view page settings" ON page_settings;
CREATE POLICY "Anyone can view page settings" 
  ON page_settings 
  FOR SELECT 
  TO anon, authenticated
  USING (true);