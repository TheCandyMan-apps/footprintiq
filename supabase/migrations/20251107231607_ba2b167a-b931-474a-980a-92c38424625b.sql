-- Add image_results column to cases table for storing reverse image search results
ALTER TABLE public.cases 
ADD COLUMN IF NOT EXISTS image_results JSONB DEFAULT NULL;

COMMENT ON COLUMN public.cases.image_results IS 'Stores reverse image search results as JSON array of matches';