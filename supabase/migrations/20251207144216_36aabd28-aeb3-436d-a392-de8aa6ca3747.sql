-- =============================================
-- STEP 2: Create CMS tables and seed data
-- =============================================

-- 1. Create cms_site_settings table (single row for global settings)
CREATE TABLE IF NOT EXISTS public.cms_site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name text NOT NULL DEFAULT 'Hum Pahadi Haii',
  tagline text NOT NULL DEFAULT 'Celebrating Uttarakhand''s Culture, Tradition & Heritage',
  primary_cta_text text NOT NULL DEFAULT 'Explore Culture',
  primary_cta_url text NOT NULL DEFAULT '/culture',
  secondary_cta_text text NOT NULL DEFAULT 'View Gallery',
  secondary_cta_url text NOT NULL DEFAULT '/gallery',
  hero_background_image text,
  logo_image text,
  meta_title text NOT NULL DEFAULT 'Hum Pahadi Haii - Celebrating Uttarakhand''s Culture, Tradition & Heritage',
  meta_description text NOT NULL DEFAULT 'Discover Uttarakhand''s rich culture, traditional food, festivals, handicrafts, and natural beauty. Explore Pahadi traditions from Garhwal and Kumaon regions.',
  instagram_url text DEFAULT 'https://www.instagram.com/hum_pahadi_haii',
  youtube_url text DEFAULT 'https://www.youtube.com/channel/UCXAv369YY6a7UYdbgqkhPvw',
  facebook_url text DEFAULT 'https://www.facebook.com/humpahadihaii',
  twitter_url text DEFAULT 'https://x.com/HumPahadiHaii',
  email_contact text DEFAULT 'contact@humpahadihaii.in',
  email_support text DEFAULT 'support@humpahadihaii.in',
  email_info text DEFAULT 'info@humpahadihaii.in',
  email_promotions text DEFAULT 'promotions@humpahadihaii.in',
  email_collabs text DEFAULT 'collabs@humpahadihaii.in',
  email_copyright text DEFAULT 'copyright@humpahadihaii.in',
  email_team text DEFAULT 'team@humpahadihaii.in',
  email_admin text DEFAULT 'admin@humpahadihaii.in',
  email_post text DEFAULT 'post@humpahadihaii.in',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Create cms_content_sections table
CREATE TABLE IF NOT EXISTS public.cms_content_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  subtitle text,
  body text,
  section_image text,
  display_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Create cms_stories table (blog/articles)
CREATE TABLE IF NOT EXISTS public.cms_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  cover_image_url text,
  excerpt text,
  body text,
  category text NOT NULL DEFAULT 'Culture',
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name text,
  published_at timestamptz,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Create cms_events table
CREATE TABLE IF NOT EXISTS public.cms_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  banner_image_url text,
  location text,
  event_date timestamptz,
  description text,
  is_featured boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Create cms_pages table (static pages)
CREATE TABLE IF NOT EXISTS public.cms_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  body text,
  meta_title text,
  meta_description text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 6. Create cms_footer_links table
CREATE TABLE IF NOT EXISTS public.cms_footer_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  page_slug text,
  url text,
  display_order integer NOT NULL DEFAULT 0,
  is_external boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 7. Create contact_messages table
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 8. Enable RLS on all new tables
ALTER TABLE public.cms_site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_content_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_footer_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- 9. RLS Policies for cms_site_settings
CREATE POLICY "Anyone can view site settings"
  ON public.cms_site_settings FOR SELECT
  USING (true);

CREATE POLICY "Super Admin and Admin can manage site settings"
  ON public.cms_site_settings FOR ALL
  USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Content Manager can update site settings"
  ON public.cms_site_settings FOR UPDATE
  USING (has_role(auth.uid(), 'content_manager'));

CREATE POLICY "SEO Manager can update SEO fields"
  ON public.cms_site_settings FOR UPDATE
  USING (has_role(auth.uid(), 'seo_manager'));

-- 10. RLS Policies for cms_content_sections
CREATE POLICY "Anyone can view published content sections"
  ON public.cms_content_sections FOR SELECT
  USING (is_published = true);

CREATE POLICY "Staff can view all content sections"
  ON public.cms_content_sections FOR SELECT
  USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'content_manager') OR has_role(auth.uid(), 'editor') OR has_role(auth.uid(), 'moderator') OR has_role(auth.uid(), 'reviewer') OR has_role(auth.uid(), 'viewer'));

CREATE POLICY "Full CRUD for super_admin, admin, content_manager on content sections"
  ON public.cms_content_sections FOR ALL
  USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'content_manager'));

CREATE POLICY "Editor can create content sections"
  ON public.cms_content_sections FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'editor'));

CREATE POLICY "Editor can update content sections"
  ON public.cms_content_sections FOR UPDATE
  USING (has_role(auth.uid(), 'editor'));

-- 11. RLS Policies for cms_stories
CREATE POLICY "Anyone can view published stories"
  ON public.cms_stories FOR SELECT
  USING (status = 'published');

CREATE POLICY "Staff can view all stories"
  ON public.cms_stories FOR SELECT
  USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'content_manager') OR has_role(auth.uid(), 'editor') OR has_role(auth.uid(), 'moderator') OR has_role(auth.uid(), 'reviewer') OR has_role(auth.uid(), 'viewer'));

