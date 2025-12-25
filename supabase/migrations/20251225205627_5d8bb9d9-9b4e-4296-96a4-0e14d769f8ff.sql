-- Add report_template column to pdf_branding_settings
ALTER TABLE pdf_branding_settings 
ADD COLUMN IF NOT EXISTS report_template TEXT DEFAULT 'executive';

-- Add template_options for customization
ALTER TABLE pdf_branding_settings 
ADD COLUMN IF NOT EXISTS template_options JSONB DEFAULT '{"show_executive_summary": true, "show_provider_breakdown": true, "show_risk_analysis": true, "show_timeline": false, "show_detailed_findings": true}'::jsonb;

COMMENT ON COLUMN pdf_branding_settings.report_template IS 'Template style: executive, technical, or summary';
COMMENT ON COLUMN pdf_branding_settings.template_options IS 'Customizable options for report content sections';