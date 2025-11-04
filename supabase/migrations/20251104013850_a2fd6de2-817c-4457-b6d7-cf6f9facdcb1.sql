-- Add unique constraint to user_consents table for upsert operations
ALTER TABLE public.user_consents
ADD CONSTRAINT user_consents_user_id_consent_type_key 
UNIQUE (user_id, consent_type);