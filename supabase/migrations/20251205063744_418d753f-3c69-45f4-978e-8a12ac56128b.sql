-- Add district_id to content_items table (nullable for general Uttarakhand content)
ALTER TABLE public.content_items 
ADD COLUMN district_id uuid REFERENCES public.districts(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX idx_content_items_district_id ON public.content_items(district_id);

-- Create index for type + district combination
CREATE INDEX idx_content_items_type_district ON public.content_items(type, district_id);