import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AIAnalysis } from "@/components/AIAnalysis";
import { CatfishDetection } from '@/components/CatfishDetection';
import { TimelineChart } from "@/components/TimelineChart";
import { GraphExplorer } from "@/components/GraphExplorer";
import { MonitoringToggle } from "@/components/MonitoringToggle";
import { clusterFindingsByDate } from "@/lib/timeline";
import { buildGraph } from "@/lib/graph";
import { Finding } from "@/lib/ufm";
import { ExportControls } from "@/components/ExportControls";
import { 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink, 
  Trash2, 
  Users,
  Download,
  ArrowLeft,
  TrendingUp,
  Shield,
  Info
} from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface DataSource {
  id: string;
  name: string;
  category: string;
  url: string;
  risk_level: string;
  data_found: string[];
  metadata?: any;
}

interface SocialProfile {
  id: string;
  platform: string;
  username: string;
  profile_url: string;
  found: boolean;
  followers?: string;
  last_active?: string;
  is_verified?: boolean;
  account_id?: string;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  account_type?: string;
  metadata?: any;
}

interface Scan {
  id: string;
  scan_type: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  privacy_score: number;
  total_sources_found: number;
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
  created_at: string;
}

interface RemovalRequest {
  id: string;
  source_id: string;
  source_name: string;
  source_type: string;
  status: string;
}

const privacyTips = [
  "Use strong, unique passwords for each account",
  "Enable two-factor authentication wherever available",
  "Regularly review and adjust your social media privacy settings",
  "Be cautious about sharing personal information online",
  "Use a VPN when connecting to public Wi-Fi",
  "Regularly search for your name online to monitor your digital footprint",
  "Consider using privacy-focused search engines like DuckDuckGo",
  "Review app permissions and revoke unnecessary access",
];

