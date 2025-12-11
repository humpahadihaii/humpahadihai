-- Grant INSERT, SELECT on bookings table to anon and authenticated roles
GRANT INSERT, SELECT ON public.bookings TO anon;
GRANT INSERT, SELECT, UPDATE ON public.bookings TO authenticated;