CREATE POLICY "Author can view own stories"
  ON public.cms_stories FOR SELECT
  USING (author_id = auth.uid() AND has_role(auth.uid(), 'author'));

CREATE POLICY "Full CRUD for super_admin, admin, content_manager on stories"
  ON public.cms_stories FOR ALL
  USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'content_manager'));

CREATE POLICY "Editor can create stories"
  ON public.cms_stories FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'editor'));

CREATE POLICY "Editor can update stories"
  ON public.cms_stories FOR UPDATE
  USING (has_role(auth.uid(), 'editor'));

CREATE POLICY "Author can create own stories"
  ON public.cms_stories FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'author') AND author_id = auth.uid());

CREATE POLICY "Author can update own draft stories"
  ON public.cms_stories FOR UPDATE
  USING (has_role(auth.uid(), 'author') AND author_id = auth.uid() AND status = 'draft');

CREATE POLICY "Moderator and Reviewer can update story status"
  ON public.cms_stories FOR UPDATE
  USING (has_role(auth.uid(), 'moderator') OR has_role(auth.uid(), 'reviewer'));

-- 12. RLS Policies for cms_events
CREATE POLICY "Anyone can view published events"
  ON public.cms_events FOR SELECT
  USING (status = 'published');

CREATE POLICY "Staff can view all events"
  ON public.cms_events FOR SELECT
  USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'content_manager') OR has_role(auth.uid(), 'editor') OR has_role(auth.uid(), 'moderator') OR has_role(auth.uid(), 'reviewer') OR has_role(auth.uid(), 'viewer'));

CREATE POLICY "Full CRUD for super_admin, admin, content_manager on events"
  ON public.cms_events FOR ALL
  USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'content_manager'));

CREATE POLICY "Editor can create events"
  ON public.cms_events FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'editor'));

CREATE POLICY "Editor can update events"
  ON public.cms_events FOR UPDATE
  USING (has_role(auth.uid(), 'editor'));

-- 13. RLS Policies for cms_pages
CREATE POLICY "Anyone can view published pages"
  ON public.cms_pages FOR SELECT
  USING (status = 'published');

CREATE POLICY "Staff can view all pages"
  ON public.cms_pages FOR SELECT
  USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'content_manager') OR has_role(auth.uid(), 'editor') OR has_role(auth.uid(), 'moderator') OR has_role(auth.uid(), 'reviewer') OR has_role(auth.uid(), 'viewer'));

CREATE POLICY "Full CRUD for super_admin, admin, content_manager on pages"
  ON public.cms_pages FOR ALL
  USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'content_manager'));

CREATE POLICY "Editor can create pages"
  ON public.cms_pages FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'editor'));

CREATE POLICY "Editor can update pages"
  ON public.cms_pages FOR UPDATE
  USING (has_role(auth.uid(), 'editor'));

CREATE POLICY "SEO Manager can update page SEO fields"
  ON public.cms_pages FOR UPDATE
  USING (has_role(auth.uid(), 'seo_manager'));

-- 14. RLS Policies for cms_footer_links
CREATE POLICY "Anyone can view footer links"
  ON public.cms_footer_links FOR SELECT
  USING (true);

CREATE POLICY "Full CRUD for super_admin, admin, content_manager on footer links"
  ON public.cms_footer_links FOR ALL
  USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'content_manager'));

CREATE POLICY "Editor can update footer links"
  ON public.cms_footer_links FOR UPDATE
  USING (has_role(auth.uid(), 'editor'));

-- 15. RLS Policies for contact_messages
CREATE POLICY "Anyone can create contact messages"
  ON public.contact_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Support staff can view contact messages"
  ON public.contact_messages FOR SELECT
  USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'content_manager') OR has_role(auth.uid(), 'support_agent'));

CREATE POLICY "Support staff can update contact messages"
  ON public.contact_messages FOR UPDATE
  USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'support_agent'));

-- 16. Update gallery_items with additional fields
ALTER TABLE public.gallery_items 
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS taken_at date,
  ADD COLUMN IF NOT EXISTS tags text[],
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

-- 17. Update RLS policies for gallery_items to include new roles
DROP POLICY IF EXISTS "Admin roles can manage gallery" ON public.gallery_items;

CREATE POLICY "Full CRUD for admin roles and media manager on gallery"
  ON public.gallery_items FOR ALL
  USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'content_manager') OR has_role(auth.uid(), 'media_manager'));

CREATE POLICY "Editor can create gallery items"
  ON public.gallery_items FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'editor'));

CREATE POLICY "Editor can update gallery items"
  ON public.gallery_items FOR UPDATE
  USING (has_role(auth.uid(), 'editor'));

CREATE POLICY "Moderator can update gallery item status"
  ON public.gallery_items FOR UPDATE
  USING (has_role(auth.uid(), 'moderator'));

-- 18. Add updated_at triggers
CREATE TRIGGER update_cms_site_settings_updated_at
  BEFORE UPDATE ON public.cms_site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cms_content_sections_updated_at
  BEFORE UPDATE ON public.cms_content_sections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cms_stories_updated_at
  BEFORE UPDATE ON public.cms_stories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cms_events_updated_at
  BEFORE UPDATE ON public.cms_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cms_pages_updated_at
  BEFORE UPDATE ON public.cms_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cms_footer_links_updated_at
  BEFORE UPDATE ON public.cms_footer_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contact_messages_updated_at
  BEFORE UPDATE ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();