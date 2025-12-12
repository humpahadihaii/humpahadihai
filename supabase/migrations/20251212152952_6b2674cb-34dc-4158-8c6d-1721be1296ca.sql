-- Site-wide share preview defaults
CREATE TABLE IF NOT EXISTS public.site_share_preview (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton_flag boolean UNIQUE DEFAULT true CHECK (singleton_flag = true),
  default_title text NOT NULL DEFAULT 'Hum Pahadi Haii - Celebrating Uttarakhand''s Culture',
  default_description text NOT NULL DEFAULT 'Discover Uttarakhand''s rich culture, traditional food, festivals, handicrafts, and natural beauty.',
  default_image_url text,
  og_type text DEFAULT 'website',
  twitter_card text DEFAULT 'summary_large_image',
  twitter_site text DEFAULT '@humpahadihaii',
  templates jsonb DEFAULT '{"whatsapp": "Check out {entity_title} on Hum Pahadi Haii! {short_url}", "email_subject": "{entity_title} - Hum Pahadi Haii", "email_body": "I thought you might like this: {entity_title}\n\n{entity_description}\n\nView here: {short_url}", "twitter": "{entity_title} - {short_url}", "facebook": "{entity_title}", "linkedin": "{entity_title} on Hum Pahadi Haii"}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.site_share_preview ENABLE ROW LEVEL SECURITY;

-- RLS policies for site_share_preview
CREATE POLICY "Anyone can view site share preview" ON public.site_share_preview
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage site share preview" ON public.site_share_preview
  FOR ALL USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

-- Insert default row
INSERT INTO public.site_share_preview (singleton_flag) VALUES (true) ON CONFLICT DO NOTHING;

-- Per-entity share preview overrides
CREATE TABLE IF NOT EXISTS public.entity_share_preview (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  title text,
  description text,
  image_url text,
  og_type text,
  twitter_card text,
  templates jsonb,
  locale text DEFAULT 'en',
  use_default boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id),
  UNIQUE(entity_type, entity_id)
);

-- Enable RLS
ALTER TABLE public.entity_share_preview ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_entity_share_preview_lookup ON public.entity_share_preview(entity_type, entity_id);

-- RLS policies for entity_share_preview
CREATE POLICY "Anyone can view entity share preview" ON public.entity_share_preview
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage entity share preview" ON public.entity_share_preview
  FOR ALL USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'content_manager'::app_role)
  );

-- Share preview audit log
CREATE TABLE IF NOT EXISTS public.share_preview_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id),
  entity_type text NOT NULL,
  entity_id uuid,
  action text NOT NULL,
  before_value jsonb,
  after_value jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.share_preview_audit ENABLE ROW LEVEL SECURITY;

-- Index
CREATE INDEX idx_share_preview_audit_entity ON public.share_preview_audit(entity_type, entity_id);

-- RLS policies for audit
CREATE POLICY "Admins can view share preview audit" ON public.share_preview_audit
  FOR SELECT USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "System can insert audit records" ON public.share_preview_audit
  FOR INSERT WITH CHECK (true);

-- Short links table
CREATE TABLE IF NOT EXISTS public.short_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hash text UNIQUE NOT NULL,
  target_url text NOT NULL,
  entity_type text,
  entity_id uuid,
  ref text,
  click_count integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.short_links ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_short_links_hash ON public.short_links(hash);
CREATE INDEX idx_short_links_entity ON public.short_links(entity_type, entity_id);

-- RLS policies for short_links
CREATE POLICY "Anyone can view short links" ON public.short_links
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create short links" ON public.short_links
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update click count" ON public.short_links
  FOR UPDATE USING (true);

-- Share click tracking table
CREATE TABLE IF NOT EXISTS public.share_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid,
  channel text NOT NULL,
  short_link_id uuid REFERENCES public.short_links(id),
  ip_hash text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.share_clicks ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_share_clicks_entity ON public.share_clicks(entity_type, entity_id);
CREATE INDEX idx_share_clicks_channel ON public.share_clicks(channel);
CREATE INDEX idx_share_clicks_date ON public.share_clicks(created_at);

-- RLS policies for share_clicks
CREATE POLICY "Admins can view share clicks" ON public.share_clicks
  FOR SELECT USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'analytics_viewer'::app_role)
  );

CREATE POLICY "Anyone can insert share clicks" ON public.share_clicks
  FOR INSERT WITH CHECK (true);