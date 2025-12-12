-- Fix RLS policies for site_images to include all admin roles for UPDATE
DROP POLICY IF EXISTS "Admins and editors can manage site images" ON public.site_images;

CREATE POLICY "Staff can manage site images" 
ON public.site_images 
FOR ALL 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'content_manager'::app_role) OR 
  has_role(auth.uid(), 'media_manager'::app_role) OR
  has_role(auth.uid(), 'editor'::app_role) OR
  has_role(auth.uid(), 'content_editor'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'content_manager'::app_role) OR 
  has_role(auth.uid(), 'media_manager'::app_role) OR
  has_role(auth.uid(), 'editor'::app_role) OR
  has_role(auth.uid(), 'content_editor'::app_role)
);

-- Fix villages table policies
DROP POLICY IF EXISTS "Staff can update villages" ON public.villages;
DROP POLICY IF EXISTS "Editor can update villages" ON public.villages;

CREATE POLICY "Staff can manage villages" 
ON public.villages 
FOR ALL 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'content_manager'::app_role) OR
  has_role(auth.uid(), 'editor'::app_role) OR
  has_role(auth.uid(), 'content_editor'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'content_manager'::app_role) OR
  has_role(auth.uid(), 'editor'::app_role) OR
  has_role(auth.uid(), 'content_editor'::app_role)
);

-- Fix districts table policies
DROP POLICY IF EXISTS "Staff can update districts" ON public.districts;
DROP POLICY IF EXISTS "Editor can update districts" ON public.districts;

CREATE POLICY "Staff can manage districts" 
ON public.districts 
FOR ALL 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'content_manager'::app_role) OR
  has_role(auth.uid(), 'editor'::app_role) OR
  has_role(auth.uid(), 'content_editor'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'content_manager'::app_role) OR
  has_role(auth.uid(), 'editor'::app_role) OR
  has_role(auth.uid(), 'content_editor'::app_role)
);

-- Fix tourism_listings policies
DROP POLICY IF EXISTS "Staff can update tourism listings" ON public.tourism_listings;
DROP POLICY IF EXISTS "Editor can update tourism listings" ON public.tourism_listings;

CREATE POLICY "Staff can manage tourism listings" 
ON public.tourism_listings 
FOR ALL 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'content_manager'::app_role) OR
  has_role(auth.uid(), 'editor'::app_role) OR
  has_role(auth.uid(), 'content_editor'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'content_manager'::app_role) OR
  has_role(auth.uid(), 'editor'::app_role) OR
  has_role(auth.uid(), 'content_editor'::app_role)
);

-- Fix tourism_providers policies
DROP POLICY IF EXISTS "Staff can update tourism providers" ON public.tourism_providers;
DROP POLICY IF EXISTS "Editor can update tourism providers" ON public.tourism_providers;

CREATE POLICY "Staff can manage tourism providers" 
ON public.tourism_providers 
FOR ALL 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'content_manager'::app_role) OR
  has_role(auth.uid(), 'editor'::app_role) OR
  has_role(auth.uid(), 'content_editor'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'content_manager'::app_role) OR
  has_role(auth.uid(), 'editor'::app_role) OR
  has_role(auth.uid(), 'content_editor'::app_role)
);

-- Fix travel_packages policies
DROP POLICY IF EXISTS "Staff can update travel packages" ON public.travel_packages;
DROP POLICY IF EXISTS "Editor can update travel packages" ON public.travel_packages;

CREATE POLICY "Staff can manage travel packages" 
ON public.travel_packages 
FOR ALL 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'content_manager'::app_role) OR
  has_role(auth.uid(), 'editor'::app_role) OR
  has_role(auth.uid(), 'content_editor'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'content_manager'::app_role) OR
  has_role(auth.uid(), 'editor'::app_role) OR
  has_role(auth.uid(), 'content_editor'::app_role)
);

-- Fix local_products policies
DROP POLICY IF EXISTS "Staff can update local products" ON public.local_products;
DROP POLICY IF EXISTS "Editor can update local products" ON public.local_products;

