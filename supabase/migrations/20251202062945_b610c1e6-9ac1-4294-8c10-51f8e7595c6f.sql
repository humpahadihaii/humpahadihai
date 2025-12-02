-- Fix RLS policies to allow super_admin access to admin_requests
-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all requests" ON admin_requests;
DROP POLICY IF EXISTS "Admins can update requests" ON admin_requests;

-- Recreate with super_admin included
CREATE POLICY "Admins and super_admins can view all requests"
ON admin_requests
FOR SELECT
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'super_admin')
);

CREATE POLICY "Admins and super_admins can update requests"
ON admin_requests
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'super_admin')
);

-- Also ensure super_admin can insert if needed
CREATE POLICY "Admins and super_admins can insert requests"
ON admin_requests
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'super_admin')
);