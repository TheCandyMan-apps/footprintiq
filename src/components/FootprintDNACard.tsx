import { Card } from "@/components/ui/card";
import { CircularProgress } from "@/components/CircularProgress";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { AlertTriangle, Eye, Database, Shield, RefreshCw } from "lucide-react";
import { HelpIcon } from "@/components/ui/help-icon";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { getAIResponse } from "@/lib/aiRouter";
import { useWorkspace } from "@/hooks/useWorkspace";

async function aiScore(data: any) {
  const { content } = await getAIResponse({
    systemPrompt: "Return ONLY a number 0-100 representing overall privacy risk.",
    userPrompt: `breaches:${data.breaches} exposures:${data.exposures} darkWeb:${data.darkWeb}`,
  });
  return parseInt(content.trim(), 10) || 50;
}

interface MetricData {
  label: string;
  value: number;
  icon: React.ElementType;
  sparklineData: number[];
  color: string;
}

interface FootprintDNACardProps {
  userId?: string;
  jobId?: string;
  scanId?: string; // Add scanId prop
}

export function FootprintDNACard({ userId, jobId, scanId }: FootprintDNACardProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { workspace } = useWorkspace();

  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      if (userId) {
        setCurrentUserId(userId);
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUserId(user?.id || null);
      }
    };
    getCurrentUser();
  }, [userId]);

  // Fetch real data from Supabase with realtime support
  const fetchFootprintMetrics = async () => {
    // Helper to calculate metrics from findings
    const calculateMetrics = (findings: any[]) => {
      const BROKER_KEYWORDS = ['whitepages', 'spokeo', 'intelius', 'beenverified', 'truthfinder',
        'pipl', 'radaris', 'fastpeoplesearch', 'peoplefinder', 'ussearch', 'peekyou', 'mylife', 'broker', 'data broker'];
      const DARK_WEB_KEYWORDS = ['intelx', 'paste', 'dark', 'onion', 'breach', 'leak', 'darkweb'];
      const BREACH_KEYWORDS = ['hibp', 'haveibeenpwned', 'breach', 'leak', 'password'];

      let breaches = 0, exposures = 0, dataBrokers = 0, darkWeb = 0;

      for (const finding of findings) {
        const kind = (finding.kind || '').toLowerCase();
        const provider = (finding.provider || '').toLowerCase();
        const severity = finding.severity || '';

        if (BREACH_KEYWORDS.some(k => kind.includes(k) || provider.includes(k)) || severity === 'critical' || severity === 'high') breaches++;
        exposures++;
        if (BROKER_KEYWORDS.some(k => kind.includes(k) || provider.includes(k))) dataBrokers++;
        if (DARK_WEB_KEYWORDS.some(k => kind.includes(k) || provider.includes(k))) darkWeb++;
      }

      return { breaches, exposures, dataBrokers, darkWeb };
    };

    // Priority 1: Use scanId if provided (most direct)
    if (scanId) {
      try {
        const { data, error } = await (supabase as any).from('findings').select('kind, severity, evidence, provider').eq('scan_id', scanId);
        if (error) throw error;
        
        // If no findings, check if scan exists and has legacy data
        if (!data || data.length === 0) {
          const { data: scanData } = await supabase.from('scans').select('total_sources_found, high_risk_count, medium_risk_count, low_risk_count').eq('id', scanId).single();
          if (scanData && scanData.total_sources_found > 0) {
            // Return approximate metrics from scan summary
            return {
              breaches: scanData.high_risk_count || 0,
              exposures: scanData.total_sources_found || 0,
              dataBrokers: scanData.medium_risk_count || 0,
              darkWeb: scanData.low_risk_count || 0
            };
          }
        }
        
        return calculateMetrics(data || []);
      } catch (err) {
        console.error('Error fetching scan metrics from findings:', err);
        return { breaches: 0, exposures: 0, dataBrokers: 0, darkWeb: 0 };
      }
    }

    // Priority 2: Try to map jobId to scanId
    if (jobId) {
      try {
        const { data: jobData } = await (supabase as any).from('scan_jobs').select('username, requested_by').eq('id', jobId).single();
        if (jobData?.username) {
          const { data: scanData } = await (supabase as any).from('scans').select('id').eq('username', jobData.username).eq('user_id', jobData.requested_by).order('created_at', { ascending: false }).limit(1).single();
          if (scanData?.id) {
            const { data: findings } = await (supabase as any).from('findings').select('kind, severity, evidence, provider').eq('scan_id', scanData.id);
            if (findings && findings.length > 0) return calculateMetrics(findings);
          }
        }
      } catch (err) {
        console.error('Error mapping jobId to scanId:', err);
      }
    }

    // Priority 3: Fall back to workspace-wide findings
    if (!workspace?.id) return { breaches: 0, exposures: 0, dataBrokers: 0, darkWeb: 0 };

    try {
      const { data, error } = await (supabase as any)
        .from('findings')
        .select('kind, severity, evidence, provider')
        .eq('workspace_id', workspace.id);
      if (error) throw error;
      return calculateMetrics(data || []);
    } catch (err) {
      console.error('Error fetching workspace-wide findings:', err);
      return { breaches: 0, exposures: 0, dataBrokers: 0, darkWeb: 0 };
    }
  };

  const { data: footprintData, refetch, isLoading } = useQuery({
    queryKey: ["footprint-metrics", workspace?.id || null, jobId, scanId],
    queryFn: fetchFootprintMetrics,
    initialData: { breaches: 0, exposures: 0, dataBrokers: 0, darkWeb: 0 },
    enabled: !!(workspace?.id || scanId || jobId),
  });

  // Set up real-time subscription for updates - subscribe to scan_id if provided, else workspace
  useEffect(() => {
    if (!workspace?.id && !scanId) return;

    // When tracking a specific scan, listen to findings inserts for that scan
    if (scanId) {
      const channel = supabase
        .channel(`dna-findings-scan-${scanId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'findings',
            filter: `scan_id=eq.${scanId}`,
          },
          () => {
            console.log('[DNA] New finding received, refetching...');
            refetch();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }

    // Fall back to workspace-wide listening
    const channel = supabase
      .channel(`dna-findings-${workspace!.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'findings',
          filter: `workspace_id=eq.${workspace!.id}`,
        },
        () => {
          console.log('[DNA] New finding received, refetching...');
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workspace?.id, scanId, refetch]);

  // AI-generated risk score
  const [score, setScore] = useState<number | null>(null);
  
  useEffect(() => {
    aiScore(footprintData).then(setScore);
  }, [footprintData]);

  const riskScore = score ?? 0;

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
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold mb-1">Digital Footprint DNA</h2>
              <HelpIcon helpKey="digital_dna" />
            </div>
            <p className="text-sm text-muted-foreground">Real-time security risk analysis</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
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
