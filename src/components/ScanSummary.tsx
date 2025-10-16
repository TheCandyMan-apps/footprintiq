import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Finding, Severity } from "@/lib/ufm";
import { AlertTriangle, Shield, Info, CheckCircle2, Download, Bell, Dna } from "lucide-react";
import { calculatePRI } from "@/lib/atlas/riskIndex";
import { computePersonaDNA } from "@/lib/atlas/personaDNA";
import { generateEvidencePack } from "@/lib/evidence/zip";
import { addToWatchlist } from "@/lib/monitor/watchlist";
import { logAuditEvent, AuditEventTypes } from "@/lib/audit";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ScanSummaryProps {
  findings: Finding[];
  scanId?: string;
  isPro?: boolean;
}

export const ScanSummary = ({ findings, scanId, isPro = false }: ScanSummaryProps) => {
  const { toast } = useToast();
  const [personaDNA, setPersonaDNA] = useState<string | null>(null);
  const [dnaConfidence, setDnaConfidence] = useState<number>(0);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Compute Persona DNA on mount
  useEffect(() => {
    if (findings.length > 0) {
      computePersonaDNA(findings).then(({ dna, confidence }) => {
        setPersonaDNA(dna);
        setDnaConfidence(confidence);
      });
    }
  }, [findings]);
  const counts = {
    critical: findings.filter(f => f.severity === 'critical').length,
    high: findings.filter(f => f.severity === 'high').length,
    medium: findings.filter(f => f.severity === 'medium').length,
    low: findings.filter(f => f.severity === 'low').length,
    info: findings.filter(f => f.severity === 'info').length,
  };

  // Use new PRI calculation
  const pri = calculatePRI(findings);
  const riskScore = pri.score;
  
  const getRiskLevel = (score: number): { label: string; color: string; icon: React.ReactNode } => {
    if (score >= 75) return { 
      label: 'Critical Risk', 
      color: 'text-destructive', 
      icon: <AlertTriangle className="w-5 h-5" /> 
    };
    if (score >= 50) return { 
      label: 'High Risk', 
      color: 'text-destructive', 
      icon: <AlertTriangle className="w-5 h-5" /> 
    };
    if (score >= 25) return { 
      label: 'Medium Risk', 
      color: 'text-yellow-600', 
      icon: <Shield className="w-5 h-5" /> 
    };
    if (score > 0) return { 
      label: 'Low Risk', 
      color: 'text-blue-600', 
      icon: <Info className="w-5 h-5" /> 
    };
    return { 
      label: 'No Issues', 
      color: 'text-green-600', 
      icon: <CheckCircle2 className="w-5 h-5" /> 
    };
  };

  const risk = getRiskLevel(riskScore);

  const getTopActions = (): string[] => {
    const actions: string[] = [];
    
    if (counts.critical > 0 || counts.high > 0) {
      const breaches = findings.filter(f => f.type === 'breach');
      if (breaches.length > 0) {
        actions.push("Change passwords for compromised accounts immediately");
        actions.push("Enable 2FA on all critical accounts");
      }
      
      const ipExposure = findings.filter(f => f.type === 'ip_exposure');
      if (ipExposure.length > 0) {
        actions.push("Close critical open ports (23, 3389, 445, 21)");
      }
    }
    
    if (counts.medium > 0) {
      const domainRep = findings.filter(f => f.type === 'domain_reputation');
      if (domainRep.length > 0) {
        actions.push("Review domain reputation and configure DMARC/SPF/DKIM");
      }
    }
    
    if (actions.length === 0) {
      actions.push("Continue monitoring for new exposures");
    }
    
    return actions.slice(0, 3);
  };

  const topActions = getTopActions();

  // Handle Evidence Pack download
  const handleDownloadEvidence = async () => {
    if (isDownloading) return;
    
    setIsDownloading(true);
    try {
      const blob = await generateEvidencePack(findings, {
        generated: new Date().toISOString(),
        scanId: scanId || "unknown",
        findingCount: findings.length,
        riskScore: pri.score,
        personaDNA: personaDNA || undefined,
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `footprintiq-evidence-${scanId || Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      logAuditEvent(AuditEventTypes.EVIDENCE_DOWNLOADED, "evidence_pack_downloaded", {
        scanId,
        findingCount: findings.length,
      });

      toast({
        title: "Evidence Pack Downloaded",
        description: "Your forensic report is ready for analysis.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to generate Evidence Pack. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle watchlist toggle
  const handleMonitoringToggle = (enabled: boolean) => {
    if (!isPro) {
      toast({
        title: "Pro Feature",
        description: "Upgrade to Pro to enable continuous monitoring.",
        variant: "destructive",
      });
      return;
    }

    setIsMonitoring(enabled);
    
    if (enabled && scanId) {
      // Add to watchlist - extract primary identifier
      const primaryIdentifier = findings[0]?.evidence.find(
        (e) => e.key === "username" || e.key === "email"
      );
      
      if (primaryIdentifier && typeof primaryIdentifier.value === "string") {
        addToWatchlist({
          type: primaryIdentifier.key as "username" | "email",
          value: primaryIdentifier.value,
          alertOnChange: true,
        });
        
        logAuditEvent(AuditEventTypes.WATCHLIST_ADDED, "monitoring_enabled", { scanId });
        
        toast({
          title: "Monitoring Enabled",
          description: "You'll be alerted if new findings are detected.",
        });
      }
    } else {
      logAuditEvent(AuditEventTypes.WATCHLIST_REMOVED, "monitoring_disabled", { scanId });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Scan Summary
              {personaDNA && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="outline" className="gap-1">
                        <Dna className="w-3 h-3" />
                        {personaDNA.substring(0, 8)}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <div className="space-y-1">
                        <p className="font-semibold">Persona DNA</p>
                        <p className="text-xs">
                          Privacy-preserving identity hash based on behavioral patterns.
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Full: {personaDNA} (Confidence: {Math.round(dnaConfidence * 100)}%)
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </CardTitle>
            <CardDescription>
              Analyzed {findings.length} finding{findings.length !== 1 ? 's' : ''} across multiple OSINT sources
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadEvidence}
              disabled={isDownloading}
            >
              <Download className="w-4 h-4 mr-2" />
              {isDownloading ? "Generating..." : "Evidence Pack"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Predictive Risk Index (PRI) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={risk.color}>{risk.icon}</div>
              <div>
                <div className="text-2xl font-bold">{pri.score}/100</div>
                <div className="text-xs text-muted-foreground">Predictive Risk Index</div>
              </div>
            </div>
            <Badge variant="outline" className={risk.color}>
              {pri.level.toUpperCase()}
            </Badge>
          </div>
          <Progress value={pri.score} className="h-3" />
          <p className="text-sm text-muted-foreground">{pri.recommendation}</p>
        </div>

        {/* Risk Contributions */}
        {pri.contributions.filter(c => c.score > 0).length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Risk Breakdown</h4>
            <div className="space-y-1.5">
              {pri.contributions
                .filter(c => c.score > 0)
                .sort((a, b) => b.score * b.weight - a.score * a.weight)
                .map((contrib, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {contrib.category} ({contrib.findings})
                    </span>
                    <span className="font-mono font-semibold">
                      {Math.round(contrib.score * contrib.weight)}/
                      {Math.round(100 * contrib.weight)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Severity Breakdown */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Findings by Severity</h4>
          <div className="grid grid-cols-5 gap-2">
            {counts.critical > 0 && (
              <div className="text-center p-2 rounded bg-destructive/10">
                <div className="text-2xl font-bold text-destructive">{counts.critical}</div>
                <div className="text-xs text-muted-foreground">Critical</div>
              </div>
            )}
            {counts.high > 0 && (
              <div className="text-center p-2 rounded bg-destructive/10">
                <div className="text-2xl font-bold text-destructive">{counts.high}</div>
                <div className="text-xs text-muted-foreground">High</div>
              </div>
            )}
            {counts.medium > 0 && (
              <div className="text-center p-2 rounded bg-yellow-500/10">
                <div className="text-2xl font-bold text-yellow-600">{counts.medium}</div>
                <div className="text-xs text-muted-foreground">Medium</div>
              </div>
            )}
            {counts.low > 0 && (
              <div className="text-center p-2 rounded bg-blue-500/10">
                <div className="text-2xl font-bold text-blue-600">{counts.low}</div>
                <div className="text-xs text-muted-foreground">Low</div>
              </div>
            )}
            {counts.info > 0 && (
              <div className="text-center p-2 rounded bg-muted">
                <div className="text-2xl font-bold">{counts.info}</div>
                <div className="text-xs text-muted-foreground">Info</div>
              </div>
            )}
          </div>
        </div>

        {/* Top Actions */}
        {topActions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Top Priority Actions</h4>
            <ul className="space-y-2">
              {topActions.map((action, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-primary font-bold mt-0.5">{idx + 1}.</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Monitoring Toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Alert on Changes</p>
              <p className="text-xs text-muted-foreground">
                {isPro ? "Monitor for new findings" : "Upgrade to Pro"}
              </p>
            </div>
          </div>
          <Switch
            checked={isMonitoring}
            onCheckedChange={handleMonitoringToggle}
            disabled={!isPro}
          />
        </div>
      </CardContent>
    </Card>
  );
};
