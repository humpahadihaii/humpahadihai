-- Allow anyone to insert tag relations when submitting thoughts
CREATE POLICY "Anyone can create tag relations"
ON public.thought_tag_relations
FOR INSERT
WITH CHECK (true);

-- Also ensure thought_tags table has the predefined tags
INSERT INTO public.thought_tags (name, slug) VALUES
  ('Culture', 'culture'),
  ('Nature', 'nature'),
  ('Migration', 'migration'),
  ('Festivals', 'festivals'),
  ('Food', 'food'),
  ('Language', 'language'),
  ('Heritage', 'heritage'),
  ('Community', 'community')
ON CONFLICT (slug) DO NOTHING;