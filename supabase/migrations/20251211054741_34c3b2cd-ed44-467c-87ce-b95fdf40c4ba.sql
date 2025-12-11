-- Ensure anon and authenticated have INSERT permission on bookings
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT INSERT ON public.bookings TO anon;
GRANT INSERT ON public.bookings TO authenticated;
GRANT SELECT ON public.bookings TO anon;
GRANT SELECT ON public.bookings TO authenticated;
GRANT UPDATE ON public.bookings TO authenticated;