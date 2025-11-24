import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface IdentityRiskCardProps {
  riskScore: number;
  breaches: number;
  darkWeb: number;
  dataBrokers: number;
  exposures: number;
}

export function IdentityRiskCard({ riskScore, breaches, darkWeb, dataBrokers, exposures }: IdentityRiskCardProps) {
  console.log('[IdentityRiskCard] Rendering with:', { riskScore, breaches, darkWeb, dataBrokers, exposures });
  
  const getRiskLevel = (score: number) => {
    if (score >= 80) return { label: 'Low Risk', color: 'text-green-500', icon: CheckCircle };
    if (score >= 50) return { label: 'Medium Risk', color: 'text-yellow-500', icon: AlertTriangle };
    return { label: 'High Risk', color: 'text-red-500', icon: AlertTriangle };
  };

  const risk = getRiskLevel(riskScore);
  const RiskIcon = risk.icon;

  const totalThreats = breaches + darkWeb + dataBrokers + exposures;

  // Prepare data for pie chart
  const chartData = [
    { name: 'Breaches', value: breaches, color: 'hsl(var(--destructive))' },
    { name: 'Dark Web', value: darkWeb, color: 'hsl(20, 90%, 50%)' },
    { name: 'Data Brokers', value: dataBrokers, color: 'hsl(45, 90%, 50%)' },
    { name: 'Exposures', value: exposures, color: 'hsl(200, 80%, 50%)' },
  ].filter(item => item.value > 0);

  // If only one category has data, add a tiny placeholder for proper pie rendering
  if (chartData.length === 1 && totalThreats > 0) {
    chartData.push({
      name: 'No Other Threats',
      value: 0.1,
      color: 'hsl(var(--muted))'
    });
  }

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

        {/* Risk Category Breakdown with Pie Chart */}
        {chartData.length > 0 && totalThreats > 0 && (
          <div className="pt-2 border-t border-border">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Risk Breakdown</span>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Pie Chart */}
              <div className="w-24 h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={48}
                      paddingAngle={4}
                      stroke="white"
                      strokeWidth={2}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                        fontSize: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Legend */}
              <div className="flex-1 space-y-1">
                {chartData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

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
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Online Exposures</span>
            <span className="font-semibold text-blue-500">{exposures}</span>
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
