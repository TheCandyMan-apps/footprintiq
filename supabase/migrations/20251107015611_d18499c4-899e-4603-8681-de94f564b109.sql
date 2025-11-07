-- Update user_preferences to allow 'grok' as a model option
ALTER TABLE public.user_preferences
DROP CONSTRAINT IF EXISTS user_preferences_ai_preferred_model_check;

ALTER TABLE public.user_preferences
ADD CONSTRAINT user_preferences_ai_preferred_model_check 
CHECK (ai_preferred_model IN ('gemini', 'gpt', 'grok'));