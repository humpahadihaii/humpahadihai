-- Add RLS policies for featured_highlights table
-- This table controls what content is featured on the homepage

-- Allow admin roles to manage featured highlights
CREATE POLICY "Admin roles can manage featured highlights" 
ON featured_highlights 
FOR ALL 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'content_manager'::app_role) OR
  has_role(auth.uid(), 'content_editor'::app_role)
);

-- Allow anyone to view published featured highlights
CREATE POLICY "Anyone can view featured highlights" 
ON featured_highlights 
FOR SELECT 
USING (status = 'published');

COMMENT ON TABLE featured_highlights IS 'Homepage featured content slots. Managed by admin roles.';