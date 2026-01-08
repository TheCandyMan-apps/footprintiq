import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Database,
  Mail,
  Phone,
  Globe,
  Building2,
  CheckCircle,
  XCircle,
  MapPin,
  HelpCircle,
  Clock,
  Users,
  Linkedin,
  AtSign,
  Server,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Info
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface AbstractFinding {
  provider: string;
  kind?: string;
  severity: string;
  confidence: number;
  observedAt: string;
  evidence?: Array<{ key: string; value: string | number | boolean }>;
  meta?: Record<string, any>;
  raw?: Record<string, any>;
  title?: string;
  description?: string;
}

interface AbstractAPIPanelProps {
  findings: AbstractFinding[];
  target?: string;
  className?: string;
}

// Quality meter component
function QualityMeter({ score, label, size = "default" }: { score: number; label: string; size?: "default" | "large" }) {
  const getColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-lime-500";
    if (score >= 40) return "bg-yellow-500";
    if (score >= 20) return "bg-orange-500";
    return "bg-red-500";
  };

  const getTextColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-lime-500";
    if (score >= 40) return "text-yellow-500";
    if (score >= 20) return "text-orange-500";
    return "text-red-500";
  };

  const getQualityLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    if (score >= 20) return "Poor";
    return "Bad";
  };

  return (
    <div className={cn("space-y-1", size === "large" ? "space-y-2" : "")}>
      <div className="flex items-center justify-between">
        <span className={cn("text-muted-foreground", size === "large" ? "text-sm" : "text-xs")}>{label}</span>
        <span className={cn("font-bold", getTextColor(score), size === "large" ? "text-lg" : "text-sm")}>
          {score}/100
        </span>
      </div>
      <div className={cn("relative w-full overflow-hidden rounded-full bg-secondary/50", size === "large" ? "h-3" : "h-2")}>
        <div 
          className={cn("h-full transition-all duration-500", getColor(score))}
          style={{ width: `${score}%` }}
        />
      </div>
      <div className="flex justify-between">
        <span className={cn("text-xs", getTextColor(score))}>{getQualityLabel(score)}</span>
      </div>
    </div>
  );
}

