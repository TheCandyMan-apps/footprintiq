-- Create entity_claims table for user ownership claims
CREATE TABLE public.entity_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  finding_id TEXT NOT NULL,
  scan_id UUID NOT NULL,
  user_id UUID NOT NULL,
  claim_type TEXT NOT NULL CHECK (claim_type IN ('me', 'not_me')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(finding_id, user_id)
);

-- Enable RLS
ALTER TABLE public.entity_claims ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own claims"
ON public.entity_claims
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own claims"
ON public.entity_claims
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own claims"
ON public.entity_claims
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own claims"
ON public.entity_claims
FOR DELETE
USING (auth.uid() = user_id);

-- Update trigger
CREATE TRIGGER update_entity_claims_updated_at
BEFORE UPDATE ON public.entity_claims
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();