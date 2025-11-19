import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Shield, AlertTriangle, Database, Skull, RefreshCw } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { TrendDataPoint } from '@/lib/trends';

interface FootprintDNAProps {
  score: number;
  breaches: number;
  exposures: number;
  dataBrokers: number;
  darkWeb: number;
  trendData?: TrendDataPoint[];
  onOpenDetails?: () => void;
  onRescan?: () => void;
  isRescanning?: boolean;
}

interface MetricData {
  icon: React.ElementType;
  label: string;
  value: number;
  sparklineData: { value: number }[];
  color: string;
}

export const FootprintDNA = ({ 
  score, 
  breaches, 
  exposures, 
  dataBrokers, 
  darkWeb,
  trendData = [],
  onOpenDetails,
  onRescan,
  isRescanning = false
}: FootprintDNAProps) => {
  // Determine color based on score
  const getScoreColor = (score: number) => {
    if (score < 40) return { stroke: 'hsl(var(--accent))', glow: 'hsl(var(--accent) / 0.3)' };
    if (score <= 70) return { stroke: 'hsl(45 93% 47%)', glow: 'rgba(234, 179, 8, 0.3)' }; // yellow
    return { stroke: 'hsl(var(--destructive))', glow: 'hsl(var(--destructive) / 0.3)' };
  };

  const scoreColor = getScoreColor(score);
  const circumference = 2 * Math.PI * 54; // radius = 54
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Generate sparkline data (simulated trend)
  const generateSparkline = (value: number) => {
    return Array.from({ length: 12 }, (_, i) => ({
      value: Math.max(0, value + Math.random() * value * 0.3 - value * 0.15)
    }));
  };

  const metrics: MetricData[] = [
    {
      icon: Shield,
      label: 'Breaches',
      value: breaches,
      sparklineData: generateSparkline(breaches),
      color: 'hsl(var(--destructive))'
    },
    {
      icon: AlertTriangle,
      label: 'Exposures',
      value: exposures,
      sparklineData: generateSparkline(exposures),
      color: 'hsl(45 93% 47%)' // yellow
    },
    {
      icon: Database,
      label: 'Data Brokers',
      value: dataBrokers,
      sparklineData: generateSparkline(dataBrokers),
      color: 'hsl(var(--primary))'
    },
    {
      icon: Skull,
      label: 'Dark Web',
      value: darkWeb,
      sparklineData: generateSparkline(darkWeb),
      color: darkWeb > 0 ? 'hsl(var(--destructive))' : 'hsl(var(--accent))'
    }
  ];

  // Check if there's no data at all
  const hasNoData = breaches === 0 && exposures === 0 && dataBrokers === 0 && darkWeb === 0;

  return (
    <Card 
      className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 border-border shadow-lg cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02]"
      onClick={onOpenDetails}
    >
      {/* Glow effect */}
      <div 
        className="absolute inset-0 opacity-20 blur-3xl pointer-events-none"
        style={{ 
          background: `radial-gradient(circle at 50% 50%, ${scoreColor.glow} 0%, transparent 70%)` 
        }}
      />
      
      <div className="relative p-6 md:p-8">
        {hasNoData && (
          <div className="mb-4 p-3 bg-muted/50 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground text-center">
              Run a scan to populate your intelligence metrics
            </p>
          </div>
        )}
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Circular Progress Ring */}
          <div className="relative flex-shrink-0">
            <svg width="160" height="160" className="transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="80"
                cy="80"
                r="54"
                fill="none"
                stroke="hsl(var(--secondary))"
                strokeWidth="12"
              />
              {/* Progress circle */}
              <circle
                cx="80"
                cy="80"
                r="54"
                fill="none"
                stroke={scoreColor.stroke}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
                style={{ filter: `drop-shadow(0 0 8px ${scoreColor.glow})` }}
              />
            </svg>
            
            {/* Score in center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-4xl font-bold" style={{ color: scoreColor.stroke }}>
                {score}
              </div>
              <div className="text-sm text-muted-foreground">/100</div>
            </div>
          </div>

          {/* Title and Metrics */}
          <div className="flex-1 w-full space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Your Digital DNA
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {score < 40 
                    ? 'Low risk - Your digital footprint is well protected' 
                    : score <= 70 
                    ? 'Medium risk - Some areas need attention' 
                    : 'High risk - Immediate action recommended'}
                </p>
              </div>
              
              {onRescan && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRescan();
                  }}
                  disabled={isRescanning}
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRescanning ? 'animate-spin' : ''}`} />
                  {isRescanning ? 'Updating...' : 'Rescan'}
                </Button>
              )}
            </div>

            {/* Mini Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <TooltipProvider>
                {metrics.map((metric, index) => {
                  const Icon = metric.icon;
                  return (
                    <Tooltip key={index}>
                      <TooltipTrigger asChild>
                        <div 
                          className="group relative p-3 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <Icon 
                              className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" 
                            />
                            <div className="text-right">
                              <div className="text-xl font-bold" style={{ color: metric.color }}>
                                {metric.value}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-xs text-muted-foreground mb-2">
                            {metric.label}
                          </div>
                          
                          {/* Sparkline */}
                          <div className="h-8 -mx-1">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={metric.sparklineData}>
                                <Line
                                  type="monotone"
                                  dataKey="value"
                                  stroke={metric.color}
                                  strokeWidth={1.5}
                                  dot={false}
                                  animationDuration={1000}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p className="text-sm font-medium">{metric.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {metric.label === 'Breaches' && 'Total data breaches found'}
                          {metric.label === 'Exposures' && 'Public exposures detected'}
                          {metric.label === 'Data Brokers' && 'Data broker profiles found'}
                          {metric.label === 'Dark Web' && 'Dark web mentions'}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
