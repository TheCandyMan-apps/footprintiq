import { Card } from "@/components/ui/card";
import { CircularProgress } from "@/components/CircularProgress";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { AlertTriangle, Eye, Database, Shield, RefreshCw, Users, Gamepad, Briefcase, Globe } from "lucide-react";
import { HelpIcon } from "@/components/ui/help-icon";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { getAIResponse } from "@/lib/aiRouter";
import { useWorkspace } from "@/hooks/useWorkspace";
import { getPlatformCategory } from "@/lib/categoryMapping";
import { parseEvidence, extractPlatform } from "@/lib/evidenceParser";

async function aiScore(data: any, isUsernameScan: boolean) {
  if (isUsernameScan) {
    const { content } = await getAIResponse({
      systemPrompt: "Return ONLY a number 0-100 representing privacy exposure risk based on username presence.",
      userPrompt: `social:${data.social} gaming:${data.gaming} professional:${data.professional} other:${data.other}`,
    });
    return parseInt(content.trim(), 10) || 50;
  } else {
    const { content } = await getAIResponse({
      systemPrompt: "Return ONLY a number 0-100 representing overall privacy risk.",
      userPrompt: `breaches:${data.breaches} exposures:${data.exposures} darkWeb:${data.darkWeb}`,
    });
    return parseInt(content.trim(), 10) || 50;
  }
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

const TERMINAL_STATES = ['completed', 'completed_empty', 'completed_partial', 'failed', 'timeout', 'error', 'cancelled'];

export function FootprintDNACard({ userId, jobId, scanId }: FootprintDNACardProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<string | null>(null);
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
    // Detect if this is a username scan based on finding kinds
    const detectScanType = (findings: any[]) => {
      const usernameKinds = ['profile_presence', 'presence.hit', 'username.found'];
      return findings.some(f => {
        const kind = (f.kind || '').toLowerCase();
        return usernameKinds.some(uk => kind.includes(uk));
      });
    };

    // Helper to calculate username scan metrics
    const calculateUsernameScanMetrics = (findings: any[]) => {
      let social = 0, gaming = 0, professional = 0, other = 0;

      console.log('[FootprintDNA] Processing findings:', {
        count: findings.length,
        sample: findings[0],
        parsedEvidence: findings[0] ? parseEvidence(findings[0].evidence) : null
      });

      for (const finding of findings) {
        // Extract platform name using utility
        const platform = extractPlatform(finding);
        
        if (!platform) {
          other++;
          continue;
        }

        const category = getPlatformCategory(platform);
        
        switch (category) {
          case 'Social':
            social++;
            break;
          case 'Games':
            gaming++;
            break;
          case 'Developer':
            professional++;
            break;
          case 'Forums':
            professional++;
            break;
          default:
            other++;
        }
      }

      return { social, gaming, professional, other, isUsernameScan: true };
    };

    // Helper to calculate breach scan metrics
    const calculateBreachMetrics = (findings: any[]) => {
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

      return { breaches, exposures, dataBrokers, darkWeb, isUsernameScan: false };
    };

    // Main calculation logic
    const calculateMetrics = (findings: any[]) => {
      const isUsernameScan = detectScanType(findings);
      return isUsernameScan ? calculateUsernameScanMetrics(findings) : calculateBreachMetrics(findings);
    };

    // Priority 1: Use scanId if provided (most direct)
    if (scanId) {
      try {
        // First check scan type
        const { data: scanData } = await supabase.from('scans').select('username, scan_type').eq('id', scanId).single();
        const isUsernameScan = !!(scanData?.username || scanData?.scan_type === 'username');
        
        // For username scans, also check social_profiles table (primary data source)
        if (isUsernameScan) {
          const { data: profiles, error: profileError } = await supabase
            .from('social_profiles')
            .select('platform, profile_url, confidence_score, metadata')
            .eq('scan_id', scanId);
          
          if (!profileError && profiles && profiles.length > 0) {
            console.log('[FootprintDNA] Found social_profiles:', { count: profiles.length });
            
            let social = 0, gaming = 0, professional = 0, other = 0;
            
            for (const profile of profiles) {
              const platform = profile.platform || '';
              const category = getPlatformCategory(platform);
              
              switch (category) {
                case 'Social':
                  social++;
                  break;
                case 'Games':
                  gaming++;
                  break;
                case 'Developer':
                case 'Forums':
                  professional++;
                  break;
                default:
                  other++;
              }
            }
            
            console.log('[FootprintDNA] Calculated metrics from social_profiles:', { social, gaming, professional, other });
            return { social, gaming, professional, other, isUsernameScan: true };
          }
        }
        
        // Fall back to findings table
        const { data, error } = await (supabase as any).from('findings').select('kind, severity, evidence, provider, meta').eq('scan_id', scanId);
        if (error) throw error;
        
        console.log('[FootprintDNA] Scan findings:', { scanId, count: data?.length, sample: data?.[0] });
        
        // If no findings, return proper empty state
        if (!data || data.length === 0) {
          console.log('[FootprintDNA] No findings for scan, returning empty state');
          
          return isUsernameScan 
            ? { social: 0, gaming: 0, professional: 0, other: 0, isUsernameScan: true }
            : { breaches: 0, exposures: 0, dataBrokers: 0, darkWeb: 0, isUsernameScan: false };
        }
        
        const metrics = calculateMetrics(data);
        console.log('[FootprintDNA] Calculated metrics:', metrics);
        return metrics;
      } catch (err) {
        console.error('Error fetching scan metrics:', err);
        return { breaches: 0, exposures: 0, dataBrokers: 0, darkWeb: 0, isUsernameScan: false };
      }
    }

    // Priority 2: Try to map jobId to scanId
    if (jobId) {
      try {
        const { data: jobData } = await (supabase as any).from('scan_jobs').select('username, requested_by').eq('id', jobId).single();
        if (jobData?.username) {
          const { data: scanData } = await (supabase as any).from('scans').select('id').eq('username', jobData.username).eq('user_id', jobData.requested_by).order('created_at', { ascending: false }).limit(1).single();
          if (scanData?.id) {
            const { data: findings } = await (supabase as any).from('findings').select('kind, severity, evidence, provider, meta').eq('scan_id', scanData.id);
            if (findings && findings.length > 0) return calculateMetrics(findings);
          }
        }
      } catch (err) {
        console.error('Error mapping jobId to scanId:', err);
      }
    }

    // Priority 3: Fall back to workspace-wide findings
    if (!workspace?.id) return { breaches: 0, exposures: 0, dataBrokers: 0, darkWeb: 0, isUsernameScan: false };

    try {
      const { data, error } = await (supabase as any)
        .from('findings')
        .select('kind, severity, evidence, provider, meta')
        .eq('workspace_id', workspace.id);
      if (error) throw error;
      return calculateMetrics(data || []);
    } catch (err) {
      console.error('Error fetching workspace-wide findings:', err);
      return { breaches: 0, exposures: 0, dataBrokers: 0, darkWeb: 0, isUsernameScan: false };
    }
  };

  const { data: footprintData, refetch, isLoading } = useQuery({
    queryKey: ["footprint-metrics", workspace?.id || null, jobId, scanId],
    queryFn: fetchFootprintMetrics,
    initialData: { breaches: 0, exposures: 0, dataBrokers: 0, darkWeb: 0, isUsernameScan: false },
    enabled: !!(workspace?.id || scanId || jobId),
  });

  // Fetch scan status and subscribe to changes - triggers refetch when scan completes
  useEffect(() => {
    if (!scanId) return;

    // Fetch initial scan status
    const fetchScanStatus = async () => {
      const { data } = await supabase
        .from('scans')
        .select('status')
        .eq('id', scanId)
        .maybeSingle();
      
      if (data?.status) {
        setScanStatus(data.status);
        // If scan is already completed, refetch metrics immediately
        if (TERMINAL_STATES.includes(data.status)) {
          console.log('[DNA] Scan already completed, fetching metrics...');
          refetch();
        }
      }
    };

    fetchScanStatus();

    // Subscribe to scan status changes
    const channel = supabase
      .channel(`dna-scan-status-${scanId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'scans',
          filter: `id=eq.${scanId}`,
        },
        (payload) => {
          const newStatus = (payload.new as any)?.status;
          setScanStatus(newStatus);
          if (TERMINAL_STATES.includes(newStatus)) {
            console.log('[DNA] Scan completed, refetching metrics...');
            refetch();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [scanId, refetch]);

  // Poll for updates while scan is in progress
  useEffect(() => {
    if (!scanId) return;
    
    // If scan is not in a terminal state, poll every 5 seconds
    if (scanStatus && !TERMINAL_STATES.includes(scanStatus)) {
      const interval = setInterval(() => {
        console.log('[DNA] Polling for metrics (scan in progress)...');
        refetch();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [scanId, scanStatus, refetch]);

  // Set up real-time subscription for finding inserts
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
    aiScore(footprintData, footprintData.isUsernameScan).then(setScore);
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

  // Dynamic metrics based on scan type
  const metrics: MetricData[] = footprintData.isUsernameScan
    ? [
        {
          label: "Social",
          value: ('social' in footprintData ? footprintData.social : 0),
          icon: Users,
          sparklineData: generateSparkline('social' in footprintData ? footprintData.social : 0).map(d => d.value),
          color: "text-blue-500",
        },
        {
          label: "Gaming",
          value: ('gaming' in footprintData ? footprintData.gaming : 0),
          icon: Gamepad,
          sparklineData: generateSparkline('gaming' in footprintData ? footprintData.gaming : 0).map(d => d.value),
          color: "text-purple-500",
        },
        {
          label: "Professional",
          value: ('professional' in footprintData ? footprintData.professional : 0),
          icon: Briefcase,
          sparklineData: generateSparkline('professional' in footprintData ? footprintData.professional : 0).map(d => d.value),
          color: "text-green-500",
        },
        {
          label: "Other",
          value: ('other' in footprintData ? footprintData.other : 0),
          icon: Globe,
          sparklineData: generateSparkline('other' in footprintData ? footprintData.other : 0).map(d => d.value),
          color: "text-gray-500",
        },
      ]
    : [
        {
          label: "Breaches",
          value: ('breaches' in footprintData ? footprintData.breaches : 0),
          icon: AlertTriangle,
          sparklineData: generateSparkline('breaches' in footprintData ? footprintData.breaches : 0).map(d => d.value),
          color: "text-red-500",
        },
        {
          label: "Exposures",
          value: ('exposures' in footprintData ? footprintData.exposures : 0),
          icon: Eye,
          sparklineData: generateSparkline('exposures' in footprintData ? footprintData.exposures : 0).map(d => d.value),
          color: "text-orange-500",
        },
        {
          label: "Data Brokers",
          value: ('dataBrokers' in footprintData ? footprintData.dataBrokers : 0),
          icon: Database,
          sparklineData: generateSparkline('dataBrokers' in footprintData ? footprintData.dataBrokers : 0).map(d => d.value),
          color: "text-blue-500",
        },
        {
          label: "Dark Web",
          value: ('darkWeb' in footprintData ? footprintData.darkWeb : 0),
          icon: Shield,
          sparklineData: generateSparkline('darkWeb' in footprintData ? footprintData.darkWeb : 0).map(d => d.value),
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
