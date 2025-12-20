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
    if (finding.providerCategory === 'Carrier Intelligence') {
      for (const ev of finding.evidence || []) {
        if (ev.key === 'Line Type') metrics.lineType = String(ev.value);
        if (ev.key === 'Carrier') metrics.carrier = String(ev.value);
        if (ev.key === 'Country') metrics.country = String(ev.value);
        if (ev.key === 'Is VoIP') metrics.isVoip = ev.value === 'true';
        if (ev.key === 'Is Disposable') metrics.isDisposable = ev.value === 'true';
      }
    }
    
    if (finding.providerCategory === 'Messaging Presence') {
      for (const ev of finding.evidence || []) {
        if (ev.key === 'WhatsApp') metrics.whatsapp = ev.value === 'true';
        if (ev.key === 'Telegram') metrics.telegram = ev.value === 'true';
        if (ev.key === 'Signal') metrics.signal = ev.value === 'true';
      }
    }
    
    if (finding.providerCategory === 'Risk Intelligence') {
      for (const ev of finding.evidence || []) {
        if (ev.key === 'Fraud Score' && ev.value !== 'N/A') {
          metrics.fraudScore = Number(ev.value);
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

  // Adjust risk level based on VoIP/disposable
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
  const phoneFindings = findings.filter(f => f.type === 'phone_intelligence');
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

        {/* Messaging Presence */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Messaging Presence</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className={cn(
                "h-3 w-3 rounded-full",
                metrics.whatsapp ? "bg-green-500" : "bg-muted"
              )} />
              <span className={cn(
                "text-sm",
                metrics.whatsapp ? "text-foreground" : "text-muted-foreground"
              )}>WhatsApp</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={cn(
                "h-3 w-3 rounded-full",
                metrics.telegram ? "bg-blue-500" : "bg-muted"
              )} />
              <span className={cn(
                "text-sm",
                metrics.telegram ? "text-foreground" : "text-muted-foreground"
              )}>Telegram</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={cn(
                "h-3 w-3 rounded-full",
                metrics.signal ? "bg-blue-600" : "bg-muted"
              )} />
              <span className={cn(
                "text-sm",
                metrics.signal ? "text-foreground" : "text-muted-foreground"
              )}>Signal</span>
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
