-- Fix storage bucket policies to use correct RBAC roles

-- Drop existing policies
DROP POLICY IF EXISTS "Admins and editors can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Admins and editors can update images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete images" ON storage.objects;

-- Create new policies with correct roles: super_admin, admin, content_manager, content_editor
CREATE POLICY "Staff can upload images"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'images' 
  AND (
    has_role(auth.uid(), 'super_admin'::app_role) 
    OR has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'content_manager'::app_role)
    OR has_role(auth.uid(), 'content_editor'::app_role)
  )
);

CREATE POLICY "Staff can update images"
ON storage.objects
FOR UPDATE
TO public
USING (
  bucket_id = 'images' 
  AND (
    has_role(auth.uid(), 'super_admin'::app_role) 
    OR has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'content_manager'::app_role)
    OR has_role(auth.uid(), 'content_editor'::app_role)
  )
);

CREATE POLICY "Admins can delete images"
ON storage.objects
FOR DELETE
TO public
USING (
  bucket_id = 'images' 
  AND (
    has_role(auth.uid(), 'super_admin'::app_role) 
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'content_manager'::app_role)
  )
);