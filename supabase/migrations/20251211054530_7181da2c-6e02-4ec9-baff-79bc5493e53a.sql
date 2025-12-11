-- Drop existing insert policy and create a proper one for anonymous bookings
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;

-- Create a permissive policy that allows anyone (including anonymous users) to insert bookings
CREATE POLICY "Public can create bookings"
ON public.bookings
FOR INSERT
TO anon, authenticated
WITH CHECK (true);