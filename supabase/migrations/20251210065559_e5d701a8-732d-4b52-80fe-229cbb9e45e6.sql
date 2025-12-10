-- Create bookings table for unified booking system
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('package', 'listing', 'product')),
  
  -- Foreign keys (only one used per row based on type)
  package_id UUID REFERENCES public.travel_packages(id) ON DELETE SET NULL,
  listing_id UUID REFERENCES public.tourism_listings(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.local_products(id) ON DELETE SET NULL,
  
  -- Customer info
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  
  -- Trip-related fields
  start_date DATE,
  end_date DATE,
  nights INTEGER,
  adults INTEGER DEFAULT 1,
  children INTEGER DEFAULT 0,
  
  -- Product-related fields
  quantity INTEGER DEFAULT 1,
  shipping_address TEXT,
  city TEXT,
  pincode TEXT,
  
  -- Pricing
  unit_price NUMERIC,
  total_price NUMERIC,
  currency TEXT DEFAULT 'INR',
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'rejected')),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'pending', 'paid', 'failed')),
  
  -- Meta
  notes TEXT,
  admin_notes TEXT,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Anyone can create bookings (guest checkout allowed)
CREATE POLICY "Anyone can create bookings"
ON public.bookings
FOR INSERT
WITH CHECK (true);

-- Users can view their own bookings
CREATE POLICY "Users can view own bookings"
ON public.bookings
FOR SELECT
USING (auth.uid() = user_id);

-- Admin roles can view all bookings
CREATE POLICY "Admins can view all bookings"
ON public.bookings
FOR SELECT
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'content_manager'::app_role)
);

-- Admin roles can update bookings
CREATE POLICY "Admins can update bookings"
ON public.bookings
FOR UPDATE
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'content_manager'::app_role)
);

-- Admin roles can delete bookings
CREATE POLICY "Admins can delete bookings"
ON public.bookings
FOR DELETE
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Create updated_at trigger
CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for common queries
CREATE INDEX idx_bookings_type ON public.bookings(type);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX idx_bookings_created_at ON public.bookings(created_at DESC);