const ResultsDetail = () => {
  const { scanId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [scan, setScan] = useState<Scan | null>(null);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [socialProfiles, setSocialProfiles] = useState<SocialProfile[]>([]);
  const [removalRequests, setRemovalRequests] = useState<RemovalRequest[]>([]);
  const [redactPII, setRedactPII] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchScanData();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, scanId]);

  const fetchScanData = async () => {
    if (!scanId) return;

    setLoading(true);

    try {
      // Fetch scan
      const { data: scanData, error: scanError } = await supabase
        .from("scans")
        .select("*")
        .eq("id", scanId)
        .single();

      if (scanError) throw scanError;
      setScan(scanData);

      // Fetch data sources
      const { data: sources, error: sourcesError } = await supabase
        .from("data_sources")
        .select("*")
        .eq("scan_id", scanId);

      if (sourcesError) throw sourcesError;
      setDataSources(sources || []);

      // Fetch social profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("social_profiles")
        .select("*")
        .eq("scan_id", scanId)
        .eq("found", true);

      if (profilesError) throw profilesError;
      setSocialProfiles(profiles || []);

      // Fetch removal requests
      const { data: requests, error: requestsError } = await supabase
        .from("removal_requests")
        .select("*")
        .eq("scan_id", scanId);

      if (requestsError) throw requestsError;
      setRemovalRequests(requests || []);

    } catch (error: any) {
      console.error("Error fetching scan data:", error);
      toast({
        title: "Error loading scan",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemovalRequest = async (sourceId: string, sourceName: string, sourceType: string) => {
    if (!user || !scanId) return;

    const { error } = await supabase
      .from("removal_requests")
      .insert({
        user_id: user.id,
        scan_id: scanId,
        source_id: sourceId,
        source_name: sourceName,
        source_type: sourceType,
        status: 'pending',
      });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Removal Request Initiated",
        description: `We've started the removal process for ${sourceName}. This may take 7-30 days.`,
      });
      fetchScanData();
    }
  };

  const handleExportReport = () => {
    if (!scan) return;

    const report = {
      scan_date: new Date(scan.created_at).toLocaleDateString(),
      privacy_score: scan.privacy_score,
      total_sources: scan.total_sources_found,
      high_risk: scan.high_risk_count,
      medium_risk: scan.medium_risk_count,
      low_risk: scan.low_risk_count,
      data_sources: dataSources,
      social_profiles: socialProfiles,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `privacy-scan-${scan.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Report exported",
      description: "Your privacy scan report has been downloaded.",
    });
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "secondary";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreMessage = (score: number) => {
    if (score >= 80) return "Great! Your privacy is well protected.";
    if (score >= 60) return "Good, but there's room for improvement.";
    return "Your privacy is at risk. Take action now.";
  };

  const isRemovalRequested = (sourceId: string, sourceType: string) => {
    return removalRequests.some(
      r => r.source_id === sourceId && r.source_type === sourceType
    );
  };

  // Build findings array for exports and graph
  const findingsForExport: Finding[] = [
    ...dataSources.map(source => ({
      id: source.id,
      type: 'breach' as const,
      title: source.name,
      description: source.category,
      severity: source.risk_level as any,
      confidence: 0.9,
      provider: 'OSINT Scan',
      providerCategory: source.category,
      evidence: source.data_found.map(d => ({ key: 'data', value: d })),
      impact: `Found on ${source.name}`,
      remediation: ['Request removal from this source'],
      tags: [source.category],
      observedAt: new Date().toISOString(),
      url: source.url
    } as Finding)),
    ...socialProfiles.map(profile => ({
      id: profile.id,
      title: `${profile.platform}: @${profile.username}`,
      description: profile.profile_url,
      severity: 'low',
      confidence: 0.8,
      provider: 'Social Profile',
      providerCategory: profile.platform,
      evidence: [
        { key: 'username', value: profile.username },
        { key: 'url', value: profile.profile_url },
        ...(profile.full_name ? [{ key: 'name', value: profile.full_name }] : []),
      ],
      impact: `Profile found on ${profile.platform}`,
      remediation: [],
      tags: [profile.platform],
      observedAt: new Date().toISOString(),
      url: profile.profile_url
    } as Finding))
  ];

  if (loading || !scan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8">Loading scan results...</Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Catfish Detection */}
        <div className="mb-8">
          <CatfishDetection scanId={scanId!} />
        </div>

        {/* AI Analysis */}
        <div className="mb-8">
          <AIAnalysis scanId={scanId!} />
        </div>

        {/* Timeline & Graph - Enhanced Intelligence */}
        {(dataSources.length > 0 || socialProfiles.length > 0) && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <TimelineChart 
              events={clusterFindingsByDate(
                dataSources.map(source => ({
                  id: source.id,
                  type: 'breach' as const,
                  title: source.name,
                  description: source.category,
                  severity: source.risk_level as any,
                  confidence: 0.9,
                  provider: 'OSINT Scan',
                  providerCategory: source.category,
                  evidence: source.data_found.map(d => ({ key: 'Data', value: d })),
                  impact: `Found on ${source.name}`,
                  remediation: ['Request removal from this source'],
                  tags: [source.category],
                  observedAt: new Date().toISOString(),
                  url: source.url
                } as Finding))
              )}
            />
            <GraphExplorer 
              {...buildGraph(
                dataSources.map(source => ({
                  id: source.id,
                  type: 'breach' as const,
                  title: source.name,
                  description: source.category,
                  severity: source.risk_level as any,
                  confidence: 0.9,
                  provider: 'OSINT Scan',
                  providerCategory: source.category,
                  evidence: source.data_found.map(d => ({ key: 'Data', value: d })),
                  impact: `Found on ${source.name}`,
                  remediation: ['Request removal from this source'],
                  tags: [source.category],
                  observedAt: new Date().toISOString(),
                  url: source.url
                } as Finding))
              )}
            />
          </div>
        )}

        {/* Summary Card */}
        <Card className="p-8 mb-8 bg-gradient-card border-border shadow-card">
          <div className="text-center">
            <Shield className={`w-16 h-16 mx-auto mb-4 ${getScoreColor(scan.privacy_score)}`} />
            <h2 className="text-3xl font-bold mb-2">Privacy Score</h2>
            <p className={`text-6xl font-bold mb-3 ${getScoreColor(scan.privacy_score)}`}>
              {scan.privacy_score}/100
            </p>
            <p className="text-lg text-muted-foreground mb-6">
              {getScoreMessage(scan.privacy_score)}
            </p>
            
            <div className="grid md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <div className="p-4 rounded-lg bg-background/50">
                <div className="text-2xl font-bold">{scan.total_sources_found}</div>
                <div className="text-sm text-muted-foreground">Total Sources</div>
              </div>
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="text-2xl font-bold text-destructive">{scan.high_risk_count}</div>
                <div className="text-sm text-muted-foreground">High Risk</div>
              </div>
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="text-2xl font-bold text-primary">{scan.medium_risk_count}</div>
                <div className="text-sm text-muted-foreground">Medium Risk</div>
              </div>
              <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                <div className="text-2xl font-bold text-accent">
                  {removalRequests.length}
                </div>
                <div className="text-sm text-muted-foreground">Removal Requests</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Privacy Tips */}
        <Card className="p-6 mb-8 bg-gradient-card border-border">
          <div className="flex items-start gap-3">
            <Info className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-semibold mb-3">Privacy Protection Tips</h3>
              <ul className="space-y-2">
                {privacyTips.slice(0, 4).map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        {/* Monitoring Toggle */}
        {user && scanId && (
          <div className="mb-8">
            <MonitoringToggle scanId={scanId} userId={user.id} />
          </div>
        )}

        {/* Social Media Results */}
        {socialProfiles.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-semibold">Social Media Profiles Found</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {socialProfiles.map((profile) => (
                <Card key={profile.id} className="p-5 bg-gradient-card border-border hover:shadow-glow transition-all duration-300">
                  <div className="flex gap-4">
                    {profile.avatar_url && (
                      <img 
                        src={profile.avatar_url} 
                        alt={`${profile.username} avatar`}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h4 className="font-semibold">{profile.platform}</h4>
                        {profile.is_verified && (
                          <Badge variant="default" className="text-xs">Verified</Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">Active</Badge>
                      </div>
                      
                      {profile.full_name && (
                        <p className="text-sm font-medium mb-1">{profile.full_name}</p>
                      )}
                      <p className="text-sm text-muted-foreground mb-2">@{profile.username}</p>
                      
                      {profile.bio && (
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{profile.bio}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
                        {profile.account_id && (
                          <span>ID: {profile.account_id}</span>
                        )}
                        {profile.followers && (
                          <span>{profile.followers} followers</span>
                        )}
                        {profile.last_active && (
                          <span>Active: {profile.last_active}</span>
                        )}
                      </div>

                      {profile.metadata && Object.keys(profile.metadata).length > 0 && (
                        <details className="text-xs mb-3">
                          <summary className="cursor-pointer text-primary hover:underline">
                            View Metadata
                          </summary>
                          <div className="mt-2 p-3 bg-background/50 rounded-md max-h-40 overflow-y-auto">
                            <table className="w-full text-xs">
                              <tbody>
                                {Object.entries(profile.metadata)
                                  .filter(([_, value]) => value !== null && value !== undefined)
                                  .map(([key, value]) => (
                                    <tr key={key} className="border-b border-border/50 last:border-0">
                                      <td className="py-1 pr-3 font-medium text-muted-foreground capitalize">
                                        {key.replace(/_/g, ' ')}
                                      </td>
                                      <td className="py-1 break-all">
                                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </details>
                      )}

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(profile.profile_url, '_blank')}
                          className="flex-1"
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View Profile
                        </Button>
                        <Button 
                          variant="accent"
                          size="sm"
                          onClick={() => handleRemovalRequest(profile.id, profile.platform, 'social_media')}
                          disabled={isRemovalRequested(profile.id, 'social_media')}
                        >
                          {isRemovalRequested(profile.id, 'social_media') ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Data Broker Results */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Data Broker Sources Found</h3>
          
          <div className="space-y-4">
            {dataSources.map((source) => (
              <Card key={source.id} className="p-6 bg-gradient-card border-border hover:shadow-glow transition-all duration-300">
                <div className="flex flex-col gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold">{source.name}</h4>
                      <Badge variant={getRiskColor(source.risk_level) as any}>
                        {source.risk_level.toUpperCase()} RISK
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{source.category}</p>
                    
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Data Found:</p>
                      <div className="flex flex-wrap gap-2">
                        {source.data_found.map((data, idx) => (
                          <span 
                            key={idx} 
                            className="px-3 py-1 rounded-full bg-secondary text-xs"
                          >
                            {data}
                          </span>
                        ))}
                      </div>
                    </div>

                    {source.metadata && Object.keys(source.metadata).length > 0 && (
                      <details className="text-sm">
                        <summary className="cursor-pointer text-primary hover:underline font-medium mb-2">
                          View Detailed Metadata
                        </summary>
                        <div className="mt-3 p-4 bg-background/50 rounded-md max-h-60 overflow-y-auto">
                          <table className="w-full text-sm">
                            <tbody>
                              {Object.entries(source.metadata)
                                .filter(([_, value]) => value !== null && value !== undefined && value !== '')
                                .map(([key, value]) => (
                                  <tr key={key} className="border-b border-border/50 last:border-0">
                                    <td className="py-2 pr-4 font-medium text-muted-foreground capitalize align-top">
                                      {key.replace(/_/g, ' ')}
                                    </td>
                                    <td className="py-2 break-all">
                                      {typeof value === 'object' ? (
                                        <pre className="text-xs bg-background/50 p-2 rounded overflow-x-auto">
                                          {JSON.stringify(value, null, 2)}
                                        </pre>
                                      ) : (
                                        String(value)
                                      )}
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </details>
                    )}
                  </div>
                  
                  <div className="flex gap-2 pt-2 border-t border-border/50">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(source.url, '_blank')}
                      className="flex-1"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Source
                    </Button>
                    <Button 
                      variant="accent"
                      size="sm"
                      onClick={() => handleRemovalRequest(source.id, source.name, 'data_broker')}
                      disabled={isRemovalRequested(source.id, 'data_broker')}
                    >
                      {isRemovalRequested(source.id, 'data_broker') ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Requested
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Request Removal
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDetail;