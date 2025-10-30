import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, ExternalLink, Trash2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ResultsSkeleton } from "@/components/skeletons/ResultsSkeleton";
import type { ScanFormData } from "./ScanForm";

interface ScanResultsProps {
  searchData: ScanFormData | null;
  scanId: string;
}

interface DataSource {
  id: string;
  name: string;
  category: string;
  dataFound: string[];
  riskLevel: "high" | "medium" | "low";
  url: string;
}

interface SocialMediaProfile {
  id: string;
  platform: string;
  username: string;
  profileUrl: string;
  found: boolean;
  followers?: string;
  lastActive?: string;
  source?: string;
}

export const ScanResults = ({ searchData, scanId }: ScanResultsProps) => {
  const { toast } = useToast();
  const [removedSources, setRemovedSources] = useState<Set<string>>(new Set());
  const [removedProfiles, setRemovedProfiles] = useState<Set<string>>(new Set());
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [socialProfiles, setSocialProfiles] = useState<SocialMediaProfile[]>([]);
  const [scanData, setScanData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScanResults = async () => {
      try {
        setLoading(true);
        
        // Fetch scan data
        const { data: scan, error: scanError } = await supabase
          .from('scans')
          .select('*')
          .eq('id', scanId)
          .single();

        if (scanError) throw scanError;
        setScanData(scan);

        // Fetch data sources
        const { data: sources, error: sourcesError } = await supabase
          .from('data_sources')
          .select('*')
          .eq('scan_id', scanId);

        if (sourcesError) throw sourcesError;
        
        // Transform data sources to match interface
        const transformedSources: DataSource[] = sources.map(source => ({
          id: source.id,
          name: source.name,
          category: source.category,
          dataFound: source.data_found || [],
          riskLevel: source.risk_level as "high" | "medium" | "low",
          url: source.url
        }));
        setDataSources(transformedSources);

        // Fetch social profiles
        const { data: profiles, error: profilesError } = await supabase
          .from('social_profiles')
          .select('*')
          .eq('scan_id', scanId);

        if (profilesError) throw profilesError;
        
        // Transform social profiles to match interface
        const transformedProfiles: SocialMediaProfile[] = profiles.map(profile => ({
          id: profile.id,
          platform: profile.platform,
          username: profile.username,
          profileUrl: profile.profile_url,
          found: profile.found,
          followers: profile.followers,
          lastActive: profile.metadata && typeof profile.metadata === 'object' && 'last_active' in profile.metadata 
            ? profile.metadata.last_active as string 
            : undefined,
          source: profile.source
        }));
        setSocialProfiles(transformedProfiles);
        
      } catch (error) {
        console.error('Error fetching scan results:', error);
        toast({
          title: "Error loading results",
          description: "Failed to load scan results. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchScanResults();
  }, [scanId, toast]);

  const handleRemovalRequest = (sourceId: string, sourceName: string) => {
    setRemovedSources(prev => new Set(prev).add(sourceId));
    toast({
      title: "Removal Request Initiated",
      description: `We've started the removal process for ${sourceName}. This may take 7-30 days.`,
    });
  };

  const handleProfileRemoval = (profileId: string, platform: string) => {
    setRemovedProfiles(prev => new Set(prev).add(profileId));
    toast({
      title: "Profile Deletion Started",
      description: `We're helping you delete your ${platform} profile. You'll receive instructions via email.`,
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

  const activeResults = dataSources.filter(r => !removedSources.has(r.id));
  const removedCount = removedSources.size;
  const foundProfiles = socialProfiles.filter(p => p.found);
  const activeProfiles = foundProfiles.filter(p => !removedProfiles.has(p.id));
  const profileRemovedCount = removedProfiles.size;

  if (loading) {
    return <ResultsSkeleton />;
  }

  return (
    <div className="min-h-screen px-6 py-20">
      <div className="max-w-6xl mx-auto">
        {/* Summary */}
        <Card className="p-8 mb-8 bg-gradient-card border-border shadow-card">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-3">Scan Complete</h2>
            <p className="text-lg text-muted-foreground mb-6">
              We found your personal information on <span className="text-foreground font-semibold">{dataSources.length} websites</span> and <span className="text-foreground font-semibold">{foundProfiles.length} social media platforms</span>
            </p>
            
            <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="text-2xl font-bold text-destructive">
                  {dataSources.filter(r => r.riskLevel === "high").length}
                </div>
                <div className="text-sm text-muted-foreground">High Risk</div>
              </div>
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="text-2xl font-bold text-primary">
                  {dataSources.filter(r => r.riskLevel === "medium").length}
                </div>
                <div className="text-sm text-muted-foreground">Medium Risk</div>
              </div>
              <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                <div className="text-2xl font-bold text-accent">
                  {removedCount}
                </div>
                <div className="text-sm text-muted-foreground">Removal Requested</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Social Media Results */}
        {foundProfiles.length > 0 && (
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-semibold">Social Media Profiles Found</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {activeProfiles.map((profile) => (
                <Card key={profile.id} className="p-4 bg-gradient-card border-border hover:shadow-glow transition-all duration-300">
                  <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{profile.platform}</h4>
                        <Badge variant="secondary" className="text-xs">Active</Badge>
                        {profile.source === 'predicta' && (
                          <Badge variant="default" className="text-xs bg-primary">Predicta Search</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{profile.username}</p>
                      {profile.followers && (
                        <p className="text-xs text-muted-foreground">{profile.followers} followers</p>
                      )}
                      {profile.lastActive && (
                        <p className="text-xs text-muted-foreground">Last active: {profile.lastActive}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(profile.profileUrl, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="accent"
                        size="sm"
                        onClick={() => handleProfileRemoval(profile.id, profile.platform)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {profileRemovedCount > 0 && (
              <Card className="p-4 bg-accent/10 border-accent/20">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                  <div>
                    <p className="text-sm font-medium">
                      {profileRemovedCount} profile deletion {profileRemovedCount === 1 ? 'request' : 'requests'} initiated
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Data Broker Results */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold mb-4">Data Broker Sources Found</h3>
          
          {activeResults.map((source) => (
            <Card key={source.id} className="p-6 bg-gradient-card border-border hover:shadow-glow transition-all duration-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold">{source.name}</h4>
                    <Badge variant={getRiskColor(source.riskLevel) as any}>
                      {source.riskLevel.toUpperCase()} RISK
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{source.category}</p>
                  <div className="flex flex-wrap gap-2">
                    {source.dataFound.map((data, idx) => (
                      <span 
                        key={idx} 
                        className="px-3 py-1 rounded-full bg-secondary text-xs"
                      >
                        {data}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(source.url, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                    View
                  </Button>
                  <Button 
                    variant="accent"
                    size="sm"
                    onClick={() => handleRemovalRequest(source.id, source.name)}
                  >
                    <Trash2 className="w-4 h-4" />
                    Request Removal
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {removedCount > 0 && (
            <Card className="p-6 bg-accent/10 border-accent/20">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-accent" />
                <div>
                  <h4 className="font-semibold">Removal Requests in Progress</h4>
                  <p className="text-sm text-muted-foreground">
                    {removedCount} removal {removedCount === 1 ? 'request has' : 'requests have'} been initiated. 
                    You'll be notified when complete.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
