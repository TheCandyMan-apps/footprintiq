import { Card } from "@/components/ui/card";
import { CircularProgress } from "@/components/CircularProgress";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { AlertTriangle, Eye, Database, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface MetricData {
  label: string;
  value: number;
  icon: React.ElementType;
  sparklineData: number[];
  color: string;
}

export function FootprintDNACard() {
  // Mock query for breach/exposure data
  const { data: footprintData } = useQuery({
    queryKey: ["footprint-metrics"],
    queryFn: async () => {
      // Mock data - in real scenario, query from Supabase
      const breaches = Math.floor(Math.random() * 5) + 1;
      const exposures = Math.floor(Math.random() * 15) + 5;
      const dataBrokers = Math.floor(Math.random() * 20) + 10;
      const darkWeb = Math.floor(Math.random() * 3);
      
      return { breaches, exposures, dataBrokers, darkWeb };
    },
    initialData: { breaches: 3, exposures: 12, dataBrokers: 18, darkWeb: 1 },
  });

  // Calculate risk score: breaches * 2 + exposures
  const riskScore = Math.min(100, footprintData.breaches * 2 + footprintData.exposures);

  const getRiskColor = (score: number) => {
    if (score < 30) return "text-green-500";
    if (score < 70) return "text-yellow-500";
    return "text-red-500";
  };

  const getRiskLabel = (score: number) => {
    if (score < 30) return "Low Risk";
    if (score < 70) return "Medium Risk";
    return "High Risk";
  };

  const getRiskGradient = (score: number) => {
    if (score < 30) return "from-green-500/10 to-green-500/5";
    if (score < 70) return "from-yellow-500/10 to-yellow-500/5";
    return "from-red-500/10 to-red-500/5";
  };

  const getRiskGlow = (score: number) => {
    if (score < 30) return "shadow-green-500/20";
    if (score < 70) return "shadow-yellow-500/20";
    return "shadow-red-500/20";
  };

  // Generate mock sparkline data
  const generateSparkline = (value: number) => {
    return Array.from({ length: 7 }, (_, i) => ({
      value: Math.max(0, value + Math.floor(Math.random() * 5) - 2),
    }));
  };

  const metrics: MetricData[] = [
    {
      label: "Breaches",
      value: footprintData.breaches,
      icon: AlertTriangle,
      sparklineData: generateSparkline(footprintData.breaches).map(d => d.value),
      color: "text-red-500",
    },
    {
      label: "Exposures",
      value: footprintData.exposures,
      icon: Eye,
      sparklineData: generateSparkline(footprintData.exposures).map(d => d.value),
      color: "text-orange-500",
    },
    {
      label: "Data Brokers",
      value: footprintData.dataBrokers,
      icon: Database,
      sparklineData: generateSparkline(footprintData.dataBrokers).map(d => d.value),
      color: "text-blue-500",
    },
    {
      label: "Dark Web",
      value: footprintData.darkWeb,
      icon: Shield,
      sparklineData: generateSparkline(footprintData.darkWeb).map(d => d.value),
      color: "text-purple-500",
    },
  ];

  return (
    <Card 
      className={cn(
        "relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300",
        "hover:shadow-2xl hover:scale-[1.02]",
        getRiskGlow(riskScore)
      )}
    >
      {/* Gradient background */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-50",
        getRiskGradient(riskScore)
      )} />
      
      <div className="relative p-6 md:p-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-1">Digital Footprint DNA</h2>
          <p className="text-sm text-muted-foreground">Real-time security risk analysis</p>
        </div>

        {/* Circular Progress */}
        <div className="flex flex-col items-center mb-8">
          <CircularProgress 
            value={riskScore}
            size={160}
            strokeWidth={12}
            className="mb-4"
          />
          <div className="text-center">
            <p className={cn("text-xl font-bold", getRiskColor(riskScore))}>
              {getRiskLabel(riskScore)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Risk Score: {riskScore}/100
            </p>
          </div>
        </div>

        {/* Metric Chips */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            const sparkData = metric.sparklineData.map((value, index) => ({ 
              index, 
              value 
            }));
            
            return (
              <div
                key={metric.label}
                className="flex flex-col items-center p-4 rounded-lg bg-background/50 backdrop-blur-sm border border-border/50 transition-all duration-200 hover:bg-background/80 hover:scale-105"
              >
                <Icon className={cn("h-5 w-5 mb-2", metric.color)} />
                <p className="text-2xl font-bold mb-1">{metric.value}</p>
                <p className="text-xs text-muted-foreground mb-2">{metric.label}</p>
                
                {/* Sparkline */}
                <div className="w-full h-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparkData}>
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="currentColor"
                        strokeWidth={2}
                        dot={false}
                        className={metric.color}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
