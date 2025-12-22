import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Phone, 
  Smartphone, 
  Radio, 
  AlertTriangle, 
  Shield, 
  Building, 
  HelpCircle,
  CheckCircle,
  XCircle,
  SkipForward,
  Settings,
  Lock
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Finding } from "@/lib/ufm";

export interface ProviderStatusSummary {
  success: number;
  failed: number;
  skipped: number;
  notConfigured: number;
  tierRestricted: number;
  limitExceeded: number;
  total: number;
}

interface PhoneIntelligenceCardProps {
  phone: string;
  findings: Finding[];
  providerStatuses?: ProviderStatusSummary;
  className?: string;
}

interface PhoneMetrics {
  lineType: string;
  carrier: string;
  country: string;
  isVoip: boolean;
  isDisposable: boolean;
  whatsapp: boolean;
  telegram: boolean;
  signal: boolean;
  fraudScore: number | null;
  riskLevel: 'low' | 'medium' | 'high';
  brokerCount: number;
}

function extractPhoneMetrics(findings: Finding[]): PhoneMetrics {
  const metrics: PhoneMetrics = {
    lineType: 'Unknown',
    carrier: 'Unknown',
    country: 'Unknown',
    isVoip: false,
    isDisposable: false,
    whatsapp: false,
    telegram: false,
    signal: false,
    fraudScore: null,
    riskLevel: 'low',
    brokerCount: 0,
  };

  for (const finding of findings) {
    // Check for carrier intelligence from various sources
    // IPQS uses kind like 'phone.validation', other providers use 'Carrier Intelligence'
    const isCarrierFinding = 
      finding.providerCategory === 'Carrier Intelligence' ||
      finding.providerCategory?.startsWith('phone.') ||
      finding.provider?.toLowerCase().includes('ipqs') ||
      finding.provider?.toLowerCase().includes('numverify') ||
      finding.provider?.toLowerCase().includes('abstract_phone') ||
      finding.provider?.toLowerCase().includes('twilio');
    
    if (isCarrierFinding) {
      for (const ev of finding.evidence || []) {
        const key = ev.key?.toLowerCase() || '';
        const value = String(ev.value || '');
        
        if (key === 'line type' || key === 'line_type' || key === 'linetype') {
          if (value && value !== 'N/A') metrics.lineType = value;
        }
        if (key === 'carrier' || key === 'carrier_name' || key === 'name') {
          if (value && value !== 'N/A') metrics.carrier = value;
        }
        if (key === 'country' || key === 'location' || key === 'country_code') {
          if (value && value !== 'N/A') {
            // Parse "N/A, United Kingdom, GB" format
            if (value.includes(',')) {
              const parts = value.split(',').map(s => s.trim()).filter(s => s && s !== 'N/A');
              metrics.country = parts[parts.length - 1] || parts[0] || value;
            } else {
              metrics.country = value;
            }
          }
        }
        if (key === 'is voip' || key === 'is_voip' || key === 'voip') {
          metrics.isVoip = value === 'true' || value === 'Yes';
        }
        if (key === 'is disposable' || key === 'is_disposable' || key === 'disposable') {
          metrics.isDisposable = value === 'true' || value === 'Yes';
        }
        if (key === 'fraud score' || key === 'fraud_score' || key === 'fraudscore' || key === 'risk_score') {
          if (value && value !== 'N/A') {
            const score = parseInt(value, 10);
            if (!isNaN(score)) metrics.fraudScore = score;
          }
        }
      }
    }
    
    // Check for messaging presence from various providers/formats
    const isMessagingFinding = 
      finding.providerCategory === 'Messaging Presence' ||
      finding.providerCategory?.toLowerCase().startsWith('messaging') ||
      finding.provider?.toLowerCase().includes('whatsapp') ||
      finding.provider?.toLowerCase().includes('telegram') ||
      finding.provider?.toLowerCase().includes('signal') ||
      finding.provider?.toLowerCase() === 'whatsapp_check' ||
      finding.provider?.toLowerCase() === 'telegram_check' ||
      finding.provider?.toLowerCase() === 'signal_check';
    
    if (isMessagingFinding) {
      for (const ev of finding.evidence || []) {
        const key = ev.key?.toLowerCase() || '';
        const value = String(ev.value || '').toLowerCase();
        
        // Check for WhatsApp
        if (key === 'whatsapp' || key.includes('whatsapp')) {
          metrics.whatsapp = value === 'true' || value === 'yes' || value === 'detected' || value === 'present';
        }
        // Check for Telegram
        if (key === 'telegram' || key.includes('telegram')) {
          metrics.telegram = value === 'true' || value === 'yes' || value === 'detected' || value === 'present';
        }
        // Check for Signal
        if (key === 'signal' || key.includes('signal')) {
          metrics.signal = value === 'true' || value === 'yes' || value === 'detected' || value === 'present';
        }
        // Generic 'present' key that may contain the service name
        if (key === 'present' || key === 'detected' || key === 'registered') {
          if (value.includes('whatsapp')) metrics.whatsapp = true;
          if (value.includes('telegram')) metrics.telegram = true;
          if (value.includes('signal')) metrics.signal = true;
        }
      }
    }
    
    if (finding.providerCategory === 'Risk Intelligence') {
      for (const ev of finding.evidence || []) {
        if ((ev.key === 'Fraud Score' || ev.key === 'fraud_score') && ev.value !== 'N/A') {
          const score = parseInt(String(ev.value), 10);
          if (!isNaN(score)) metrics.fraudScore = score;
        }
      }
      if (finding.severity === 'high' || finding.severity === 'critical') {
        metrics.riskLevel = 'high';
      } else if (finding.severity === 'medium' && metrics.riskLevel !== 'high') {
        metrics.riskLevel = 'medium';
      }
    }
    
    if (finding.providerCategory === 'Data Broker') {
      metrics.brokerCount++;
    }
  }

  // Adjust risk level based on fraud score, VoIP, or disposable flags
  if (metrics.fraudScore !== null && metrics.fraudScore > 75) {
    metrics.riskLevel = 'high';
  } else if (metrics.fraudScore !== null && metrics.fraudScore > 50 && metrics.riskLevel !== 'high') {
    metrics.riskLevel = 'medium';
  }
  if (metrics.isDisposable && metrics.riskLevel === 'low') {
    metrics.riskLevel = 'medium';
  }

  return metrics;
}

