-- Fix thought_likes RLS: IP addresses should not be publicly readable

-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view likes" ON thought_likes;

-- Create a restricted SELECT policy for admins only
CREATE POLICY "Admins can view likes with details"
ON thought_likes
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role) 
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'analytics_viewer'::app_role)
);

-- Allow users to check if they already liked (without seeing IP details)
-- This is handled by the likes_count column on thoughts table
-- and the existing INSERT policy with unique constraint