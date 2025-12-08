-- =============================================
-- MONETIZATION: Promotion Packages & Requests
-- =============================================

CREATE TABLE public.promotion_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('instagram', 'website', 'combo')),
  description TEXT,
  deliverables TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  price_currency TEXT NOT NULL DEFAULT 'INR',
  duration_days INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.promotion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_package_id UUID REFERENCES public.promotion_packages(id) ON DELETE SET NULL,
  business_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  instagram_handle TEXT,
  business_type TEXT,
  city TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'in_discussion', 'payment_received', 'completed', 'cancelled')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- TRAVEL: Packages & Booking Requests
-- =============================================

CREATE TABLE public.travel_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT,
  full_description TEXT,
  destination TEXT,
  region TEXT,
  duration_days INTEGER,
  difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'moderate', 'challenging', 'difficult')),
  best_season TEXT,
  starting_point TEXT,
  ending_point TEXT,
  price_per_person NUMERIC NOT NULL DEFAULT 0,
  price_currency TEXT NOT NULL DEFAULT 'INR',
  inclusions TEXT,
  exclusions TEXT,
  itinerary TEXT,
  thumbnail_image_url TEXT,
  gallery_images TEXT[],
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.travel_booking_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  travel_package_id UUID REFERENCES public.travel_packages(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  preferred_start_date DATE,
  month_or_season TEXT,
  number_of_travellers INTEGER DEFAULT 1,
  city TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quote_sent', 'payment_pending', 'confirmed', 'cancelled')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- LOCAL PRODUCTS (PAHADI STORE)
-- =============================================

CREATE TABLE public.local_product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.local_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category_id UUID REFERENCES public.local_product_categories(id) ON DELETE SET NULL,
  short_description TEXT,
  full_description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  price_currency TEXT NOT NULL DEFAULT 'INR',
  unit_label TEXT,
  stock_status TEXT NOT NULL DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'out_of_stock', 'made_to_order')),
  thumbnail_image_url TEXT,
  gallery_images TEXT[],
  tags TEXT[],
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.product_order_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  local_product_id UUID REFERENCES public.local_products(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  city TEXT,
  pincode TEXT,
  quantity INTEGER DEFAULT 1,
  preferred_delivery TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quote_sent', 'payment_pending', 'shipped', 'completed', 'cancelled')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.promotion_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.local_product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.local_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_order_requests ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES: Promotion Packages
-- =============================================

CREATE POLICY "Anyone can view active promotion packages"
ON public.promotion_packages FOR SELECT
USING (is_active = true);

CREATE POLICY "Staff can view all promotion packages"
ON public.promotion_packages FOR SELECT
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'content_manager'::app_role) OR
  has_role(auth.uid(), 'moderator'::app_role) OR
  has_role(auth.uid(), 'viewer'::app_role)
);

CREATE POLICY "Admins can manage promotion packages"
ON public.promotion_packages FOR ALL
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'content_manager'::app_role)
);

-- =============================================
-- RLS POLICIES: Promotion Requests
-- =============================================

CREATE POLICY "Anyone can submit promotion requests"
ON public.promotion_requests FOR INSERT
WITH CHECK (true);

CREATE POLICY "Staff can view promotion requests"
ON public.promotion_requests FOR SELECT
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'content_manager'::app_role) OR
  has_role(auth.uid(), 'moderator'::app_role) OR
  has_role(auth.uid(), 'viewer'::app_role)
);

CREATE POLICY "Admins can manage promotion requests"
ON public.promotion_requests FOR ALL
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'content_manager'::app_role)
);

-- =============================================
-- RLS POLICIES: Travel Packages
-- =============================================

CREATE POLICY "Anyone can view active travel packages"
ON public.travel_packages FOR SELECT
USING (is_active = true);

CREATE POLICY "Staff can view all travel packages"
ON public.travel_packages FOR SELECT
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'content_manager'::app_role) OR
  has_role(auth.uid(), 'moderator'::app_role) OR
  has_role(auth.uid(), 'viewer'::app_role)
);

CREATE POLICY "Admins can manage travel packages"
ON public.travel_packages FOR ALL
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'content_manager'::app_role)
);

-- =============================================
-- RLS POLICIES: Travel Booking Requests
-- =============================================

CREATE POLICY "Anyone can submit travel booking requests"
ON public.travel_booking_requests FOR INSERT
WITH CHECK (true);

CREATE POLICY "Staff can view travel booking requests"
ON public.travel_booking_requests FOR SELECT
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'content_manager'::app_role) OR
  has_role(auth.uid(), 'moderator'::app_role) OR
  has_role(auth.uid(), 'viewer'::app_role)
);

CREATE POLICY "Admins can manage travel booking requests"
ON public.travel_booking_requests FOR ALL
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'content_manager'::app_role)
);

-- =============================================
-- RLS POLICIES: Local Product Categories
-- =============================================

CREATE POLICY "Anyone can view active product categories"
ON public.local_product_categories FOR SELECT
USING (is_active = true);

CREATE POLICY "Staff can view all product categories"
ON public.local_product_categories FOR SELECT
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'content_manager'::app_role) OR
  has_role(auth.uid(), 'moderator'::app_role) OR
  has_role(auth.uid(), 'viewer'::app_role)
);

CREATE POLICY "Admins can manage product categories"
ON public.local_product_categories FOR ALL
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'content_manager'::app_role)
);

-- =============================================
-- RLS POLICIES: Local Products
-- =============================================

CREATE POLICY "Anyone can view active products"
ON public.local_products FOR SELECT
USING (is_active = true);

CREATE POLICY "Staff can view all products"
ON public.local_products FOR SELECT
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'content_manager'::app_role) OR
  has_role(auth.uid(), 'moderator'::app_role) OR
  has_role(auth.uid(), 'viewer'::app_role)
);

CREATE POLICY "Admins can manage products"
ON public.local_products FOR ALL
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'content_manager'::app_role)
);

-- =============================================
-- RLS POLICIES: Product Order Requests
-- =============================================

CREATE POLICY "Anyone can submit product order requests"
ON public.product_order_requests FOR INSERT
WITH CHECK (true);

CREATE POLICY "Staff can view product order requests"
ON public.product_order_requests FOR SELECT
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'content_manager'::app_role) OR
  has_role(auth.uid(), 'moderator'::app_role) OR
  has_role(auth.uid(), 'viewer'::app_role)
);

CREATE POLICY "Admins can manage product order requests"
ON public.product_order_requests FOR ALL
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'content_manager'::app_role)
);

-- =============================================
-- UPDATE TRIGGERS
-- =============================================

CREATE TRIGGER update_promotion_packages_updated_at
  BEFORE UPDATE ON public.promotion_packages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_promotion_requests_updated_at
  BEFORE UPDATE ON public.promotion_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_travel_packages_updated_at
  BEFORE UPDATE ON public.travel_packages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_travel_booking_requests_updated_at
  BEFORE UPDATE ON public.travel_booking_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_local_product_categories_updated_at
  BEFORE UPDATE ON public.local_product_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_local_products_updated_at
  BEFORE UPDATE ON public.local_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_order_requests_updated_at
  BEFORE UPDATE ON public.product_order_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();