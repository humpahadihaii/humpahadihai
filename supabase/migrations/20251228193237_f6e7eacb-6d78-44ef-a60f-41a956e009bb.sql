-- Add source and notes columns to media_library if they don't exist
ALTER TABLE media_library ADD COLUMN IF NOT EXISTS source text DEFAULT 'uploaded';
ALTER TABLE media_library ADD COLUMN IF NOT EXISTS admin_notes text;

-- Create media_library table if it doesn't exist (ensure all required columns)
CREATE TABLE IF NOT EXISTS public.media_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  alt_text TEXT,
  title TEXT,
  tags TEXT[],
  width INTEGER,
  height INTEGER,
  source TEXT DEFAULT 'uploaded',
  admin_notes TEXT,
  uploaded_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS if not already enabled
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (drop first if exist to avoid conflicts)
DROP POLICY IF EXISTS "Admin can manage media library" ON public.media_library;
CREATE POLICY "Admin can manage media library"
ON public.media_library
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin', 'content_manager', 'media_manager')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin', 'content_manager', 'media_manager')
  )
);

-- Add unique constraint on file_url to prevent duplicates
ALTER TABLE public.media_library DROP CONSTRAINT IF EXISTS media_library_file_url_key;
ALTER TABLE public.media_library ADD CONSTRAINT media_library_file_url_key UNIQUE (file_url);

-- Update media_usage to have proper unique constraint
ALTER TABLE public.media_usage DROP CONSTRAINT IF EXISTS media_usage_unique_entry;
ALTER TABLE public.media_usage ADD CONSTRAINT media_usage_unique_entry 
  UNIQUE (media_id, content_type, content_id, field_name);