// Status indicator component
function StatusIndicator({ 
  status, 
  label, 
  icon: Icon,
  variant = "neutral"
}: { 
  status: boolean | null; 
  label: string; 
  icon: React.ElementType;
  variant?: "neutral" | "success" | "warning" | "danger"
}) {
  if (status === null) return null;
  
  const variants = {
    neutral: status 
      ? "bg-muted text-foreground border-border" 
      : "bg-muted/50 text-muted-foreground border-muted",
    success: status 
      ? "bg-green-500/10 text-green-600 border-green-500/30" 
      : "bg-muted/50 text-muted-foreground border-muted",
    warning: status 
      ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/30" 
      : "bg-muted/50 text-muted-foreground border-muted",
    danger: status 
      ? "bg-red-500/10 text-red-600 border-red-500/30" 
      : "bg-muted/50 text-muted-foreground border-muted",
  };

  return (
    <Badge variant="outline" className={cn("gap-1.5", variants[variant])}>
      <Icon className="h-3 w-3" />
      {label}
      {status ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3 opacity-50" />}
    </Badge>
  );
}

// Info row component
function InfoRow({ label, value, icon: Icon }: { label: string; value: string | number | null | undefined; icon?: React.ElementType }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

// Extract metrics from Abstract API findings
function extractAbstractMetrics(findings: AbstractFinding[]) {
  const metrics = {
    // Email validation metrics
    emailValid: null as boolean | null,
    emailDeliverable: null as string | null,
    emailDisposable: null as boolean | null,
    emailFreeEmail: null as boolean | null,
    emailRoleEmail: null as boolean | null,
    emailMxFound: null as boolean | null,
    emailSmtpValid: null as boolean | null,
    emailCatchAll: null as boolean | null,
    emailFormat: null as string | null,
    emailQualityScore: null as number | null,
    
    // Email reputation metrics
    reputationScore: null as number | null,
    reputationAbuseDetected: null as boolean | null,
    reputationSpamTrap: null as boolean | null,
    reputationEngagement: null as string | null,
    
    // Phone metrics
    phoneValid: null as boolean | null,
    phoneCountry: null as string | null,
    phoneCarrier: null as string | null,
    phoneLineType: null as string | null,
    phoneInternational: null as string | null,
    phoneLocal: null as string | null,
    
    // IP Geo metrics
    ipCity: null as string | null,
    ipRegion: null as string | null,
    ipCountry: null as string | null,
    ipCountryCode: null as string | null,
    ipTimezone: null as string | null,
    ipIsp: null as string | null,
    ipOrganization: null as string | null,
    
    // Company metrics
    companyName: null as string | null,
    companyIndustry: null as string | null,
    companyCountry: null as string | null,
    companyFounded: null as number | null,
    companyEmployees: null as number | null,
    companyLinkedin: null as string | null,
    
    // Counts
    totalFindings: findings.length,
    criticalCount: 0,
    highCount: 0,
    mediumCount: 0,
    lowCount: 0,
    infoCount: 0,
  };

  for (const finding of findings) {
    // Count severities
    const sev = finding.severity?.toLowerCase();
    if (sev === 'critical') metrics.criticalCount++;
    else if (sev === 'high') metrics.highCount++;
    else if (sev === 'medium') metrics.mediumCount++;
    else if (sev === 'low') metrics.lowCount++;
    else metrics.infoCount++;

    const provider = finding.provider?.toLowerCase() || '';
    const raw = finding.raw || finding.meta || {};
    const evidence = finding.evidence || [];
    
    // Helper to get evidence value
    const getEvidence = (key: string): any => {
      const item = evidence.find(e => e.key?.toLowerCase() === key.toLowerCase());
      return item?.value;
    };

    // Email validation findings
    if (provider.includes('abstract') && (provider.includes('email') || provider.includes('mail')) && !provider.includes('reputation')) {
      metrics.emailValid = raw.is_valid_format?.value ?? raw.valid ?? getEvidence('valid') ?? metrics.emailValid;
      metrics.emailDeliverable = raw.deliverability ?? getEvidence('deliverability') ?? metrics.emailDeliverable;
      metrics.emailDisposable = raw.is_disposable_email?.value ?? raw.disposable ?? getEvidence('disposable') ?? metrics.emailDisposable;
      metrics.emailFreeEmail = raw.is_free_email?.value ?? raw.free_email ?? getEvidence('free email') ?? metrics.emailFreeEmail;
      metrics.emailRoleEmail = raw.is_role_email?.value ?? raw.role_email ?? getEvidence('role email') ?? metrics.emailRoleEmail;
      metrics.emailMxFound = raw.is_mx_found?.value ?? raw.mx_found ?? getEvidence('mx found') ?? metrics.emailMxFound;
      metrics.emailSmtpValid = raw.is_smtp_valid?.value ?? raw.smtp_valid ?? getEvidence('smtp valid') ?? metrics.emailSmtpValid;
      metrics.emailCatchAll = raw.is_catchall_email?.value ?? raw.catchall ?? getEvidence('catch-all') ?? metrics.emailCatchAll;
      metrics.emailFormat = raw.email ?? getEvidence('email') ?? metrics.emailFormat;
      metrics.emailQualityScore = raw.quality_score ?? getEvidence('quality score') ?? metrics.emailQualityScore;
    }

    // Email reputation findings
    if (provider.includes('abstract') && provider.includes('reputation')) {
      metrics.reputationScore = raw.score ?? raw.quality_score ?? getEvidence('score') ?? metrics.reputationScore;
      metrics.reputationAbuseDetected = raw.abuse_detected ?? getEvidence('abuse detected') ?? metrics.reputationAbuseDetected;
      metrics.reputationSpamTrap = raw.spam_trap ?? getEvidence('spam trap') ?? metrics.reputationSpamTrap;
      metrics.reputationEngagement = raw.engagement ?? getEvidence('engagement') ?? metrics.reputationEngagement;
    }

    // Phone findings
    if (provider.includes('abstract') && provider.includes('phone')) {
      metrics.phoneValid = raw.valid ?? getEvidence('valid') ?? metrics.phoneValid;
      metrics.phoneCountry = raw.country?.name ?? getEvidence('country') ?? metrics.phoneCountry;
      metrics.phoneCarrier = raw.carrier ?? getEvidence('carrier') ?? metrics.phoneCarrier;
      metrics.phoneLineType = raw.line_type ?? getEvidence('line type') ?? metrics.phoneLineType;
      metrics.phoneInternational = raw.format?.international ?? getEvidence('international') ?? metrics.phoneInternational;
      metrics.phoneLocal = raw.format?.local ?? getEvidence('local') ?? metrics.phoneLocal;
    }

    // IP Geo findings
    if (provider.includes('abstract') && (provider.includes('ip') || provider.includes('geo'))) {
      metrics.ipCity = raw.city ?? getEvidence('city') ?? metrics.ipCity;
      metrics.ipRegion = raw.region ?? getEvidence('region') ?? metrics.ipRegion;
      metrics.ipCountry = raw.country ?? getEvidence('country') ?? metrics.ipCountry;
      metrics.ipCountryCode = raw.country_code ?? getEvidence('country code') ?? metrics.ipCountryCode;
      metrics.ipTimezone = raw.timezone?.name ?? getEvidence('timezone') ?? metrics.ipTimezone;
      metrics.ipIsp = raw.connection?.isp ?? getEvidence('isp') ?? metrics.ipIsp;
      metrics.ipOrganization = raw.connection?.organization ?? getEvidence('organization') ?? metrics.ipOrganization;
    }

    // Company findings
    if (provider.includes('abstract') && provider.includes('company')) {
      metrics.companyName = raw.name ?? getEvidence('name') ?? metrics.companyName;
      metrics.companyIndustry = raw.industry ?? getEvidence('industry') ?? metrics.companyIndustry;
      metrics.companyCountry = raw.country ?? getEvidence('country') ?? metrics.companyCountry;
      metrics.companyFounded = raw.year_founded ?? getEvidence('founded') ?? metrics.companyFounded;
      metrics.companyEmployees = raw.employees_count ?? getEvidence('employees') ?? metrics.companyEmployees;
      metrics.companyLinkedin = raw.linkedin_url ?? getEvidence('linkedin') ?? metrics.companyLinkedin;
    }
  }

  return metrics;
}

// Calculate overall data quality score
function calculateDataQuality(metrics: ReturnType<typeof extractAbstractMetrics>): number {
  let score = 50; // Base score
  let factors = 0;

  // Email factors
  if (metrics.emailValid !== null) {
    factors++;
    if (metrics.emailValid) score += 10;
    else score -= 20;
  }
  if (metrics.emailDisposable) score -= 15;
  if (metrics.emailSmtpValid) score += 10;
  if (metrics.emailMxFound) score += 5;
  if (metrics.emailRoleEmail) score -= 5;

  // Reputation factors
  if (metrics.reputationScore !== null) {
    factors++;
    score += (metrics.reputationScore - 50) * 0.3;
  }
  if (metrics.reputationAbuseDetected) score -= 25;
  if (metrics.reputationSpamTrap) score -= 30;

  // Phone factors
  if (metrics.phoneValid !== null) {
    factors++;
    if (metrics.phoneValid) score += 10;
    else score -= 15;
  }

  // Company/IP add context value
  if (metrics.companyName) score += 5;
  if (metrics.ipCity) score += 3;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function AbstractAPIPanel({ findings, target, className }: AbstractAPIPanelProps) {
  const [activeTab, setActiveTab] = useState<string>("overview");
  
  // Filter for Abstract API findings only
  const abstractFindings = findings.filter(f => 
    f.provider?.toLowerCase().includes('abstract')
  );

  const metrics = extractAbstractMetrics(abstractFindings);
  const dataQuality = calculateDataQuality(metrics);

  // Determine which tabs to show based on available data
  const hasEmail = metrics.emailValid !== null || metrics.emailDeliverable !== null;
  const hasReputation = metrics.reputationScore !== null;
  const hasPhone = metrics.phoneValid !== null || metrics.phoneCarrier !== null;
  const hasIP = metrics.ipCity !== null || metrics.ipCountry !== null;
  const hasCompany = metrics.companyName !== null;

  if (abstractFindings.length === 0) {
    return (
      <Card className={cn("", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Abstract API Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No Abstract API findings available for this scan.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Abstract API Intelligence
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Consolidated intelligence from Abstract API including email validation, phone lookup, IP geolocation, and company enrichment.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {abstractFindings.length} finding{abstractFindings.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Overall Data Quality */}
        <div className="p-4 bg-muted/30 rounded-lg space-y-3">
          <QualityMeter score={dataQuality} label="Data Quality Score" size="large" />
          
          {/* Severity breakdown */}
          <div className="flex flex-wrap gap-2 pt-2">
            {metrics.criticalCount > 0 && (
              <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/30">
                {metrics.criticalCount} Critical
              </Badge>
            )}
            {metrics.highCount > 0 && (
              <Badge className="bg-red-500/10 text-red-600 border-red-500/30">
                {metrics.highCount} High
              </Badge>
            )}
            {metrics.mediumCount > 0 && (
              <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                {metrics.mediumCount} Medium
              </Badge>
            )}
            {metrics.lowCount > 0 && (
              <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30">
                {metrics.lowCount} Low
              </Badge>
            )}
            {metrics.infoCount > 0 && (
              <Badge className="bg-muted text-muted-foreground">
                {metrics.infoCount} Info
              </Badge>
            )}
          </div>
        </div>

        {/* Tabbed Intelligence Sections */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 h-auto">
            <TabsTrigger value="overview" className="text-xs px-2 py-1.5">
              Overview
            </TabsTrigger>
            {hasEmail && (
              <TabsTrigger value="email" className="text-xs px-2 py-1.5">
                <Mail className="h-3 w-3 mr-1" />
                Email
              </TabsTrigger>
            )}
            {hasReputation && (
              <TabsTrigger value="reputation" className="text-xs px-2 py-1.5">
                <ShieldCheck className="h-3 w-3 mr-1" />
                Reputation
              </TabsTrigger>
            )}
            {hasPhone && (
              <TabsTrigger value="phone" className="text-xs px-2 py-1.5">
                <Phone className="h-3 w-3 mr-1" />
                Phone
              </TabsTrigger>
            )}
            {hasIP && (
              <TabsTrigger value="ip" className="text-xs px-2 py-1.5">
                <Globe className="h-3 w-3 mr-1" />
                IP Geo
              </TabsTrigger>
            )}
            {hasCompany && (
              <TabsTrigger value="company" className="text-xs px-2 py-1.5">
                <Building2 className="h-3 w-3 mr-1" />
                Company
              </TabsTrigger>
            )}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {/* Email summary */}
              {hasEmail && (
                <div className="p-3 bg-muted/30 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium">Email Validation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {metrics.emailValid ? (
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/30 text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Valid
                      </Badge>
                    ) : metrics.emailValid === false ? (
                      <Badge className="bg-red-500/10 text-red-600 border-red-500/30 text-xs">
                        <XCircle className="h-3 w-3 mr-1" />
                        Invalid
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">Unknown</Badge>
                    )}
                    {metrics.emailDisposable && (
                      <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30 text-xs">
                        Disposable
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Reputation summary */}
              {hasReputation && (
                <div className="p-3 bg-muted/30 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium">Email Reputation</span>
                  </div>
                  {metrics.reputationScore !== null && (
                    <QualityMeter score={metrics.reputationScore} label="" />
                  )}
                </div>
              )}

              {/* Phone summary */}
              {hasPhone && (
                <div className="p-3 bg-muted/30 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium">Phone Lookup</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {metrics.phoneValid ? (
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/30 text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Valid
                      </Badge>
                    ) : metrics.phoneValid === false ? (
                      <Badge className="bg-red-500/10 text-red-600 border-red-500/30 text-xs">
                        <XCircle className="h-3 w-3 mr-1" />
                        Invalid
                      </Badge>
                    ) : null}
                    {metrics.phoneLineType && (
                      <Badge variant="outline" className="text-xs capitalize">
                        {metrics.phoneLineType}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* IP Geo summary */}
              {hasIP && (
                <div className="p-3 bg-muted/30 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium">IP Geolocation</span>
                  </div>
                  <div className="text-sm">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {[metrics.ipCity, metrics.ipCountry].filter(Boolean).join(', ') || 'Unknown'}
                    </span>
                  </div>
                </div>
              )}

              {/* Company summary */}
              {hasCompany && (
                <div className="p-3 bg-muted/30 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium">Company</span>
                  </div>
                  <div className="text-sm font-medium truncate">
                    {metrics.companyName}
                  </div>
                  {metrics.companyIndustry && (
                    <Badge variant="outline" className="text-xs">
                      {metrics.companyIndustry}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Quick indicators */}
            <div className="flex flex-wrap gap-2">
              <StatusIndicator status={metrics.emailValid} label="Email Valid" icon={Mail} variant="success" />
              <StatusIndicator status={metrics.emailDisposable} label="Disposable" icon={AlertTriangle} variant="warning" />
              <StatusIndicator status={metrics.emailRoleEmail} label="Role Email" icon={AtSign} variant="neutral" />
              <StatusIndicator status={metrics.phoneValid} label="Phone Valid" icon={Phone} variant="success" />
              <StatusIndicator status={metrics.reputationAbuseDetected} label="Abuse Detected" icon={ShieldAlert} variant="danger" />
            </div>
          </TabsContent>

          {/* Email Tab */}
          {hasEmail && (
            <TabsContent value="email" className="mt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Validation Status */}
                  <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Validation Status
                    </h4>
                    <div className="space-y-1">
                      <InfoRow label="Format Valid" value={metrics.emailValid === true ? "Yes" : metrics.emailValid === false ? "No" : null} icon={CheckCircle} />
                      <InfoRow label="Deliverability" value={metrics.emailDeliverable} icon={Info} />
                      <InfoRow label="MX Records Found" value={metrics.emailMxFound === true ? "Yes" : metrics.emailMxFound === false ? "No" : null} icon={Server} />
                      <InfoRow label="SMTP Valid" value={metrics.emailSmtpValid === true ? "Yes" : metrics.emailSmtpValid === false ? "No" : null} icon={CheckCircle} />
                    </div>
                  </div>

                  {/* Email Flags */}
                  <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Email Flags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      <StatusIndicator status={metrics.emailDisposable} label="Disposable" icon={AlertTriangle} variant="warning" />
                      <StatusIndicator status={metrics.emailFreeEmail} label="Free Email" icon={Mail} variant="neutral" />
                      <StatusIndicator status={metrics.emailRoleEmail} label="Role-based" icon={AtSign} variant="neutral" />
                      <StatusIndicator status={metrics.emailCatchAll} label="Catch-all" icon={Mail} variant="neutral" />
                    </div>
                  </div>
                </div>

                {metrics.emailQualityScore !== null && (
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <QualityMeter score={metrics.emailQualityScore} label="Email Quality Score" size="large" />
                  </div>
                )}
              </div>
            </TabsContent>
          )}

          {/* Reputation Tab */}
          {hasReputation && (
            <TabsContent value="reputation" className="mt-4">
              <div className="space-y-4">
                {metrics.reputationScore !== null && (
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <QualityMeter score={metrics.reputationScore} label="Reputation Score" size="large" />
                  </div>
                )}

                <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    Reputation Indicators
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <StatusIndicator status={metrics.reputationAbuseDetected} label="Abuse Detected" icon={ShieldAlert} variant="danger" />
                    <StatusIndicator status={metrics.reputationSpamTrap} label="Spam Trap" icon={AlertTriangle} variant="danger" />
                  </div>
                  {metrics.reputationEngagement && (
                    <InfoRow label="Engagement Level" value={metrics.reputationEngagement} icon={Info} />
                  )}
                </div>
              </div>
            </TabsContent>
          )}

          {/* Phone Tab */}
          {hasPhone && (
            <TabsContent value="phone" className="mt-4">
              <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Details
                </h4>
                <div className="space-y-1">
                  <InfoRow label="Valid" value={metrics.phoneValid === true ? "Yes" : metrics.phoneValid === false ? "No" : null} icon={CheckCircle} />
                  <InfoRow label="International Format" value={metrics.phoneInternational} icon={Phone} />
                  <InfoRow label="Local Format" value={metrics.phoneLocal} icon={Phone} />
                  <InfoRow label="Country" value={metrics.phoneCountry} icon={MapPin} />
                  <InfoRow label="Carrier" value={metrics.phoneCarrier} icon={Server} />
                  <InfoRow label="Line Type" value={metrics.phoneLineType} icon={Info} />
                </div>
              </div>
            </TabsContent>
          )}

          {/* IP Geo Tab */}
          {hasIP && (
            <TabsContent value="ip" className="mt-4">
              <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Geolocation Details
                </h4>
                <div className="space-y-1">
                  <InfoRow label="City" value={metrics.ipCity} icon={MapPin} />
                  <InfoRow label="Region" value={metrics.ipRegion} icon={MapPin} />
                  <InfoRow label="Country" value={metrics.ipCountry} icon={MapPin} />
                  <InfoRow label="Country Code" value={metrics.ipCountryCode} icon={Globe} />
                  <InfoRow label="Timezone" value={metrics.ipTimezone} icon={Clock} />
                  <InfoRow label="ISP" value={metrics.ipIsp} icon={Server} />
                  <InfoRow label="Organization" value={metrics.ipOrganization} icon={Building2} />
                </div>
              </div>
            </TabsContent>
          )}

          {/* Company Tab */}
          {hasCompany && (
            <TabsContent value="company" className="mt-4">
              <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Company Profile
                </h4>
                <div className="space-y-1">
                  <InfoRow label="Name" value={metrics.companyName} icon={Building2} />
                  <InfoRow label="Industry" value={metrics.companyIndustry} icon={Info} />
                  <InfoRow label="Country" value={metrics.companyCountry} icon={MapPin} />
                  <InfoRow label="Founded" value={metrics.companyFounded} icon={Clock} />
                  <InfoRow label="Employees" value={metrics.companyEmployees?.toLocaleString()} icon={Users} />
                </div>
                {metrics.companyLinkedin && (
                  <a 
                    href={metrics.companyLinkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mt-2"
                  >
                    <Linkedin className="h-4 w-4" />
                    View LinkedIn Profile
                  </a>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}
