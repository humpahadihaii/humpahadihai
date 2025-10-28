-- Drop the existing check constraint
ALTER TABLE public.district_highlights DROP CONSTRAINT IF EXISTS district_highlights_type_check;

-- Add new check constraint with more types
ALTER TABLE public.district_highlights 
ADD CONSTRAINT district_highlights_type_check 
CHECK (type IN ('festival', 'food', 'craft', 'attraction', 'handicraft', 'natural_attraction', 'religious_site', 'adventure_activity'));