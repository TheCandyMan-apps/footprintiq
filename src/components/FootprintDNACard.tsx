import { Card } from "@/components/ui/card";
import { CircularProgress } from "@/components/CircularProgress";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { AlertTriangle, Eye, Database, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { getAIResponse } from "@/lib/aiRouter";

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
}

export function FootprintDNACard({ userId, jobId }: FootprintDNACardProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

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

// Fetch real data from Supabase
  const fetchFootprintMetrics = async () => {
    // When showing metrics for a specific scan, derive from scan_findings
    if (jobId) {
      try {
        const { data, error } = await (supabase as any)
          .from('scan_findings')
          .select('site, status, raw')
          .eq('job_id', jobId);

        if (error) throw error;
        const items = (data || []) as Array<{ site: string; status?: string; raw?: any }>;

        const lower = (s: string | undefined) => (s || '').toLowerCase();
        const BROKER_SITES = [
          'whitepages','spokeo','intelius','beenverified','truthfinder','pipl','radaris','fastpeoplesearch','peoplefinder','ussearch','peekyou','mylife'
        ];
        const DARK_WEB_KEYWORDS = ['intelx','paste','dark','onion','breach','leak'];
        const BREACH_KEYWORDS = ['hibp','haveibeenpwned','intelx','leak','breach'];

        let breaches = 0;
        let exposures = 0;
        let dataBrokers = 0;
        let darkWeb = 0;

        for (const it of items) {
          const site = lower(it.site);
          if (BREACH_KEYWORDS.some(k => site.includes(k))) breaches++;
          if (it.status && lower(it.status) === 'found') exposures++;
          if (BROKER_SITES.some(k => site.includes(k))) dataBrokers++;
          if (DARK_WEB_KEYWORDS.some(k => site.includes(k))) darkWeb++;
        }

        return { breaches, exposures, dataBrokers, darkWeb };
      } catch (err) {
        console.error('Error fetching scan metrics from scan_findings:', err);
        return { breaches: 0, exposures: 0, dataBrokers: 0, darkWeb: 0 };
      }
    }

    // Otherwise, fall back to unified findings by user
    if (!currentUserId) {
      return { breaches: 0, exposures: 0, dataBrokers: 0, darkWeb: 0 };
    }

    try {
      // Query findings table - type as any to bypass deep instantiation error
      const query: any = (supabase as any)
        .from('findings')
        .select('kind, severity, evidence, provider');
      const response = await query.eq('user_id', currentUserId);

      const findings = (response.data || []) as Array<{
        kind?: string;
        severity?: string;
        evidence?: any[];
        provider?: string;
      }>;

      // Calculate metrics
      const breaches = findings.filter((f) =>
        f.kind?.includes('breach') ||
        f.severity === 'critical' ||
        f.severity === 'high'
      ).length;

      const exposures = findings.filter((f) =>
        f.evidence && Array.isArray(f.evidence) && f.evidence.length > 0
      ).length;

      const dataBrokers = findings.filter((f) =>
        f.kind?.includes('people_search') ||
        f.provider?.toLowerCase().includes('broker') ||
        f.provider?.toLowerCase().includes('people')
      ).length;

      const darkWeb = findings.filter((f) =>
        f.kind?.includes('darkweb') ||
        f.kind?.includes('paste') ||
        f.provider?.toLowerCase().includes('dark')
      ).length;

      return { breaches, exposures, dataBrokers, darkWeb };
    } catch (error) {
      console.error('Error fetching footprint data:', error);
      return { breaches: 0, exposures: 0, dataBrokers: 0, darkWeb: 0 };
    }
  };

  const { data: footprintData, refetch, isLoading } = useQuery({
    queryKey: ["footprint-metrics", currentUserId, jobId],
    queryFn: fetchFootprintMetrics,
    initialData: { breaches: 0, exposures: 0, dataBrokers: 0, darkWeb: 0 },
    enabled: !!currentUserId,
  });

  // Set up real-time subscription for updates
  useEffect(() => {
    // When tracking a specific scan, listen to scan_findings inserts
    if (jobId) {
      const channel = supabase
        .channel(`dna-scan-findings-${jobId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'scan_findings',
            filter: `job_id=eq.${jobId}`,
          },
          () => refetch()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }

    if (!currentUserId) return;

    const channel = supabase
      .channel(`dna-findings-${currentUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'findings',
          filter: `user_id=eq.${currentUserId}`,
        },
        () => refetch()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, jobId, refetch]);

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
