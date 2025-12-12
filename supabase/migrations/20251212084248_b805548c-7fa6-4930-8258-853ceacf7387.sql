-- Create media_import_jobs table for tracking import batches
CREATE TABLE public.media_import_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'pending', -- pending, uploading, processing, validating, ready, committed, rolled_back, failed
  total_files integer DEFAULT 0,
  processed_files integer DEFAULT 0,
  success_count integer DEFAULT 0,
  warning_count integer DEFAULT 0,
  error_count integer DEFAULT 0,
  csv_mapping jsonb NULL,
  settings jsonb DEFAULT '{}'::jsonb,
  started_at timestamptz NULL,
  completed_at timestamptz NULL,
  committed_at timestamptz NULL,
  committed_by uuid NULL,
  rolled_back_at timestamptz NULL,
  rolled_back_by uuid NULL,
  created_by uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create media_assets table for storing all media files
CREATE TABLE public.media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NULL REFERENCES public.media_import_jobs(id) ON DELETE SET NULL,
  filename text NOT NULL,
  original_filename text NOT NULL,
  storage_path text NOT NULL,
  thumbnail_path text NULL,
  optimized_paths jsonb DEFAULT '{}'::jsonb, -- {"web": "...", "tablet": "...", "mobile": "...", "thumb": "..."}
  entity_type text NULL, -- village, district, provider, listing, event, product, gallery, unlinked
  entity_id uuid NULL,
  title text NULL,
  caption text NULL,
  credit text NULL,
  alt_text text NULL,
  tags text[] DEFAULT '{}'::text[],
  width integer NULL,
  height integer NULL,
  size_bytes integer NULL,
  mime_type text NULL,
  exif jsonb NULL,
  geolat numeric NULL,
  geolng numeric NULL,
  is_published boolean DEFAULT false,
  publish_status text DEFAULT 'draft', -- draft, published, rejected
  fingerprint text NULL, -- SHA256 hash
  phash text NULL, -- Perceptual hash for duplicate detection
  validation_status text DEFAULT 'pending', -- pending, valid, warning, error
  validation_errors jsonb DEFAULT '[]'::jsonb,
  created_by uuid NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create media_import_errors table for detailed error tracking
CREATE TABLE public.media_import_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.media_import_jobs(id) ON DELETE CASCADE,
  asset_id uuid NULL REFERENCES public.media_assets(id) ON DELETE SET NULL,
  filename text NOT NULL,
  error_type text NOT NULL, -- validation, processing, storage, mapping
  error_code text NULL,
  error_message text NOT NULL,
  error_details jsonb NULL,
  is_recoverable boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create media_import_audit table for tracking all import actions
CREATE TABLE public.media_import_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.media_import_jobs(id) ON DELETE CASCADE,
  action text NOT NULL, -- started, uploaded, processed, validated, committed, rolled_back, file_added, file_removed, metadata_updated
  actor_id uuid NOT NULL,
  actor_email text NULL,
  details jsonb NULL,
  ip_address inet NULL,
  user_agent text NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_media_assets_job_id ON public.media_assets(job_id);
CREATE INDEX idx_media_assets_entity ON public.media_assets(entity_type, entity_id);
CREATE INDEX idx_media_assets_fingerprint ON public.media_assets(fingerprint);
CREATE INDEX idx_media_assets_phash ON public.media_assets(phash);
CREATE INDEX idx_media_assets_publish_status ON public.media_assets(publish_status);
CREATE INDEX idx_media_assets_created_at ON public.media_assets(created_at DESC);
CREATE INDEX idx_media_import_jobs_status ON public.media_import_jobs(status);
CREATE INDEX idx_media_import_jobs_created_by ON public.media_import_jobs(created_by);
CREATE INDEX idx_media_import_errors_job_id ON public.media_import_errors(job_id);
CREATE INDEX idx_media_import_audit_job_id ON public.media_import_audit(job_id);

-- Enable RLS on all tables
ALTER TABLE public.media_import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_import_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_import_audit ENABLE ROW LEVEL SECURITY;

-- RLS Policies for media_import_jobs
CREATE POLICY "Admin and Super Admin can manage import jobs"
ON public.media_import_jobs FOR ALL
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Content Manager can view and create import jobs"
ON public.media_import_jobs FOR SELECT
USING (
  has_role(auth.uid(), 'content_manager'::app_role)
);

CREATE POLICY "Content Manager can insert import jobs"
ON public.media_import_jobs FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'content_manager'::app_role)
);

-- RLS Policies for media_assets
CREATE POLICY "Admin and Super Admin can manage media assets"
ON public.media_assets FOR ALL
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Content Manager can view and upload media assets"
ON public.media_assets FOR SELECT
USING (
  has_role(auth.uid(), 'content_manager'::app_role)
);

CREATE POLICY "Content Manager can insert media assets"
ON public.media_assets FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'content_manager'::app_role)
);

CREATE POLICY "Content Manager can update own unpublished assets"
ON public.media_assets FOR UPDATE
USING (
  has_role(auth.uid(), 'content_manager'::app_role) AND 
  created_by = auth.uid() AND 
  is_published = false
);

CREATE POLICY "Public can view published media assets"
ON public.media_assets FOR SELECT
USING (is_published = true AND publish_status = 'published');

-- RLS Policies for media_import_errors
CREATE POLICY "Admin and Super Admin can manage import errors"
ON public.media_import_errors FOR ALL
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'content_manager'::app_role)
);

-- RLS Policies for media_import_audit
CREATE POLICY "Admin and Super Admin can view audit logs"
ON public.media_import_audit FOR SELECT
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "System can insert audit logs"
ON public.media_import_audit FOR INSERT
WITH CHECK (true);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_media_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_media_import_jobs_updated_at
  BEFORE UPDATE ON public.media_import_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_media_updated_at();

CREATE TRIGGER update_media_assets_updated_at
  BEFORE UPDATE ON public.media_assets
  FOR EACH ROW EXECUTE FUNCTION public.update_media_updated_at();

-- Create storage bucket for media imports if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media-imports', 
  'media-imports', 
  false, 
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for optimized media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media', 
  'media', 
  true, 
  52428800,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for media-imports bucket (private, admin only)
CREATE POLICY "Admin can upload to media-imports"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'media-imports' AND
  (has_role(auth.uid(), 'super_admin'::app_role) OR 
   has_role(auth.uid(), 'admin'::app_role) OR
   has_role(auth.uid(), 'content_manager'::app_role))
);

CREATE POLICY "Admin can view media-imports"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'media-imports' AND
  (has_role(auth.uid(), 'super_admin'::app_role) OR 
   has_role(auth.uid(), 'admin'::app_role) OR
   has_role(auth.uid(), 'content_manager'::app_role))
);

CREATE POLICY "Admin can delete from media-imports"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'media-imports' AND
  (has_role(auth.uid(), 'super_admin'::app_role) OR 
   has_role(auth.uid(), 'admin'::app_role))
);

-- Storage policies for public media bucket
CREATE POLICY "Anyone can view public media"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

CREATE POLICY "Admin can upload to media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'media' AND
  (has_role(auth.uid(), 'super_admin'::app_role) OR 
   has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Admin can update media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'media' AND
  (has_role(auth.uid(), 'super_admin'::app_role) OR 
   has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Admin can delete from media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'media' AND
  (has_role(auth.uid(), 'super_admin'::app_role) OR 
   has_role(auth.uid(), 'admin'::app_role))
);