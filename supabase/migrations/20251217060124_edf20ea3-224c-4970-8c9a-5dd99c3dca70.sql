-- Enable RLS on user_submissions table (if not already enabled)
ALTER TABLE public.user_submissions ENABLE ROW LEVEL SECURITY;

-- Drop any existing permissive policies that allow public access
DROP POLICY IF EXISTS "Allow public insert" ON public.user_submissions;
DROP POLICY IF EXISTS "Allow public read" ON public.user_submissions;
DROP POLICY IF EXISTS "Public can insert submissions" ON public.user_submissions;
DROP POLICY IF EXISTS "Public can view submissions" ON public.user_submissions;

-- Allow anyone to INSERT (for contact form submissions)
CREATE POLICY "Anyone can submit contact forms"
ON public.user_submissions
FOR INSERT
WITH CHECK (true);

-- Only admins can SELECT submissions
CREATE POLICY "Only admins can view submissions"
ON public.user_submissions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('super_admin', 'admin', 'support_agent')
  )
);

-- Only admins can UPDATE submissions (for marking replied/archived)
CREATE POLICY "Only admins can update submissions"
ON public.user_submissions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('super_admin', 'admin', 'support_agent')
  )
);

-- Only admins can DELETE submissions
CREATE POLICY "Only admins can delete submissions"
ON public.user_submissions
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('super_admin', 'admin', 'support_agent')
  )
);