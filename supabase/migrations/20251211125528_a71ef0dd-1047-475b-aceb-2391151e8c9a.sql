-- Add village linking fields to existing tables
ALTER TABLE tourism_providers ADD COLUMN IF NOT EXISTS village_id uuid REFERENCES villages(id) ON DELETE SET NULL;
ALTER TABLE tourism_providers ADD COLUMN IF NOT EXISTS is_local boolean DEFAULT false;

ALTER TABLE tourism_listings ADD COLUMN IF NOT EXISTS village_id uuid REFERENCES villages(id) ON DELETE SET NULL;

ALTER TABLE local_products ADD COLUMN IF NOT EXISTS village_id uuid REFERENCES villages(id) ON DELETE SET NULL;

ALTER TABLE travel_packages ADD COLUMN IF NOT EXISTS stops jsonb DEFAULT '[]'::jsonb;
ALTER TABLE travel_packages ADD COLUMN IF NOT EXISTS village_ids uuid[] DEFAULT '{}';

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_tourism_providers_village ON tourism_providers(village_id);
CREATE INDEX IF NOT EXISTS idx_tourism_listings_village ON tourism_listings(village_id);
CREATE INDEX IF NOT EXISTS idx_local_products_village ON local_products(village_id);
CREATE INDEX IF NOT EXISTS idx_travel_packages_village_ids ON travel_packages USING GIN(village_ids);

-- Create canonical village_links table
CREATE TABLE IF NOT EXISTS village_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  village_id uuid NOT NULL REFERENCES villages(id) ON DELETE CASCADE,
  item_type text NOT NULL CHECK (item_type IN ('provider','listing','package','product')),
  item_id uuid NOT NULL,
  promote boolean DEFAULT false,
  priority integer DEFAULT 0,
  status text NOT NULL DEFAULT 'linked' CHECK (status IN ('linked', 'pending', 'archived')),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (village_id, item_type, item_id)
);

CREATE INDEX IF NOT EXISTS idx_village_links_village ON village_links(village_id);
CREATE INDEX IF NOT EXISTS idx_village_links_item ON village_links(item_type, item_id);
CREATE INDEX IF NOT EXISTS idx_village_links_status ON village_links(status);

-- Create audit log table
CREATE TABLE IF NOT EXISTS village_link_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  village_id uuid NOT NULL REFERENCES villages(id) ON DELETE CASCADE,
  item_type text NOT NULL,
  item_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('link', 'unlink', 'update', 'rollback')),
  before_state jsonb,
  after_state jsonb,
  changed_by uuid REFERENCES auth.users(id),
  reason text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_village_link_audit_village ON village_link_audit(village_id);
CREATE INDEX IF NOT EXISTS idx_village_link_audit_created ON village_link_audit(created_at DESC);

-- Create auto-link suggestions table
CREATE TABLE IF NOT EXISTS village_link_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  village_id uuid NOT NULL REFERENCES villages(id) ON DELETE CASCADE,
  item_type text NOT NULL,
  item_id uuid NOT NULL,
  match_method text NOT NULL CHECK (match_method IN ('geo', 'fuzzy', 'ai', 'manual')),
  confidence numeric DEFAULT 0,
  job_id uuid,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now(),
  UNIQUE (village_id, item_type, item_id)
);

-- Create auto-link jobs table
CREATE TABLE IF NOT EXISTS village_link_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  village_id uuid NOT NULL REFERENCES villages(id) ON DELETE CASCADE,
  mode text NOT NULL CHECK (mode IN ('geo', 'fuzzy', 'ai')),
  radius_meters integer DEFAULT 3000,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  suggestion_count integer DEFAULT 0,
  error_message text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Enable RLS on new tables
ALTER TABLE village_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE village_link_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE village_link_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE village_link_jobs ENABLE ROW LEVEL SECURITY;

-- Public can view linked items
CREATE POLICY "Anyone can view linked items" ON village_links
  FOR SELECT USING (status = 'linked');

-- Admin can manage village links
CREATE POLICY "Admins can manage village links" ON village_links
  FOR ALL USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'content_manager'::app_role)
  );

-- Only super_admin can view audit logs
CREATE POLICY "Super admin can view audit logs" ON village_link_audit
  FOR SELECT USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can insert audit logs" ON village_link_audit
  FOR INSERT WITH CHECK (
    has_role(auth.uid(), 'super_admin'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

-- Admin can manage suggestions
CREATE POLICY "Admins can manage suggestions" ON village_link_suggestions
  FOR ALL USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'content_manager'::app_role)
  );

-- Admin can manage jobs
CREATE POLICY "Admins can manage jobs" ON village_link_jobs
  FOR ALL USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'content_manager'::app_role)
  );

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_village_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER village_links_updated_at
  BEFORE UPDATE ON village_links
  FOR EACH ROW
  EXECUTE FUNCTION update_village_links_updated_at();