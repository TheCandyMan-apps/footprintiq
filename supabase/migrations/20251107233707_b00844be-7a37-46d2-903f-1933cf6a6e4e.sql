-- Create case_templates table
CREATE TABLE IF NOT EXISTS public.case_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  icon TEXT,
  predefined_tags TEXT[],
  checklist_items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE public.case_templates ENABLE ROW LEVEL SECURITY;

-- Public read access for templates (no auth required to view templates)
CREATE POLICY "Templates are viewable by everyone"
  ON public.case_templates
  FOR SELECT
  USING (is_active = true);

-- Insert default templates for common investigation scenarios
INSERT INTO public.case_templates (name, description, category, priority, icon, predefined_tags, checklist_items) VALUES
(
  'Data Breach Investigation',
  'Comprehensive template for investigating data breaches including evidence collection, impact assessment, and containment steps.',
  'security',
  'critical',
  'shield-alert',
  ARRAY['data-breach', 'incident-response', 'forensics'],
  '[
    {"task": "Identify scope of breach", "completed": false},
    {"task": "Preserve evidence and logs", "completed": false},
    {"task": "Analyze attack vectors", "completed": false},
    {"task": "Assess data exposure", "completed": false},
    {"task": "Notify affected parties", "completed": false},
    {"task": "Implement containment measures", "completed": false},
    {"task": "Document timeline and IOCs", "completed": false}
  ]'::jsonb
),
(
  'Threat Actor Profiling',
  'Track and profile threat actors, their TTPs, infrastructure, and campaigns. Build comprehensive dossiers on adversaries.',
  'intelligence',
  'high',
  'user-search',
  ARRAY['threat-intel', 'adversary', 'apt'],
  '[
    {"task": "Collect known aliases and identifiers", "completed": false},
    {"task": "Map infrastructure (domains, IPs)", "completed": false},
    {"task": "Document TTPs and tooling", "completed": false},
    {"task": "Identify attribution indicators", "completed": false},
    {"task": "Track campaigns and targets", "completed": false},
    {"task": "Link to other threat groups", "completed": false},
    {"task": "Assess capability and intent", "completed": false}
  ]'::jsonb
),
(
  'Brand Monitoring & Impersonation',
  'Monitor for brand abuse, phishing campaigns, fake social media accounts, and trademark infringement.',
  'brand-protection',
  'high',
  'eye',
  ARRAY['brand-abuse', 'phishing', 'impersonation'],
  '[
    {"task": "Scan for lookalike domains", "completed": false},
    {"task": "Monitor social media for fake accounts", "completed": false},
    {"task": "Search dark web for brand mentions", "completed": false},
    {"task": "Check app stores for fake apps", "completed": false},
    {"task": "Document evidence of abuse", "completed": false},
    {"task": "Initiate takedown requests", "completed": false},
    {"task": "Track resolution status", "completed": false}
  ]'::jsonb
),
(
  'Malware Analysis',
  'Analyze malicious software samples, document behavior, and extract IOCs for threat intelligence.',
  'security',
  'high',
  'bug',
  ARRAY['malware', 'reverse-engineering', 'iocs'],
  '[
    {"task": "Collect sample hashes and metadata", "completed": false},
    {"task": "Static analysis (strings, headers)", "completed": false},
    {"task": "Dynamic analysis (sandbox)", "completed": false},
    {"task": "Network behavior analysis", "completed": false},
    {"task": "Extract IOCs (domains, IPs, files)", "completed": false},
    {"task": "Identify malware family", "completed": false},
    {"task": "Document capabilities and persistence", "completed": false}
  ]'::jsonb
),
(
  'Executive Protection',
  'Monitor for threats targeting executives including doxxing, credential leaks, and impersonation.',
  'vip-protection',
  'critical',
  'shield',
  ARRAY['executive-protection', 'doxxing', 'credentials'],
  '[
    {"task": "Scan for PII leaks", "completed": false},
    {"task": "Monitor dark web for credentials", "completed": false},
    {"task": "Check for impersonation accounts", "completed": false},
    {"task": "Track social media threats", "completed": false},
    {"task": "Review public exposure", "completed": false},
    {"task": "Recommend security measures", "completed": false},
    {"task": "Set up ongoing monitoring", "completed": false}
  ]'::jsonb
),
(
  'Supply Chain Risk Assessment',
  'Evaluate third-party vendors and partners for security risks, data exposure, and compliance issues.',
  'risk-assessment',
  'medium',
  'link',
  ARRAY['supply-chain', 'vendor-risk', 'third-party'],
  '[
    {"task": "Inventory vendor relationships", "completed": false},
    {"task": "Scan vendor infrastructure", "completed": false},
    {"task": "Check for data breaches", "completed": false},
    {"task": "Review security posture", "completed": false},
    {"task": "Assess compliance status", "completed": false},
    {"task": "Document risk findings", "completed": false},
    {"task": "Recommend mitigations", "completed": false}
  ]'::jsonb
);