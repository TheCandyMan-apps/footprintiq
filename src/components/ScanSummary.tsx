import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Finding, Severity } from "@/lib/ufm";
import { AlertTriangle, Shield, Info, CheckCircle2 } from "lucide-react";

interface ScanSummaryProps {
  findings: Finding[];
}

export const ScanSummary = ({ findings }: ScanSummaryProps) => {
  const counts = {
    critical: findings.filter(f => f.severity === 'critical').length,
    high: findings.filter(f => f.severity === 'high').length,
    medium: findings.filter(f => f.severity === 'medium').length,
    low: findings.filter(f => f.severity === 'low').length,
    info: findings.filter(f => f.severity === 'info').length,
  };

  // Calculate risk score (0-100)
  const calculateRiskScore = (): number => {
    const weights = { critical: 25, high: 15, medium: 8, low: 3, info: 1 };
    const maxPossible = 100;
    
    const rawScore = 
      counts.critical * weights.critical +
      counts.high * weights.high +
      counts.medium * weights.medium +
      counts.low * weights.low +
      counts.info * weights.info;
    
    return Math.min(Math.round(rawScore), maxPossible);
  };

  const riskScore = calculateRiskScore();
  
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scan Summary</CardTitle>
        <CardDescription>
          Analyzed {findings.length} finding{findings.length !== 1 ? 's' : ''} across multiple OSINT sources
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Risk Score */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={risk.color}>{risk.icon}</div>
              <span className="text-2xl font-bold">{riskScore}/100</span>
            </div>
            <Badge variant="outline" className={risk.color}>
              {risk.label}
            </Badge>
          </div>
          <Progress value={riskScore} className="h-3" />
        </div>

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
      </CardContent>
    </Card>
  );
};
