-- Add 'export' to the allowed reasons in credits_ledger
ALTER TABLE public.credits_ledger
DROP CONSTRAINT IF EXISTS credits_ledger_reason_check;

ALTER TABLE public.credits_ledger
ADD CONSTRAINT credits_ledger_reason_check 
CHECK (reason = ANY (ARRAY[
  'darkweb_scan'::text,
  'purchase'::text,
  'reverse_image_search'::text,
  'export'::text,
  'scan'::text,
  'api_usage'::text
]));