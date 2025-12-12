
-- Add SEO fields to content tables
ALTER TABLE villages ADD COLUMN IF NOT EXISTS seo_title text;
ALTER TABLE villages ADD COLUMN IF NOT EXISTS seo_description text;
ALTER TABLE villages ADD COLUMN IF NOT EXISTS seo_image_url text;
ALTER TABLE villages ADD COLUMN IF NOT EXISTS seo_schema jsonb;
ALTER TABLE villages ADD COLUMN IF NOT EXISTS share_templates jsonb;

ALTER TABLE districts ADD COLUMN IF NOT EXISTS seo_title text;
ALTER TABLE districts ADD COLUMN IF NOT EXISTS seo_description text;
ALTER TABLE districts ADD COLUMN IF NOT EXISTS seo_image_url text;
ALTER TABLE districts ADD COLUMN IF NOT EXISTS seo_schema jsonb;
ALTER TABLE districts ADD COLUMN IF NOT EXISTS share_templates jsonb;

ALTER TABLE tourism_providers ADD COLUMN IF NOT EXISTS seo_title text;
ALTER TABLE tourism_providers ADD COLUMN IF NOT EXISTS seo_description text;
ALTER TABLE tourism_providers ADD COLUMN IF NOT EXISTS seo_image_url text;
ALTER TABLE tourism_providers ADD COLUMN IF NOT EXISTS seo_schema jsonb;
ALTER TABLE tourism_providers ADD COLUMN IF NOT EXISTS share_templates jsonb;

ALTER TABLE tourism_listings ADD COLUMN IF NOT EXISTS seo_title text;
ALTER TABLE tourism_listings ADD COLUMN IF NOT EXISTS seo_description text;
ALTER TABLE tourism_listings ADD COLUMN IF NOT EXISTS seo_image_url text;
ALTER TABLE tourism_listings ADD COLUMN IF NOT EXISTS seo_schema jsonb;
ALTER TABLE tourism_listings ADD COLUMN IF NOT EXISTS share_templates jsonb;

ALTER TABLE travel_packages ADD COLUMN IF NOT EXISTS seo_title text;
ALTER TABLE travel_packages ADD COLUMN IF NOT EXISTS seo_description text;
ALTER TABLE travel_packages ADD COLUMN IF NOT EXISTS seo_image_url text;
ALTER TABLE travel_packages ADD COLUMN IF NOT EXISTS seo_schema jsonb;
ALTER TABLE travel_packages ADD COLUMN IF NOT EXISTS share_templates jsonb;

ALTER TABLE local_products ADD COLUMN IF NOT EXISTS seo_title text;
ALTER TABLE local_products ADD COLUMN IF NOT EXISTS seo_description text;
ALTER TABLE local_products ADD COLUMN IF NOT EXISTS seo_image_url text;
ALTER TABLE local_products ADD COLUMN IF NOT EXISTS seo_schema jsonb;
ALTER TABLE local_products ADD COLUMN IF NOT EXISTS share_templates jsonb;

ALTER TABLE cms_stories ADD COLUMN IF NOT EXISTS seo_title text;
ALTER TABLE cms_stories ADD COLUMN IF NOT EXISTS seo_description text;
ALTER TABLE cms_stories ADD COLUMN IF NOT EXISTS seo_image_url text;
ALTER TABLE cms_stories ADD COLUMN IF NOT EXISTS seo_schema jsonb;
ALTER TABLE cms_stories ADD COLUMN IF NOT EXISTS share_templates jsonb;

ALTER TABLE cms_events ADD COLUMN IF NOT EXISTS seo_title text;
ALTER TABLE cms_events ADD COLUMN IF NOT EXISTS seo_description text;
ALTER TABLE cms_events ADD COLUMN IF NOT EXISTS seo_image_url text;
ALTER TABLE cms_events ADD COLUMN IF NOT EXISTS seo_schema jsonb;
ALTER TABLE cms_events ADD COLUMN IF NOT EXISTS share_templates jsonb;

