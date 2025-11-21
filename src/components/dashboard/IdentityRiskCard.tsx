import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface IdentityRiskCardProps {
  riskScore: number;
  breaches: number;
  darkWeb: number;
  dataBrokers: number;
}

export function IdentityRiskCard({ riskScore, breaches, darkWeb, dataBrokers }: IdentityRiskCardProps) {
  const getRiskLevel = (score: number) => {
    if (score >= 80) return { label: 'Low Risk', color: 'text-green-500', icon: CheckCircle };
    if (score >= 50) return { label: 'Medium Risk', color: 'text-yellow-500', icon: AlertTriangle };
    return { label: 'High Risk', color: 'text-red-500', icon: AlertTriangle };
  };

  const risk = getRiskLevel(riskScore);
  const RiskIcon = risk.icon;

  const totalThreats = breaches + darkWeb + dataBrokers;

  return (
    <Card className="shadow-card hover:shadow-glow transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Identity Risk Score
        </CardTitle>
        <CardDescription>Overall security posture assessment</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RiskIcon className={`h-6 w-6 ${risk.color}`} />
            <span className={`text-2xl font-bold ${risk.color}`}>{riskScore}/100</span>
          </div>
          <span className={`text-sm font-medium ${risk.color}`}>{risk.label}</span>
        </div>

        <Progress value={riskScore} className="h-2" />

        <div className="space-y-2 pt-2 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Active Breaches</span>
            <span className="font-semibold text-destructive">{breaches}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Dark Web Mentions</span>
            <span className="font-semibold text-orange-500">{darkWeb}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Data Brokers</span>
            <span className="font-semibold text-yellow-500">{dataBrokers}</span>
          </div>
          <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
            <span className="text-muted-foreground font-medium">Total Threats</span>
            <span className="font-bold text-foreground">{totalThreats}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
