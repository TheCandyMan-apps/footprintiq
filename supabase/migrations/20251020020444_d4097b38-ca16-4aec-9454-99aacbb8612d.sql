-- Phase 10, 11, 12, 13: Advanced Features Schema

-- ============================================
-- PHASE 10: TEAM & ORGANIZATION FEATURES
-- ============================================

-- Organizations table
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  owner_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Organization members
CREATE TABLE public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer',
  invited_by UUID,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- Team invitations
CREATE TABLE public.team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  invited_by UUID NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activity logs
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- PHASE 11: THREAT INTELLIGENCE
-- ============================================

-- Threat feeds
CREATE TABLE public.threat_feeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  source TEXT NOT NULL,
  feed_type TEXT NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Threat indicators (IoCs)
CREATE TABLE public.threat_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_type TEXT NOT NULL,
  indicator_value TEXT NOT NULL,
  threat_level TEXT NOT NULL,
  confidence_score NUMERIC(3,2) DEFAULT 0.5,
  source TEXT NOT NULL,
  first_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}',
  UNIQUE(indicator_type, indicator_value)
);

-- Dark web monitoring
CREATE TABLE public.darkweb_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  finding_type TEXT NOT NULL,
  data_exposed TEXT[] NOT NULL,
  source_url TEXT,
  discovered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  severity TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'
);

-- Compromised credentials
CREATE TABLE public.compromised_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  breach_name TEXT NOT NULL,
  breach_date TIMESTAMP WITH TIME ZONE,
  data_classes TEXT[] NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  notified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- PHASE 12: COMPLIANCE & REPORTING
-- ============================================

-- Compliance templates
CREATE TABLE public.compliance_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  regulation_type TEXT NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Compliance reports
CREATE TABLE public.compliance_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  organization_id UUID,
  template_id UUID NOT NULL,
  report_type TEXT NOT NULL,
  report_data JSONB NOT NULL,
  status TEXT DEFAULT 'draft',
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  file_url TEXT
);

-- Evidence collections
CREATE TABLE public.evidence_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  collection_type TEXT NOT NULL,
  chain_of_custody JSONB DEFAULT '[]',
  is_sealed BOOLEAN DEFAULT false,
  sealed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- PHASE 13: AUTOMATED REMEDIATION
-- ============================================

-- Removal templates
CREATE TABLE public.removal_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  platform TEXT NOT NULL,
  template_type TEXT NOT NULL,
  subject_template TEXT,
  body_template TEXT NOT NULL,
  follow_up_days INTEGER DEFAULT 7,
  is_active BOOLEAN DEFAULT true,
  success_rate NUMERIC(5,2) DEFAULT 0,
  metadata JSONB DEFAULT '{}'
);

-- Automated removal jobs
CREATE TABLE public.automated_removals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  source_id UUID NOT NULL,
  template_id UUID,
  status TEXT DEFAULT 'pending',
  attempt_count INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  next_attempt_at TIMESTAMP WITH TIME ZONE,
  success_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Removal campaigns
CREATE TABLE public.removal_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  target_sources TEXT[] NOT NULL,
  status TEXT DEFAULT 'active',
  total_requests INTEGER DEFAULT 0,
  successful_removals INTEGER DEFAULT 0,
  failed_removals INTEGER DEFAULT 0,
  success_rate NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- RLS POLICIES - PHASE 10
-- ============================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY "Users can view organizations they belong to"
  ON public.organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Organization owners can update"
  ON public.organizations FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Users can create organizations"
  ON public.organizations FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Organization members policies
CREATE POLICY "Members can view their organization members"
  ON public.organization_members FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage members"
  ON public.organization_members FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- Activity logs policies
CREATE POLICY "Members can view organization activity"
  ON public.activity_logs FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid()
    ) OR user_id = auth.uid()
  );

-- ============================================
-- RLS POLICIES - PHASE 11
-- ============================================

ALTER TABLE public.threat_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threat_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.darkweb_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compromised_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Threat feeds are public"
  ON public.threat_feeds FOR SELECT
  USING (true);

CREATE POLICY "Threat indicators are public"
  ON public.threat_indicators FOR SELECT
  USING (true);

CREATE POLICY "Users can view own darkweb findings"
  ON public.darkweb_findings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own compromised credentials"
  ON public.compromised_credentials FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES - PHASE 12
-- ============================================

ALTER TABLE public.compliance_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Compliance templates are public"
  ON public.compliance_templates FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can view own compliance reports"
  ON public.compliance_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create compliance reports"
  ON public.compliance_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own evidence collections"
  ON public.evidence_collections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own evidence"
  ON public.evidence_collections FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES - PHASE 13
-- ============================================

ALTER TABLE public.removal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automated_removals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.removal_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Removal templates are public"
  ON public.removal_templates FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can view own automated removals"
  ON public.automated_removals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create automated removals"
  ON public.automated_removals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own campaigns"
  ON public.removal_campaigns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own campaigns"
  ON public.removal_campaigns FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_org_members_org_id ON public.organization_members(organization_id);
CREATE INDEX idx_org_members_user_id ON public.organization_members(user_id);
CREATE INDEX idx_activity_logs_org_id ON public.activity_logs(organization_id);
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_threat_indicators_type ON public.threat_indicators(indicator_type);
CREATE INDEX idx_threat_indicators_value ON public.threat_indicators(indicator_value);
CREATE INDEX idx_darkweb_findings_user_id ON public.darkweb_findings(user_id);
CREATE INDEX idx_compromised_creds_user_id ON public.compromised_credentials(user_id);
CREATE INDEX idx_compliance_reports_user_id ON public.compliance_reports(user_id);
CREATE INDEX idx_automated_removals_user_id ON public.automated_removals(user_id);
CREATE INDEX idx_removal_campaigns_user_id ON public.removal_campaigns(user_id);