function LineTypeIcon({ type }: { type: string }) {
  switch (type.toLowerCase()) {
    case 'mobile':
      return <Smartphone className="h-4 w-4" />;
    case 'voip':
      return <Radio className="h-4 w-4" />;
    case 'landline':
      return <Building className="h-4 w-4" />;
    default:
      return <Phone className="h-4 w-4" />;
  }
}

// MessagingIcon removed - using inline indicators instead

export function PhoneIntelligenceCard({ phone, findings, providerStatuses, className }: PhoneIntelligenceCardProps) {
  // Use all findings passed in - parent already filters for phone_intelligence type
  // But also accept any findings for backwards compatibility
  const phoneFindings = findings.length > 0 ? findings : [];
  const metrics = extractPhoneMetrics(phoneFindings);

  const riskColors = {
    low: 'bg-green-500/10 text-green-500 border-green-500/20',
    medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    high: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            Phone Intelligence
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Phone intelligence is probabilistic. Results reflect aggregated public and commercial signals, not guaranteed identity.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
          <Badge variant="outline" className={cn(riskColors[metrics.riskLevel])}>
            {metrics.riskLevel.toUpperCase()} RISK
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Phone Number */}
        <div className="text-center py-2 px-4 bg-muted/50 rounded-lg">
          <span className="font-mono text-lg">{phone}</span>
        </div>

        {/* Line Type & Carrier */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Line Type</p>
            <div className="flex items-center gap-2">
              <LineTypeIcon type={metrics.lineType} />
              <span className="font-medium capitalize">{metrics.lineType}</span>
              {metrics.isVoip && (
                <Badge variant="secondary" className="text-xs">VoIP</Badge>
              )}
              {metrics.isDisposable && (
                <Badge variant="destructive" className="text-xs">Disposable</Badge>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Carrier</p>
            <p className="font-medium">{metrics.carrier}</p>
          </div>
        </div>

        {/* Country */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Country</p>
          <p className="font-medium">{metrics.country}</p>
        </div>

        {/* Messaging Presence - show as Unavailable since no legitimate API exists */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Messaging Presence</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Messaging presence detection requires access to platform APIs that are not publicly available. This feature is not currently supported.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="text-xs text-muted-foreground border-muted-foreground/30">
                WhatsApp: Unavailable
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="text-xs text-muted-foreground border-muted-foreground/30">
                Telegram: Unavailable
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="text-xs text-muted-foreground border-muted-foreground/30">
                Signal: Unavailable
              </Badge>
            </div>
          </div>
        </div>

        {/* Risk Indicators */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Risk Indicators</p>
          <div className="flex flex-wrap gap-2">
            {metrics.fraudScore !== null && (
              <Badge variant="outline" className={cn(
                metrics.fraudScore > 75 ? "border-red-500 text-red-500" :
                metrics.fraudScore > 50 ? "border-yellow-500 text-yellow-500" :
                "border-green-500 text-green-500"
              )}>
                <AlertTriangle className="h-3 w-3 mr-1" />
                Fraud Score: {metrics.fraudScore}
              </Badge>
            )}
            {metrics.brokerCount > 0 && (
              <Badge variant="outline" className="border-orange-500 text-orange-500">
                <Building className="h-3 w-3 mr-1" />
                {metrics.brokerCount} Data Broker{metrics.brokerCount > 1 ? 's' : ''}
              </Badge>
            )}
            {metrics.isDisposable && (
              <Badge variant="outline" className="border-red-500 text-red-500">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Disposable Number
              </Badge>
            )}
            {!metrics.fraudScore && metrics.brokerCount === 0 && !metrics.isDisposable && (
              <Badge variant="outline" className="border-green-500 text-green-500">
                <Shield className="h-3 w-3 mr-1" />
                No Risk Indicators
              </Badge>
            )}
          </div>
        </div>

        {/* Provider Attribution & Status Summary */}
        <div className="pt-3 border-t border-border/50 space-y-2">
          <p className="text-xs text-muted-foreground">
            {phoneFindings.length} finding{phoneFindings.length !== 1 ? 's' : ''} from {
              [...new Set(phoneFindings.map(f => f.provider))].length
            } provider{[...new Set(phoneFindings.map(f => f.provider))].length !== 1 ? 's' : ''}
          </p>
          
          {/* Provider Status Summary Row */}
          {providerStatuses && providerStatuses.total > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {providerStatuses.success > 0 && (
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30 text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {providerStatuses.success} Success
                </Badge>
              )}
              {providerStatuses.skipped > 0 && (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs">
                  <SkipForward className="h-3 w-3 mr-1" />
                  {providerStatuses.skipped} Skipped
                </Badge>
              )}
              {providerStatuses.notConfigured > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="bg-muted text-muted-foreground border-muted-foreground/30 text-xs cursor-help">
                        <Settings className="h-3 w-3 mr-1" />
                        {providerStatuses.notConfigured} Not Configured
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Some providers require API keys to be configured</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {providerStatuses.tierRestricted > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/30 text-xs cursor-help">
                        <Lock className="h-3 w-3 mr-1" />
                        {providerStatuses.tierRestricted} Locked
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Upgrade your plan to unlock more providers</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {providerStatuses.failed > 0 && (
                <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30 text-xs">
                  <XCircle className="h-3 w-3 mr-1" />
                  {providerStatuses.failed} Failed
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
