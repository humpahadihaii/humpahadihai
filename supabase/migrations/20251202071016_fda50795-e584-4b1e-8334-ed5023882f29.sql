-- Create content_items table for unified content management
CREATE TABLE IF NOT EXISTS public.content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('culture', 'food', 'travel', 'thought', 'district_story', 'static')),
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  excerpt TEXT,
  body TEXT,
  main_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  meta_json JSONB DEFAULT '{}'::jsonb,
  UNIQUE (type, slug)
);

-- Create index for faster queries
CREATE INDEX idx_content_items_type ON public.content_items(type);
CREATE INDEX idx_content_items_status ON public.content_items(status);
CREATE INDEX idx_content_items_slug ON public.content_items(slug);
CREATE INDEX idx_content_items_published_at ON public.content_items(published_at);

-- Enable RLS
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for content_items
CREATE POLICY "Public can view published content"
  ON public.content_items FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admin and content managers can view all content"
  ON public.content_items FOR SELECT
  USING (
    has_role(auth.uid(), 'super_admin') OR
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'content_manager')
  );

CREATE POLICY "Admin and content managers can insert content"
  ON public.content_items FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'super_admin') OR
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'content_manager')
  );

CREATE POLICY "Admin and content managers can update content"
  ON public.content_items FOR UPDATE
  USING (
    has_role(auth.uid(), 'super_admin') OR
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'content_manager')
  );

CREATE POLICY "Admin and content managers can delete content"
  ON public.content_items FOR DELETE
  USING (
    has_role(auth.uid(), 'super_admin') OR
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'content_manager')
  );

-- Create community_submissions table
CREATE TABLE IF NOT EXISTS public.community_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('story', 'photo')),
  target_section TEXT NOT NULL CHECK (target_section IN ('culture', 'food', 'travel', 'thought', 'district_story', 'gallery')),
  title TEXT NOT NULL,
  body TEXT,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'needs_changes')),
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_notes TEXT,
  linked_content_item_id UUID REFERENCES public.content_items(id) ON DELETE SET NULL,
  linked_gallery_item_id UUID REFERENCES public.gallery_items(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for community_submissions
CREATE INDEX idx_community_submissions_user_id ON public.community_submissions(user_id);
CREATE INDEX idx_community_submissions_status ON public.community_submissions(status);
CREATE INDEX idx_community_submissions_type ON public.community_submissions(type);
CREATE INDEX idx_community_submissions_target_section ON public.community_submissions(target_section);

-- Enable RLS
ALTER TABLE public.community_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for community_submissions
CREATE POLICY "Users can view own submissions"
  ON public.community_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Staff can view all submissions"
  ON public.community_submissions FOR SELECT
  USING (
    has_role(auth.uid(), 'super_admin') OR
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'content_manager') OR
    has_role(auth.uid(), 'moderator')
  );

CREATE POLICY "Users can insert own submissions"
  ON public.community_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own submissions if pending or needs_changes"
  ON public.community_submissions FOR UPDATE
  USING (
    auth.uid() = user_id AND
    status IN ('pending', 'needs_changes')
  )
  WITH CHECK (
    auth.uid() = user_id AND
    status IN ('pending', 'needs_changes')
  );

CREATE POLICY "Staff can update all submissions"
  ON public.community_submissions FOR UPDATE
  USING (
    has_role(auth.uid(), 'super_admin') OR
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'content_manager') OR
    has_role(auth.uid(), 'moderator')
  );

CREATE POLICY "Admin and content managers can delete submissions"
  ON public.community_submissions FOR DELETE
  USING (
    has_role(auth.uid(), 'super_admin') OR
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'content_manager')
  );

-- Create updated_at trigger function for content_items
CREATE TRIGGER update_content_items_updated_at
  BEFORE UPDATE ON public.content_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create updated_at trigger for community_submissions
CREATE TRIGGER update_community_submissions_updated_at
  BEFORE UPDATE ON public.community_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();