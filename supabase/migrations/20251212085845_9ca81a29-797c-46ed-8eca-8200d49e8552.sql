-- Fix gallery_items INSERT policy to include admin roles
DROP POLICY IF EXISTS "Editor can create gallery items" ON public.gallery_items;

CREATE POLICY "Staff can create gallery items" 
ON public.gallery_items 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'content_manager'::app_role) OR 
  has_role(auth.uid(), 'media_manager'::app_role) OR
  has_role(auth.uid(), 'editor'::app_role) OR
  has_role(auth.uid(), 'content_editor'::app_role)
);