-- Create table to link results (scans, findings, etc.) to cases
-- This enables adding items from results pages into investigation cases

-- 1) case_items table
CREATE TABLE public.case_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('scan','finding','data_source','social_profile')),
  item_id UUID NOT NULL,
  title TEXT,
  summary TEXT,
  url TEXT,
  added_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Helpful indexes
CREATE INDEX idx_case_items_case_id ON public.case_items(case_id);
CREATE INDEX idx_case_items_item ON public.case_items(item_type, item_id);

-- 2) Enable Row Level Security
ALTER TABLE public.case_items ENABLE ROW LEVEL SECURITY;

-- 3) RLS policies: user can manage items for cases they own
-- Ensure only owner of the parent case can select/insert/update/delete
CREATE POLICY "case_items_select_own" ON public.case_items
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.cases c 
    WHERE c.id = case_items.case_id 
      AND c.user_id = auth.uid()
  )
);

CREATE POLICY "case_items_insert_own" ON public.case_items
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.cases c 
    WHERE c.id = case_items.case_id 
      AND c.user_id = auth.uid()
  )
);

CREATE POLICY "case_items_update_own" ON public.case_items
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.cases c 
    WHERE c.id = case_items.case_id 
      AND c.user_id = auth.uid()
  )
);

CREATE POLICY "case_items_delete_own" ON public.case_items
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.cases c 
    WHERE c.id = case_items.case_id 
      AND c.user_id = auth.uid()
  )
);
