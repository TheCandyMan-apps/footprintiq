-- Add new branding fields to pdf_branding_settings
ALTER TABLE public.pdf_branding_settings 
ADD COLUMN IF NOT EXISTS footer_text TEXT DEFAULT 'Confidential - For authorized use only',
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT;