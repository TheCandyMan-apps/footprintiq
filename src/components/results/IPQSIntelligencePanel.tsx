import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield, 
  Mail, 
  Phone, 
  Globe, 
  Wifi,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Bug,
  Link2,
  MapPin,
  Server,
  Skull,
  Lock,
  Unlock,
  Radio,
  Bot,
  AlertOctagon,
  FileWarning,
  HelpCircle
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface IPQSFinding {
  provider: string;
  kind: string;
  severity: string;
  confidence: number;
  observedAt: string;
  evidence?: Array<{ key: string; value: string }>;
  meta?: Record<string, any>;
}

interface IPQSIntelligencePanelProps {
  findings: IPQSFinding[];
  target?: string;
  scanType?: 'email' | 'phone' | 'ip' | 'url' | 'mixed';
  className?: string;
}

// Risk meter component
function RiskMeter({ score, label, size = "default" }: { score: number; label: string; size?: "default" | "large" }) {
  const getColor = (score: number) => {
    if (score >= 85) return "bg-red-500";
    if (score >= 60) return "bg-orange-500";
    if (score >= 40) return "bg-yellow-500";
    if (score >= 20) return "bg-lime-500";
    return "bg-green-500";
  };

  const getTextColor = (score: number) => {
    if (score >= 85) return "text-red-500";
    if (score >= 60) return "text-orange-500";
    if (score >= 40) return "text-yellow-500";
    if (score >= 20) return "text-lime-500";
    return "text-green-500";
  };

  const getRiskLabel = (score: number) => {
    if (score >= 85) return "Critical";
    if (score >= 60) return "High";
    if (score >= 40) return "Medium";
    if (score >= 20) return "Low";
    return "Safe";
  };

  return (
    <div className={cn("space-y-1", size === "large" ? "space-y-2" : "")}>
      <div className="flex items-center justify-between">
        <span className={cn("text-muted-foreground", size === "large" ? "text-sm" : "text-xs")}>{label}</span>
        <span className={cn("font-bold", getTextColor(score), size === "large" ? "text-lg" : "text-sm")}>
          {score}/100
        </span>
      </div>
      {/* Custom progress bar with dynamic color */}
      <div className={cn("relative w-full overflow-hidden rounded-full bg-secondary/50", size === "large" ? "h-3" : "h-2")}>
        <div 
          className={cn("h-full transition-all duration-500", getColor(score))}
          style={{ width: `${score}%` }}
        />
      </div>
      <div className="flex justify-between">
        <span className={cn("text-xs", getTextColor(score))}>{getRiskLabel(score)}</span>
      </div>
    </div>
  );
}

// Indicator badge component
function IndicatorBadge({ 
  detected, 
  label, 
  icon: Icon,
  severity = "neutral"
}: { 
  detected: boolean; 
  label: string; 
  icon: React.ElementType;
  severity?: "neutral" | "warning" | "danger" | "success"
}) {
  const variants = {
    neutral: detected 
      ? "bg-muted text-foreground border-border" 
      : "bg-muted/50 text-muted-foreground border-muted",
    warning: detected 
      ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/30" 
      : "bg-muted/50 text-muted-foreground border-muted",
    danger: detected 
      ? "bg-red-500/10 text-red-600 border-red-500/30" 
      : "bg-muted/50 text-muted-foreground border-muted",
    success: detected 
      ? "bg-green-500/10 text-green-600 border-green-500/30" 
      : "bg-muted/50 text-muted-foreground border-muted",
  };

  return (
    <Badge variant="outline" className={cn("gap-1.5", variants[severity])}>
      <Icon className="h-3 w-3" />
      {label}
      {detected ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3 opacity-50" />}
    </Badge>
  );
}

// Extract consolidated metrics from all IPQS findings
function extractIPQSMetrics(findings: IPQSFinding[]) {
  const metrics = {
    // Email metrics
    emailValid: null as boolean | null,
    emailFraudScore: null as number | null,
    emailDisposable: false,
    emailLeaked: false,
    emailRecentAbuse: false,
    emailSpamTrap: false,
    emailDeliverability: null as string | null,
    
    // Phone metrics
    phoneValid: null as boolean | null,
    phoneFraudScore: null as number | null,
    phoneVoip: false,
    phoneLeaked: false,
    phoneRecentAbuse: false,
    phoneSpammer: false,
    phoneCarrier: null as string | null,
    phoneLineType: null as string | null,
    phoneLocation: null as string | null,
    
    // IP metrics
    ipFraudScore: null as number | null,
    ipVpn: false,
    ipProxy: false,
    ipTor: false,
    ipBot: false,
    ipRecentAbuse: false,
    ipCountry: null as string | null,
    ipCity: null as string | null,
    ipIsp: null as string | null,
    ipOrg: null as string | null,
    ipConnectionType: null as string | null,
    
    // URL metrics
    urlRiskScore: null as number | null,
    urlPhishing: false,
    urlMalware: false,
    urlSuspicious: false,
    urlSpam: false,
    urlParking: false,
    urlAdult: false,
    urlDomain: null as string | null,
    urlCategory: null as string | null,
    urlDomainAge: null as string | null,
    
    // Dark web metrics
    darkwebFound: false,
    darkwebPlainText: false,
    darkwebSource: null as string | null,
    darkwebFirstSeen: null as string | null,
    darkwebLastSeen: null as string | null,
    
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
    if (finding.severity === 'critical') metrics.criticalCount++;
    else if (finding.severity === 'high') metrics.highCount++;
    else if (finding.severity === 'medium') metrics.mediumCount++;
    else if (finding.severity === 'low') metrics.lowCount++;
    else metrics.infoCount++;

    const provider = finding.provider?.toLowerCase() || '';
    const kind = finding.kind?.toLowerCase() || '';
    const meta = finding.meta || {};

    // Email findings
    if (provider.includes('ipqs_email') || kind.startsWith('email.')) {
      if (meta.valid !== undefined) metrics.emailValid = meta.valid;
      if (meta.fraud_score !== undefined) metrics.emailFraudScore = meta.fraud_score;
      if (meta.deliverability) metrics.emailDeliverability = meta.deliverability;
      if (kind.includes('disposable') || meta.disposable) metrics.emailDisposable = true;
      if (kind.includes('leaked') || meta.leaked) metrics.emailLeaked = true;
      if (kind.includes('abuse') || meta.recent_abuse) metrics.emailRecentAbuse = true;
      if (kind.includes('spam_trap') || meta.honeypot) metrics.emailSpamTrap = true;
    }

    // Phone findings
    if (provider.includes('ipqs_phone') || kind.startsWith('phone.')) {
      if (meta.valid !== undefined) metrics.phoneValid = meta.valid;
      if (meta.fraud_score !== undefined) metrics.phoneFraudScore = meta.fraud_score;
      if (meta.carrier) metrics.phoneCarrier = meta.carrier;
      if (meta.line_type) metrics.phoneLineType = meta.line_type;
      const location = [meta.city, meta.region, meta.country].filter(Boolean).join(', ');
      if (location) metrics.phoneLocation = location;
      if (kind.includes('voip') || meta.voip) metrics.phoneVoip = true;
      if (kind.includes('leaked') || meta.leaked) metrics.phoneLeaked = true;
      if (kind.includes('abuse') || meta.recent_abuse) metrics.phoneRecentAbuse = true;
      if (kind.includes('spammer') || meta.spammer) metrics.phoneSpammer = true;
    }

    // IP findings
    if (provider.includes('ipqs_ip') || kind.startsWith('ip.')) {
      if (meta.fraud_score !== undefined) metrics.ipFraudScore = meta.fraud_score;
      if (meta.country_code) metrics.ipCountry = meta.country_code;
      if (meta.city) metrics.ipCity = meta.city;
      if (meta.isp) metrics.ipIsp = meta.isp;
      if (meta.organization) metrics.ipOrg = meta.organization;
      if (meta.connection_type) metrics.ipConnectionType = meta.connection_type;
      if (kind.includes('vpn') || meta.vpn) metrics.ipVpn = true;
      if (kind.includes('proxy') || meta.proxy) metrics.ipProxy = true;
      if (kind.includes('tor') || meta.tor) metrics.ipTor = true;
      if (kind.includes('bot') || meta.bot || meta.crawler) metrics.ipBot = true;
      if (kind.includes('abuse') || meta.recent_abuse) metrics.ipRecentAbuse = true;
    }

    // URL findings
    if (provider.includes('ipqs_url') || kind.startsWith('url.')) {
      if (meta.risk_score !== undefined) metrics.urlRiskScore = meta.risk_score;
      if (meta.domain) metrics.urlDomain = meta.domain;
      if (meta.category) metrics.urlCategory = meta.category;
      if (meta.domain_age?.human) metrics.urlDomainAge = meta.domain_age.human;
      if (kind.includes('phishing') || meta.phishing) metrics.urlPhishing = true;
      if (kind.includes('malware') || meta.malware) metrics.urlMalware = true;
      if (kind.includes('suspicious') || meta.suspicious) metrics.urlSuspicious = true;
      if (kind.includes('spam') || meta.spamming) metrics.urlSpam = true;
      if (kind.includes('parking') || meta.parking) metrics.urlParking = true;
      if (kind.includes('adult') || meta.adult) metrics.urlAdult = true;
    }

    // Dark web findings
    if (provider.includes('ipqs_darkweb') || kind.startsWith('darkweb.')) {
      if (kind.includes('exposure') || (meta.found && !kind.includes('clear'))) {
        metrics.darkwebFound = true;
      }
      if (kind.includes('plaintext') || meta.plain_text) metrics.darkwebPlainText = true;
      if (meta.source) metrics.darkwebSource = meta.source;
      if (meta.first_seen?.human) metrics.darkwebFirstSeen = meta.first_seen.human;
      if (meta.last_seen?.human) metrics.darkwebLastSeen = meta.last_seen.human;
    }
  }

  return metrics;
}

// Calculate overall risk score
function calculateOverallRisk(metrics: ReturnType<typeof extractIPQSMetrics>): number {
  const scores: number[] = [];
  
  if (metrics.emailFraudScore !== null) scores.push(metrics.emailFraudScore);
  if (metrics.phoneFraudScore !== null) scores.push(metrics.phoneFraudScore);
  if (metrics.ipFraudScore !== null) scores.push(metrics.ipFraudScore);
  if (metrics.urlRiskScore !== null) scores.push(metrics.urlRiskScore);

  // Add penalty scores for critical indicators
  let penalty = 0;
  if (metrics.emailLeaked || metrics.phoneLeaked || metrics.darkwebFound) penalty += 15;
  if (metrics.darkwebPlainText) penalty += 25;
  if (metrics.urlPhishing || metrics.urlMalware) penalty += 30;
  if (metrics.ipTor) penalty += 20;
  if (metrics.emailRecentAbuse || metrics.phoneRecentAbuse || metrics.ipRecentAbuse) penalty += 10;

  if (scores.length === 0) return Math.min(penalty, 100);
  
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  return Math.min(Math.round(avgScore + penalty), 100);
}

export function IPQSIntelligencePanel({ findings, target, scanType = 'mixed', className }: IPQSIntelligencePanelProps) {
  const [activeTab, setActiveTab] = useState<string>("overview");
  
  // Filter for IPQS findings only
  const ipqsFindings = findings.filter(f => 
    f.provider?.toLowerCase().includes('ipqs') ||
    f.provider?.toLowerCase() === 'ipqualityscore'
  );

  const metrics = extractIPQSMetrics(ipqsFindings);
  const overallRisk = calculateOverallRisk(metrics);

  // Determine which tabs to show based on available data
  const hasEmail = metrics.emailFraudScore !== null || metrics.emailDisposable || metrics.emailLeaked;
  const hasPhone = metrics.phoneFraudScore !== null || metrics.phoneVoip || metrics.phoneCarrier;
  const hasIP = metrics.ipFraudScore !== null || metrics.ipVpn || metrics.ipProxy || metrics.ipTor;
  const hasURL = metrics.urlRiskScore !== null || metrics.urlPhishing || metrics.urlMalware;
  const hasDarkWeb = metrics.darkwebFound || ipqsFindings.some(f => f.provider?.includes('darkweb'));

  if (ipqsFindings.length === 0) {
    return (
      <Card className={cn("", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            IPQS Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No IPQS findings available for this scan.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            IPQS Intelligence
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Consolidated intelligence from IPQualityScore APIs including email, phone, IP, URL, and dark web analysis.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {ipqsFindings.length} finding{ipqsFindings.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Overall Risk Meter */}
        <div className="p-4 bg-muted/30 rounded-lg space-y-3">
          <RiskMeter score={overallRisk} label="Overall Risk Score" size="large" />
          
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
            {hasPhone && (
              <TabsTrigger value="phone" className="text-xs px-2 py-1.5">
                <Phone className="h-3 w-3 mr-1" />
                Phone
              </TabsTrigger>
            )}
            {hasIP && (
              <TabsTrigger value="ip" className="text-xs px-2 py-1.5">
                <Wifi className="h-3 w-3 mr-1" />
                IP
              </TabsTrigger>
            )}
            {hasURL && (
              <TabsTrigger value="url" className="text-xs px-2 py-1.5">
                <Link2 className="h-3 w-3 mr-1" />
                URL
              </TabsTrigger>
            )}
            {hasDarkWeb && (
              <TabsTrigger value="darkweb" className="text-xs px-2 py-1.5">
                <Skull className="h-3 w-3 mr-1" />
                Dark Web
              </TabsTrigger>
            )}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {/* Quick indicators */}
              {hasEmail && metrics.emailFraudScore !== null && (
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Email</span>
                  </div>
                  <RiskMeter score={metrics.emailFraudScore} label="" />
                </div>
              )}
              {hasPhone && metrics.phoneFraudScore !== null && (
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Phone</span>
                  </div>
                  <RiskMeter score={metrics.phoneFraudScore} label="" />
                </div>
              )}
              {hasIP && metrics.ipFraudScore !== null && (
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Wifi className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">IP</span>
                  </div>
                  <RiskMeter score={metrics.ipFraudScore} label="" />
                </div>
              )}
              {hasURL && metrics.urlRiskScore !== null && (
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Link2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">URL</span>
                  </div>
                  <RiskMeter score={metrics.urlRiskScore} label="" />
                </div>
              )}
            </div>

            {/* Critical indicators */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Key Indicators</h4>
              <div className="flex flex-wrap gap-2">
                {metrics.darkwebFound && (
                  <IndicatorBadge detected={true} label="Dark Web Exposure" icon={Skull} severity="danger" />
                )}
                {metrics.darkwebPlainText && (
                  <IndicatorBadge detected={true} label="Plain Text Password" icon={Unlock} severity="danger" />
                )}
                {metrics.urlPhishing && (
                  <IndicatorBadge detected={true} label="Phishing" icon={AlertOctagon} severity="danger" />
                )}
                {metrics.urlMalware && (
                  <IndicatorBadge detected={true} label="Malware" icon={Bug} severity="danger" />
                )}
                {metrics.ipTor && (
                  <IndicatorBadge detected={true} label="Tor Exit Node" icon={EyeOff} severity="danger" />
                )}
                {metrics.ipVpn && (
                  <IndicatorBadge detected={true} label="VPN" icon={Eye} severity="warning" />
                )}
                {metrics.ipProxy && (
                  <IndicatorBadge detected={true} label="Proxy" icon={Server} severity="warning" />
                )}
                {metrics.emailDisposable && (
                  <IndicatorBadge detected={true} label="Disposable Email" icon={FileWarning} severity="warning" />
                )}
                {metrics.phoneVoip && (
                  <IndicatorBadge detected={true} label="VoIP" icon={Radio} severity="neutral" />
                )}
                {metrics.ipBot && (
                  <IndicatorBadge detected={true} label="Bot/Crawler" icon={Bot} severity="neutral" />
                )}
                {!metrics.darkwebFound && !metrics.urlPhishing && !metrics.urlMalware && !metrics.ipTor && (
                  <IndicatorBadge detected={true} label="No Critical Threats" icon={Shield} severity="success" />
                )}
              </div>
            </div>
          </TabsContent>

          {/* Email Tab */}
          {hasEmail && (
            <TabsContent value="email" className="space-y-4 mt-4">
              {metrics.emailFraudScore !== null && (
                <RiskMeter score={metrics.emailFraudScore} label="Email Fraud Score" size="large" />
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Valid</span>
                  <p className="font-medium">{metrics.emailValid === null ? 'Unknown' : metrics.emailValid ? 'Yes' : 'No'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Deliverability</span>
                  <p className="font-medium capitalize">{metrics.emailDeliverability || 'Unknown'}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <IndicatorBadge detected={metrics.emailDisposable} label="Disposable" icon={FileWarning} severity="warning" />
                <IndicatorBadge detected={metrics.emailLeaked} label="Leaked" icon={Unlock} severity="danger" />
                <IndicatorBadge detected={metrics.emailRecentAbuse} label="Recent Abuse" icon={AlertTriangle} severity="danger" />
                <IndicatorBadge detected={metrics.emailSpamTrap} label="Spam Trap" icon={AlertOctagon} severity="warning" />
              </div>
            </TabsContent>
          )}

          {/* Phone Tab */}
          {hasPhone && (
            <TabsContent value="phone" className="space-y-4 mt-4">
              {metrics.phoneFraudScore !== null && (
                <RiskMeter score={metrics.phoneFraudScore} label="Phone Fraud Score" size="large" />
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Carrier</span>
                  <p className="font-medium">{metrics.phoneCarrier || 'Unknown'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Line Type</span>
                  <p className="font-medium capitalize">{metrics.phoneLineType || 'Unknown'}</p>
                </div>
                {metrics.phoneLocation && (
                  <div className="col-span-2 space-y-1">
                    <span className="text-xs text-muted-foreground">Location</span>
                    <p className="font-medium flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {metrics.phoneLocation}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <IndicatorBadge detected={metrics.phoneVoip} label="VoIP" icon={Radio} severity="neutral" />
                <IndicatorBadge detected={metrics.phoneLeaked} label="Leaked" icon={Unlock} severity="danger" />
                <IndicatorBadge detected={metrics.phoneRecentAbuse} label="Recent Abuse" icon={AlertTriangle} severity="danger" />
                <IndicatorBadge detected={metrics.phoneSpammer} label="Spammer" icon={AlertOctagon} severity="warning" />
              </div>
            </TabsContent>
          )}

          {/* IP Tab */}
          {hasIP && (
            <TabsContent value="ip" className="space-y-4 mt-4">
              {metrics.ipFraudScore !== null && (
                <RiskMeter score={metrics.ipFraudScore} label="IP Fraud Score" size="large" />
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Country</span>
                  <p className="font-medium">{metrics.ipCountry || 'Unknown'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">City</span>
                  <p className="font-medium">{metrics.ipCity || 'Unknown'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">ISP</span>
                  <p className="font-medium">{metrics.ipIsp || 'Unknown'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Connection</span>
                  <p className="font-medium capitalize">{metrics.ipConnectionType || 'Unknown'}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <IndicatorBadge detected={metrics.ipVpn} label="VPN" icon={Eye} severity="warning" />
                <IndicatorBadge detected={metrics.ipProxy} label="Proxy" icon={Server} severity="warning" />
                <IndicatorBadge detected={metrics.ipTor} label="Tor" icon={EyeOff} severity="danger" />
                <IndicatorBadge detected={metrics.ipBot} label="Bot/Crawler" icon={Bot} severity="neutral" />
                <IndicatorBadge detected={metrics.ipRecentAbuse} label="Recent Abuse" icon={AlertTriangle} severity="danger" />
              </div>
            </TabsContent>
          )}

          {/* URL Tab */}
          {hasURL && (
            <TabsContent value="url" className="space-y-4 mt-4">
              {metrics.urlRiskScore !== null && (
                <RiskMeter score={metrics.urlRiskScore} label="URL Risk Score" size="large" />
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Domain</span>
                  <p className="font-medium font-mono text-sm">{metrics.urlDomain || 'Unknown'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Category</span>
                  <p className="font-medium capitalize">{metrics.urlCategory || 'Unknown'}</p>
                </div>
                <div className="col-span-2 space-y-1">
                  <span className="text-xs text-muted-foreground">Domain Age</span>
                  <p className="font-medium">{metrics.urlDomainAge || 'Unknown'}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <IndicatorBadge detected={metrics.urlPhishing} label="Phishing" icon={AlertOctagon} severity="danger" />
                <IndicatorBadge detected={metrics.urlMalware} label="Malware" icon={Bug} severity="danger" />
                <IndicatorBadge detected={metrics.urlSuspicious} label="Suspicious" icon={AlertTriangle} severity="warning" />
                <IndicatorBadge detected={metrics.urlSpam} label="Spam" icon={FileWarning} severity="warning" />
                <IndicatorBadge detected={metrics.urlParking} label="Parked" icon={Globe} severity="neutral" />
                <IndicatorBadge detected={metrics.urlAdult} label="Adult" icon={Lock} severity="neutral" />
              </div>
            </TabsContent>
          )}

          {/* Dark Web Tab */}
          {hasDarkWeb && (
            <TabsContent value="darkweb" className="space-y-4 mt-4">
              <div className={cn(
                "p-4 rounded-lg flex items-center gap-3",
                metrics.darkwebFound 
                  ? "bg-red-500/10 border border-red-500/30" 
                  : "bg-green-500/10 border border-green-500/30"
              )}>
                {metrics.darkwebFound ? (
                  <>
                    <Skull className="h-6 w-6 text-red-500" />
                    <div>
                      <p className="font-medium text-red-500">Dark Web Exposure Detected</p>
                      <p className="text-sm text-muted-foreground">
                        Credentials found in breach databases
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    <div>
                      <p className="font-medium text-green-500">No Dark Web Exposure</p>
                      <p className="text-sm text-muted-foreground">
                        No credentials found in known breach databases
                      </p>
                    </div>
                  </>
                )}
              </div>

              {metrics.darkwebFound && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    {metrics.darkwebSource && (
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">Source</span>
                        <p className="font-medium">{metrics.darkwebSource}</p>
                      </div>
                    )}
                    {metrics.darkwebFirstSeen && (
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">First Seen</span>
                        <p className="font-medium">{metrics.darkwebFirstSeen}</p>
                      </div>
                    )}
                    {metrics.darkwebLastSeen && (
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">Last Seen</span>
                        <p className="font-medium">{metrics.darkwebLastSeen}</p>
                      </div>
                    )}
                  </div>

                  {metrics.darkwebPlainText && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <div className="flex items-center gap-2 text-red-500">
                        <Unlock className="h-4 w-4" />
                        <span className="font-medium">Plain Text Password Exposed</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Credentials were stored or leaked in plain text. Immediate password change required.
                      </p>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          )}
        </Tabs>

        {/* Provider attribution */}
        <div className="pt-3 border-t border-border/50">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Powered by IPQualityScore
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
