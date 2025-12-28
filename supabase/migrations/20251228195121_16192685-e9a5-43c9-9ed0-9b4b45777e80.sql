-- Add resolved_path and hierarchy columns to media_usage
ALTER TABLE public.media_usage ADD COLUMN IF NOT EXISTS resolved_path text;
ALTER TABLE public.media_usage ADD COLUMN IF NOT EXISTS district_slug text;
ALTER TABLE public.media_usage ADD COLUMN IF NOT EXISTS category_slug text;
ALTER TABLE public.media_usage ADD COLUMN IF NOT EXISTS subcategory_slug text;
ALTER TABLE public.media_usage ADD COLUMN IF NOT EXISTS content_slug text;
ALTER TABLE public.media_usage ADD COLUMN IF NOT EXISTS content_title text;

-- Create index for faster path lookups
CREATE INDEX IF NOT EXISTS idx_media_usage_resolved_path ON public.media_usage(resolved_path);
CREATE INDEX IF NOT EXISTS idx_media_usage_media_id ON public.media_usage(media_id);