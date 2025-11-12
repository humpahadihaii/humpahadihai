-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Storage policies for images bucket
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

CREATE POLICY "Admins and editors can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'images' AND
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role))
);

CREATE POLICY "Admins and editors can update images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'images' AND
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role))
);

CREATE POLICY "Admins can delete images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'images' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Create admin requests table for approval system
CREATE TABLE public.admin_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_role app_role NOT NULL DEFAULT 'admin',
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on admin_requests
ALTER TABLE public.admin_requests ENABLE ROW LEVEL SECURITY;

-- Main admin can view all requests
CREATE POLICY "Main admin can view all requests"
ON public.admin_requests FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.email = 'joshihj2580@gmail.com'
  )
);

-- Main admin can update requests
CREATE POLICY "Main admin can update requests"
ON public.admin_requests FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.email = 'joshihj2580@gmail.com'
  )
);

-- Users can view their own requests
CREATE POLICY "Users can view own requests"
ON public.admin_requests FOR SELECT
USING (auth.uid() = user_id);

-- Anyone can create requests (during signup)
CREATE POLICY "Anyone can create requests"
ON public.admin_requests FOR INSERT
WITH CHECK (true);

-- Update handle_new_user function to create admin request instead of profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  
  -- If it's the main admin email, grant admin role immediately
  IF NEW.email = 'joshihj2580@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  ELSE
    -- Create admin request for approval
    INSERT INTO public.admin_requests (user_id, email, full_name, status)
    VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'full_name',
      'pending'
    );
  END IF;
  
  RETURN NEW;
END;
$$;