CREATE POLICY "Staff can manage local products" 
ON public.local_products 
FOR ALL 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'content_manager'::app_role) OR
  has_role(auth.uid(), 'editor'::app_role) OR
  has_role(auth.uid(), 'content_editor'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'content_manager'::app_role) OR
  has_role(auth.uid(), 'editor'::app_role) OR
  has_role(auth.uid(), 'content_editor'::app_role)
);

-- Fix district_places policies
DROP POLICY IF EXISTS "Staff can update district places" ON public.district_places;
DROP POLICY IF EXISTS "Editor can update district places" ON public.district_places;

CREATE POLICY "Staff can manage district places" 
ON public.district_places 
FOR ALL 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'content_manager'::app_role) OR
  has_role(auth.uid(), 'editor'::app_role) OR
  has_role(auth.uid(), 'content_editor'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'content_manager'::app_role) OR
  has_role(auth.uid(), 'editor'::app_role) OR
  has_role(auth.uid(), 'content_editor'::app_role)
);

-- Fix district_foods policies
DROP POLICY IF EXISTS "Staff can update district foods" ON public.district_foods;
DROP POLICY IF EXISTS "Editor can update district foods" ON public.district_foods;

CREATE POLICY "Staff can manage district foods" 
ON public.district_foods 
FOR ALL 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'content_manager'::app_role) OR
  has_role(auth.uid(), 'editor'::app_role) OR
  has_role(auth.uid(), 'content_editor'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'content_manager'::app_role) OR
  has_role(auth.uid(), 'editor'::app_role) OR
  has_role(auth.uid(), 'content_editor'::app_role)
);

-- Fix district_festivals policies
DROP POLICY IF EXISTS "Staff can update district festivals" ON public.district_festivals;
DROP POLICY IF EXISTS "Editor can update district festivals" ON public.district_festivals;

CREATE POLICY "Staff can manage district festivals" 
ON public.district_festivals 
FOR ALL 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'content_manager'::app_role) OR
  has_role(auth.uid(), 'editor'::app_role) OR
  has_role(auth.uid(), 'content_editor'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'content_manager'::app_role) OR
  has_role(auth.uid(), 'editor'::app_role) OR
  has_role(auth.uid(), 'content_editor'::app_role)
);

-- Fix content_items policies
DROP POLICY IF EXISTS "Staff can update content items" ON public.content_items;
DROP POLICY IF EXISTS "Editor can update content items" ON public.content_items;

CREATE POLICY "Staff can manage content items" 
ON public.content_items 
FOR ALL 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'content_manager'::app_role) OR
  has_role(auth.uid(), 'editor'::app_role) OR
  has_role(auth.uid(), 'content_editor'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'content_manager'::app_role) OR
  has_role(auth.uid(), 'editor'::app_role) OR
  has_role(auth.uid(), 'content_editor'::app_role)
);

-- Fix cms_stories policies
DROP POLICY IF EXISTS "Staff can update cms stories" ON public.cms_stories;
DROP POLICY IF EXISTS "Editor can update cms stories" ON public.cms_stories;

CREATE POLICY "Staff can manage cms stories" 
ON public.cms_stories 
FOR ALL 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'content_manager'::app_role) OR
  has_role(auth.uid(), 'editor'::app_role) OR
  has_role(auth.uid(), 'content_editor'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'content_manager'::app_role) OR
  has_role(auth.uid(), 'editor'::app_role) OR
  has_role(auth.uid(), 'content_editor'::app_role)
);

-- Fix cms_events policies
DROP POLICY IF EXISTS "Staff can update cms events" ON public.cms_events;
DROP POLICY IF EXISTS "Editor can update cms events" ON public.cms_events;

CREATE POLICY "Staff can manage cms events" 
ON public.cms_events 
FOR ALL 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'content_manager'::app_role) OR
  has_role(auth.uid(), 'editor'::app_role) OR
  has_role(auth.uid(), 'content_editor'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'content_manager'::app_role) OR
  has_role(auth.uid(), 'editor'::app_role) OR
  has_role(auth.uid(), 'content_editor'::app_role)
);