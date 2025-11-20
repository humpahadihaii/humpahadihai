-- Fix RLS policies on admin_requests to avoid querying auth.users
-- Drop the old policies that query auth.users table
DROP POLICY IF EXISTS "Main admin can update requests" ON public.admin_requests;
DROP POLICY IF EXISTS "Main admin can view all requests" ON public.admin_requests;

-- Create new policies using has_role function instead
CREATE POLICY "Admins can update requests"
ON public.admin_requests
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all requests"
ON public.admin_requests
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Keep the existing user-specific policy
-- (Users can view own requests - already exists)