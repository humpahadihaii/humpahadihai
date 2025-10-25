-- Create thoughts table
CREATE TABLE public.thoughts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  photo_url TEXT,
  thought TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'featured')),
  sentiment TEXT CHECK (sentiment IN ('positive', 'critical', 'neutral')),
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id)
);

-- Create tags table
CREATE TABLE public.thought_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create junction table for thoughts and tags
CREATE TABLE public.thought_tag_relations (
  thought_id UUID REFERENCES public.thoughts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.thought_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (thought_id, tag_id)
);

-- Create likes table
CREATE TABLE public.thought_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thought_id UUID REFERENCES public.thoughts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (thought_id, user_id),
  UNIQUE (thought_id, ip_address)
);

-- Insert default tags
INSERT INTO public.thought_tags (name, slug) VALUES
  ('Culture', 'culture'),
  ('Nature', 'nature'),
  ('Migration', 'migration'),
  ('Festivals', 'festivals'),
  ('Food', 'food'),
  ('Language', 'language'),
  ('Heritage', 'heritage'),
  ('Community', 'community');

-- Enable RLS
ALTER TABLE public.thoughts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thought_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thought_tag_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thought_likes ENABLE ROW LEVEL SECURITY;

-- Thoughts policies
CREATE POLICY "Anyone can view approved thoughts"
  ON public.thoughts FOR SELECT
  USING (status = 'approved' OR status = 'featured');

CREATE POLICY "Admins and moderators can view all thoughts"
  ON public.thoughts FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));

CREATE POLICY "Anyone can submit thoughts"
  ON public.thoughts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins and moderators can update thoughts"
  ON public.thoughts FOR UPDATE
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));

CREATE POLICY "Admins can delete thoughts"
  ON public.thoughts FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Tags policies
CREATE POLICY "Anyone can view tags"
  ON public.thought_tags FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage tags"
  ON public.thought_tags FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Tag relations policies
CREATE POLICY "Anyone can view tag relations"
  ON public.thought_tag_relations FOR SELECT
  USING (true);

CREATE POLICY "Admins and moderators can manage tag relations"
  ON public.thought_tag_relations FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));

-- Likes policies
CREATE POLICY "Anyone can view likes"
  ON public.thought_likes FOR SELECT
  USING (true);

CREATE POLICY "Anyone can add likes"
  ON public.thought_likes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete their own likes"
  ON public.thought_likes FOR DELETE
  USING (auth.uid() = user_id OR ip_address = current_setting('request.headers', true)::json->>'x-forwarded-for');

-- Trigger to update likes_count
CREATE OR REPLACE FUNCTION update_thought_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE thoughts SET likes_count = likes_count + 1 WHERE id = NEW.thought_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE thoughts SET likes_count = likes_count - 1 WHERE id = OLD.thought_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER thought_likes_count_trigger
AFTER INSERT OR DELETE ON public.thought_likes
FOR EACH ROW EXECUTE FUNCTION update_thought_likes_count();

-- Trigger for updated_at
CREATE TRIGGER update_thoughts_updated_at
BEFORE UPDATE ON public.thoughts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add new fields to user_submissions table
ALTER TABLE public.user_submissions ADD COLUMN subject TEXT;
ALTER TABLE public.user_submissions ADD COLUMN reason TEXT;
ALTER TABLE public.user_submissions ADD COLUMN location TEXT;
ALTER TABLE public.user_submissions ADD COLUMN file_url TEXT;
ALTER TABLE public.user_submissions ADD COLUMN replied_at TIMESTAMPTZ;
ALTER TABLE public.user_submissions ADD COLUMN archived_at TIMESTAMPTZ;