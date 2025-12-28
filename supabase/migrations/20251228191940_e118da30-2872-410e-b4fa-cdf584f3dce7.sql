-- Add missing columns to existing media_library table
ALTER TABLE public.media_library ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.media_library ADD COLUMN IF NOT EXISTS width INTEGER;
ALTER TABLE public.media_library ADD COLUMN IF NOT EXISTS height INTEGER;

-- Create media_folders table for folder organization
CREATE TABLE public.media_folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  is_system BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create media_folder_assignments for many-to-many relationship
CREATE TABLE public.media_folder_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  media_id UUID NOT NULL REFERENCES public.media_library(id) ON DELETE CASCADE,
  folder_id UUID NOT NULL REFERENCES public.media_folders(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(media_id, folder_id)
);

-- Create media_usage table to track where images are used
CREATE TABLE public.media_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  media_id UUID NOT NULL REFERENCES public.media_library(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,
  content_id UUID,
  page_slug TEXT,
  field_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(media_id, content_type, content_id, field_name)
);

-- Enable RLS on new tables
ALTER TABLE public.media_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_folder_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_usage ENABLE ROW LEVEL SECURITY;

-- RLS policies for media_folders (admin only)
CREATE POLICY "Admins can view media folders" ON public.media_folders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('super_admin', 'admin', 'content_manager', 'media_manager')
    )
  );

CREATE POLICY "Admins can manage media folders" ON public.media_folders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('super_admin', 'admin', 'media_manager')
    )
  );

-- RLS policies for media_folder_assignments
CREATE POLICY "Admins can view folder assignments" ON public.media_folder_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('super_admin', 'admin', 'content_manager', 'media_manager', 'content_editor', 'editor')
    )
  );

CREATE POLICY "Admins can manage folder assignments" ON public.media_folder_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('super_admin', 'admin', 'media_manager')
    )
  );

-- RLS policies for media_usage
CREATE POLICY "Admins can view media usage" ON public.media_usage
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('super_admin', 'admin', 'content_manager', 'media_manager', 'content_editor', 'editor')
    )
  );

CREATE POLICY "Admins can manage media usage" ON public.media_usage
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('super_admin', 'admin', 'media_manager')
    )
  );

-- Insert default system folders
INSERT INTO public.media_folders (name, slug, description, is_system, display_order) VALUES
  ('Districts', 'districts', 'Images used in district pages', true, 1),
  ('Culture', 'culture', 'Images used in culture pages', true, 2),
  ('History', 'history', 'Images used in history pages', true, 3),
  ('Gallery', 'gallery', 'Images used in gallery', true, 4),
  ('Products', 'products', 'Images used for products', true, 5),
  ('Travel', 'travel', 'Images used in travel pages', true, 6),
  ('Homepage / Common', 'homepage-common', 'Images used globally or on homepage', true, 7),
  ('Uncategorized', 'uncategorized', 'Images without detected usage', true, 8);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.handle_media_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_media_folders_updated_at
  BEFORE UPDATE ON public.media_folders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_media_updated_at();

CREATE TRIGGER set_media_usage_updated_at
  BEFORE UPDATE ON public.media_usage
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_media_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_media_folder_assignments_media_id ON public.media_folder_assignments(media_id);
CREATE INDEX idx_media_folder_assignments_folder_id ON public.media_folder_assignments(folder_id);
CREATE INDEX idx_media_usage_media_id ON public.media_usage(media_id);
CREATE INDEX idx_media_usage_content_type ON public.media_usage(content_type);