ALTER TABLE cms_pages ADD COLUMN IF NOT EXISTS seo_title text;
ALTER TABLE cms_pages ADD COLUMN IF NOT EXISTS seo_description text;
ALTER TABLE cms_pages ADD COLUMN IF NOT EXISTS seo_image_url text;
ALTER TABLE cms_pages ADD COLUMN IF NOT EXISTS seo_schema jsonb;
ALTER TABLE cms_pages ADD COLUMN IF NOT EXISTS share_templates jsonb;

ALTER TABLE thoughts ADD COLUMN IF NOT EXISTS seo_title text;
ALTER TABLE thoughts ADD COLUMN IF NOT EXISTS seo_description text;
ALTER TABLE thoughts ADD COLUMN IF NOT EXISTS seo_image_url text;
ALTER TABLE thoughts ADD COLUMN IF NOT EXISTS seo_schema jsonb;
ALTER TABLE thoughts ADD COLUMN IF NOT EXISTS share_templates jsonb;

-- Create site_share_settings table for global defaults and platform templates
CREATE TABLE IF NOT EXISTS site_share_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Create share_template_audit table for tracking changes
CREATE TABLE IF NOT EXISTS share_template_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  changed_by uuid REFERENCES auth.users(id),
  entity_type text NOT NULL,
  entity_id uuid,
  change_type text NOT NULL, -- 'create', 'update', 'delete'
  before_value jsonb,
  after_value jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create share_events table for analytics
CREATE TABLE IF NOT EXISTS share_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid,
  platform text NOT NULL,
  url text NOT NULL,
  referrer text,
  user_agent text,
  ip_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE site_share_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_template_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for site_share_settings
CREATE POLICY "Anyone can read site_share_settings" ON site_share_settings
  FOR SELECT USING (true);

CREATE POLICY "Super admin can manage site_share_settings" ON site_share_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- RLS policies for share_template_audit
CREATE POLICY "Admins can read share_template_audit" ON share_template_audit
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
  );

CREATE POLICY "System can insert share_template_audit" ON share_template_audit
  FOR INSERT WITH CHECK (true);

-- RLS policies for share_events
CREATE POLICY "Anyone can insert share_events" ON share_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can read share_events" ON share_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'analytics_viewer'))
  );

-- Insert default settings
INSERT INTO site_share_settings (key, value) VALUES
  ('defaults', '{
    "title_suffix": " | Hum Pahadi Haii",
    "default_description": "Discover the cultural heritage, traditions, and natural beauty of Uttarakhand with Hum Pahadi Haii.",
    "default_image_url": null,
    "site_name": "Hum Pahadi Haii",
    "twitter_site": "@humpahadihaii",
    "locale": "en_IN"
  }'::jsonb),
  ('templates', '{
    "facebook": {
      "enabled": true,
      "title_template": "{{page.title}}{{site.suffix}}",
      "description_template": "{{page.excerpt}}",
      "image_url": null
    },
    "twitter": {
      "enabled": true,
      "card_type": "summary_large_image",
      "title_template": "{{page.title}}{{site.suffix}}",
      "description_template": "{{page.excerpt}}",
      "image_url": null
    },
    "whatsapp": {
      "enabled": true,
      "title_template": "{{page.title}}",
      "description_template": "{{page.excerpt}} - Check it out on Hum Pahadi Haii!",
      "image_url": null
    },
    "linkedin": {
      "enabled": true,
      "title_template": "{{page.title}}{{site.suffix}}",
      "description_template": "{{page.excerpt}}",
      "image_url": null
    },
    "instagram": {
      "enabled": true,
      "title_template": "{{page.title}}",
      "description_template": "{{page.excerpt}}",
      "hashtags": ["HumPahadiHaii", "Uttarakhand", "Pahadi"]
    },
    "email": {
      "enabled": true,
      "subject_template": "Check out: {{page.title}}",
      "body_template": "I thought you might find this interesting:\\n\\n{{page.title}}\\n{{page.excerpt}}\\n\\n{{page.url}}"
    }
  }'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_share_template_audit_entity ON share_template_audit(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_share_events_entity ON share_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_share_events_platform ON share_events(platform);
CREATE INDEX IF NOT EXISTS idx_share_events_created_at ON share_events(created_at);
