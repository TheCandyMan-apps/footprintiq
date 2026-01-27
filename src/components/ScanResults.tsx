import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertTriangle, CheckCircle2, ExternalLink, Trash2, Users, Flag, Filter, ChevronRight, Brain, Link2, Shield, Globe, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ResultsSkeleton } from "@/components/skeletons/ResultsSkeleton";
import { motion, AnimatePresence } from "framer-motion";
import { AIFilteringBadge } from "@/components/AIFilteringBadge";
import { ConfidenceScoreBadge } from "@/components/ConfidenceScoreBadge";
import { ConfidenceScoreIndicator } from "@/components/ConfidenceScoreIndicator";
import { ResultDetailDrawer } from "@/components/scan/ResultDetailDrawer";
import { PostScanUpgradeBanner } from "@/components/upsell/PostScanUpgradeBanner";
import { PostScanUpgradeModal } from "@/components/upsell/PostScanUpgradeModal";
import { ViralSharePrompt } from "@/components/growth/ViralSharePrompt";
import { PartiallyLockedSection, InlineLockBadge } from "@/components/results/PartiallyLockedSection";
import { CorrelationGraph } from "@/components/results/CorrelationGraph";
import { useResultsGating } from "@/components/billing/GatedContent";
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
  confidenceScore?: number;
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
  confidenceScore?: number;
}

export const ScanResults = ({ searchData, scanId }: ScanResultsProps) => {
  const { toast } = useToast();
  const { isFree, canSeeConfidenceExplanation, canSeeContextEnrichment, canSeeCorrelation, canSeeEvidence } = useResultsGating();
  const [removedSources, setRemovedSources] = useState<Set<string>>(new Set());
  const [removedProfiles, setRemovedProfiles] = useState<Set<string>>(new Set());
  const [flaggedItems, setFlaggedItems] = useState<Set<string>>(new Set());
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [socialProfiles, setSocialProfiles] = useState<SocialMediaProfile[]>([]);
  const [scanData, setScanData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLowConfidence, setShowLowConfidence] = useState(false);
  const [aiFilterStats, setAiFilterStats] = useState<{
    removedCount: number;
    confidenceImprovement: number;
    provider: string;
  } | null>(null);
  
  // Detail drawer state
  type ResultItem = 
    | { type: 'data_source'; data: DataSource }
    | { type: 'social_profile'; data: SocialMediaProfile };
  const [selectedItem, setSelectedItem] = useState<ResultItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Post-scan upgrade modal state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const hasShownModalRef = useRef(false);

  const handleOpenDetail = (item: ResultItem) => {
    setSelectedItem(item);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedItem(null);
  };

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
        let transformedSources: DataSource[] = sources.map(source => ({
          id: source.id,
          name: source.name,
          category: source.category,
          dataFound: source.data_found || [],
          riskLevel: source.risk_level as "high" | "medium" | "low",
          url: source.url,
          confidenceScore: source.confidence_score || 75
        }));

        // Fetch social profiles
        const { data: profiles, error: profilesError } = await supabase
          .from('social_profiles')
          .select('*')
          .eq('scan_id', scanId);

        if (profilesError) throw profilesError;
        
        // Transform social profiles to match interface
        let transformedProfiles: SocialMediaProfile[] = profiles.map(profile => ({
          id: profile.id,
          platform: profile.platform,
          username: profile.username,
          profileUrl: profile.profile_url,
          found: profile.found,
          followers: profile.followers,
          lastActive: profile.metadata && typeof profile.metadata === 'object' && 'last_active' in profile.metadata 
            ? profile.metadata.last_active as string 
            : undefined,
          source: profile.source,
          confidenceScore: profile.confidence_score || 85
        }));

        // Apply AI filtering to remove false positives
        try {
          console.log('Applying AI filtering...');
          const allFindings = [
            ...transformedSources.map(s => ({ ...s, type: 'data_source' })),
            ...transformedProfiles.map(p => ({ ...p, type: 'social_profile' }))
          ];

          const { data: filterResult, error: filterError } = await supabase.functions.invoke(
            'ai-filter-findings',
            {
              body: { 
                rawFindings: allFindings,
                scanId: scanId
              }
            }
          );

          if (filterError) {
            console.error('AI filtering error:', filterError);
            throw filterError;
          }

          if (filterResult?.validFindings) {
            // Separate filtered findings back into sources and profiles
            const filteredSources = filterResult.validFindings
              .filter((f: any) => f.type === 'data_source')
              .map(({ type, ...rest }: any) => rest);
            
            const filteredProfiles = filterResult.validFindings
              .filter((f: any) => f.type === 'social_profile')
              .map(({ type, ...rest }: any) => rest);

            transformedSources = filteredSources;
            transformedProfiles = filteredProfiles;

            // Show improvement toast
            if (filterResult.improvements) {
              const { removedCount, improvements } = filterResult;
              
              // Store stats for display
              setAiFilterStats({
                removedCount,
                confidenceImprovement: improvements.averageConfidenceImprovement,
                provider: improvements.provider
              });

              if (removedCount > 0) {
                toast({
                  title: "AI Filtering Applied",
                  description: `Removed ${removedCount} potential false positives. Confidence improved by ${improvements.averageConfidenceImprovement.toFixed(1)}% using ${improvements.provider}.`,
                });
              }
            }
          }
        } catch (aiError) {
          console.warn('AI filtering failed, using raw results:', aiError);
          // Continue with unfiltered results
        }

        setDataSources(transformedSources);
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

  // Trigger upgrade modal after scan loads for free users with locked content
  useEffect(() => {
    // Only trigger once per session, when loading is complete
    if (loading || hasShownModalRef.current) return;
    
    // Only show for free users
    if (!isFree) return;
    
    // Check if there are locked sections (Pro features user can't access)
    const hasLockedContent = !canSeeConfidenceExplanation || !canSeeContextEnrichment || !canSeeCorrelation || !canSeeEvidence;
    
    if (hasLockedContent) {
      // Small delay to let user glimpse results first
      const timer = setTimeout(() => {
        setShowUpgradeModal(true);
        hasShownModalRef.current = true;
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [loading, isFree, canSeeConfidenceExplanation, canSeeContextEnrichment, canSeeCorrelation, canSeeEvidence]);

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

  const handleFalsePositive = async (findingId: string, findingType: 'data_source' | 'social_profile', findingName: string, confidenceScore: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('feedback')
        .insert({
          scan_id: scanId,
          user_id: user.id,
          finding_type: findingType,
          finding_id: findingId,
          finding_name: findingName,
          confidence_score: confidenceScore,
          reason: 'false_positive'
        });

      if (error) throw error;

      setFlaggedItems(prev => new Set(prev).add(findingId));
      toast({
        title: "Flagged as False Positive",
        description: "Thank you! This feedback helps improve our detection accuracy.",
      });
    } catch (error) {
      console.error('Error flagging false positive:', error);
      toast({
        title: "Error",
        description: "Failed to flag item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getConfidenceBadge = (score: number) => {
    if (score > 80) {
      return { variant: "default" as const, color: "bg-green-500/20 text-green-700 border-green-500/30", label: `${score}% confident` };
    } else if (score >= 50) {
      return { variant: "secondary" as const, color: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30", label: `${score}% confident` };
    } else {
      return { variant: "destructive" as const, color: "bg-red-500/20 text-red-700 border-red-500/30", label: `${score}% confident` };
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "secondary";
    }
  };

  const filterByConfidence = <T extends { confidenceScore?: number }>(items: T[]) => {
    return showLowConfidence ? items : items.filter(item => (item.confidenceScore || 0) >= 30);
  };

  const activeResults = filterByConfidence(dataSources.filter(r => !removedSources.has(r.id) && !flaggedItems.has(r.id)));
  const removedCount = removedSources.size;
  const foundProfiles = socialProfiles.filter(p => p.found);
  const activeProfiles = filterByConfidence(foundProfiles.filter(p => !removedProfiles.has(p.id) && !flaggedItems.has(p.id)));
  const profileRemovedCount = removedProfiles.size;
  const lowConfidenceCount = [...dataSources, ...foundProfiles].filter(item => (item.confidenceScore || 0) < 30).length;

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
            
            {/* Educational microcopy */}
            <p className="text-xs text-muted-foreground mt-6 max-w-lg mx-auto">
              Most people don't realise this information is publicly accessible. Attackers rely on correlation, not hacking.
            </p>
          </div>
        </Card>

        {/* Post-scan upgrade banner for free users */}
        <PostScanUpgradeBanner 
          totalFindings={dataSources.length + foundProfiles.length}
          highRiskCount={dataSources.filter(r => r.riskLevel === "high").length}
        />

        {/* Pro Analysis Features - Inline locks now shown within result cards */}

        {/* Overall Confidence Score Summary - Only for Pro users */}
        {canSeeConfidenceExplanation ? (
          <Card className="p-6 mb-6 bg-gradient-card border-border">
            <h3 className="text-lg font-semibold mb-4">Data Quality Overview</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <ConfidenceScoreIndicator
                score={Math.round(
                  [...dataSources, ...foundProfiles].reduce((sum, item) => sum + (item.confidenceScore || 75), 0) / 
                  (dataSources.length + foundProfiles.length)
                )}
                label="Average Confidence"
                showDetails={true}
                providerCount={new Set([...dataSources.map(d => d.category), ...foundProfiles.map(p => p.platform)]).size}
              />
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">High Confidence</span>
                  <span className="font-semibold">
                    {[...dataSources, ...foundProfiles].filter(item => (item.confidenceScore || 75) >= 85).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Medium Confidence</span>
                  <span className="font-semibold">
                    {[...dataSources, ...foundProfiles].filter(item => {
                      const score = item.confidenceScore || 75;
                      return score >= 50 && score < 85;
                    }).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Low Confidence</span>
                  <span className="font-semibold text-orange-600">
                    {lowConfidenceCount}
                  </span>
                </div>
                {/* Educational microcopy */}
                <p className="text-[10px] text-muted-foreground/70 pt-2 border-t border-border/50">
                  Public data becomes risky when combined. Confidence reflects match quality, not threat level.
                </p>
              </div>
            </div>
          </Card>
        ) : null}

        {/* AI Filtering Badge - Only for Pro users */}
        {aiFilterStats && canSeeConfidenceExplanation && (
          <AIFilteringBadge
            removedCount={aiFilterStats.removedCount}
            confidenceImprovement={aiFilterStats.confidenceImprovement}
            provider={aiFilterStats.provider}
          />
        )}

        {/* Confidence Filter Toggle - Only for Pro users */}
        {lowConfidenceCount > 0 && canSeeConfidenceExplanation && (
          <Card className="p-4 mb-6 bg-muted/30 border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="low-confidence-toggle" className="text-sm font-medium cursor-pointer">
                    Show Low Confidence Results
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {lowConfidenceCount} findings below 30% confidence hidden
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                    False positives happen — validation matters.
                  </p>
                </div>
              </div>
              <Switch
                id="low-confidence-toggle"
                checked={showLowConfidence}
                onCheckedChange={setShowLowConfidence}
              />
            </div>
          </Card>
        )}

        {/* Identity Correlation Graph - Pro gated */}
        {(foundProfiles.length > 0 || dataSources.length > 0) && (
          <div className="mb-8">
            <PartiallyLockedSection
              title="Identity Connections"
              icon={Link2}
              isGated={isFree}
              lockedReason="Unlock correlation graph"
              blurredPreview={
                <CorrelationGraph
                  profiles={activeProfiles}
                  dataSources={activeResults}
                  searchQuery={searchData?.username || searchData?.email}
                  compact
                />
              }
            >
              <CorrelationGraph
                profiles={activeProfiles}
                dataSources={activeResults}
                searchQuery={searchData?.username || searchData?.email}
              />
            </PartiallyLockedSection>
          </div>
        )}

        {/* Social Media Results */}
        {foundProfiles.length > 0 && (
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-semibold">Social Media Profiles Found</h3>
            </div>
            
            <AnimatePresence mode="popLayout">
              <div className="grid md:grid-cols-2 gap-4">
                {activeProfiles.map((profile) => {
                  const confidenceBadge = getConfidenceBadge(profile.confidenceScore || 85);
                  const isLowConfidence = (profile.confidenceScore || 85) < 50;
                  
                  return (
                    <motion.div
                      key={profile.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ 
                        opacity: isLowConfidence ? 0.6 : 1, 
                        scale: 1 
                      }}
                      exit={{ opacity: 0, scale: 0.8, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                       <Card 
                          className="p-4 bg-gradient-card border-border hover:shadow-glow transition-all duration-300 cursor-pointer"
                          onClick={() => handleOpenDetail({ type: 'social_profile', data: profile })}
                        >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <h4 className="font-semibold">{profile.platform}</h4>
                              <Badge variant="secondary" className="text-xs">Active</Badge>
                              {/* Provider badge removed - findings should be source-agnostic */}
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">{profile.username}</p>
                            {profile.followers && (
                              <p className="text-xs text-muted-foreground">{profile.followers} followers</p>
                            )}
                            {profile.lastActive && (
                              <p className="text-xs text-muted-foreground">Last active: {profile.lastActive}</p>
                            )}
                          </div>
                          <div className="flex gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.open(profile.profileUrl, '_blank')}
                              title="View Profile"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFalsePositive(profile.id, 'social_profile', profile.platform, profile.confidenceScore || 85)}
                              disabled={flaggedItems.has(profile.id)}
                              title="Flag as False Positive"
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <Flag className="w-4 h-4" />
                            </Button>
                            {/* Removal guidance - disabled until fully implemented */}
                            <Button 
                              variant="ghost"
                              size="sm"
                              disabled
                              className="cursor-not-allowed opacity-60"
                              title="Removal workflow coming soon"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Confidence Score + View Details */}
                        <div className="pt-3 border-t border-border flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ConfidenceScoreBadge 
                              score={profile.confidenceScore || 85}
                              size="sm"
                            />
                            {isFree && <InlineLockBadge label="Details" />}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span>View Details</span>
                            <ChevronRight className="w-3 h-3" />
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>

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
          
          <AnimatePresence mode="popLayout">
            {activeResults.map((source) => {
              const confidenceBadge = getConfidenceBadge(source.confidenceScore || 75);
              const isLowConfidence = (source.confidenceScore || 75) < 50;
              
              return (
                <motion.div
                  key={source.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: isLowConfidence ? 0.6 : 1, 
                    y: 0 
                  }}
                  exit={{ opacity: 0, x: -100, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card 
                    className="p-6 bg-gradient-card border-border hover:shadow-glow transition-all duration-300 cursor-pointer"
                    onClick={() => handleOpenDetail({ type: 'data_source', data: source })}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
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
                      
                      <div className="flex gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(source.url, '_blank')}
                          title="View Source"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View
                        </Button>
                        <Button 
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFalsePositive(source.id, 'data_source', source.name, source.confidenceScore || 75)}
                          disabled={flaggedItems.has(source.id)}
                          title="Flag as False Positive"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Flag className="w-4 h-4" />
                        </Button>
                        {/* Removal guidance - disabled until fully implemented */}
                        <Button 
                          variant="outline"
                          size="sm"
                          disabled
                          className="cursor-not-allowed opacity-60"
                          title="Removal workflow coming soon"
                        >
                          <Trash2 className="w-4 h-4" />
                          Removal guidance (coming soon)
                        </Button>
                      </div>
                    </div>
                    
                    {/* Confidence Score + View Details */}
                    <div className="pt-4 border-t border-border flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ConfidenceScoreBadge 
                          score={source.confidenceScore || 75}
                          size="sm"
                        />
                        {isFree && <InlineLockBadge label="Context" />}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>View Details</span>
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>

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

        {/* Viral share prompt - positioned before locked AI Analysis */}
        {isFree && (
          <ViralSharePrompt className="mt-8" placement="pre_locked" scanId={scanId} />
        )}

        {/* AI Analysis - shown inline with Pro lock for Free users */}
        {isFree && (
          <div className="mt-6">
            <PartiallyLockedSection
              title="AI Analysis & Interpretation"
              icon={Brain}
              isGated={isFree}
              lockedReason="Unlock full context"
              blurredPreview={
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
              }
            >
              {/* Pro content would go here */}
              <div />
            </PartiallyLockedSection>
          </div>
        )}
      </div>

      {/* Result Detail Drawer with Context Enrichment */}
      <ResultDetailDrawer
        item={selectedItem}
        open={drawerOpen}
        onClose={handleCloseDrawer}
        onRemovalRequest={(id, name) => {
          if (selectedItem?.type === 'data_source') {
            handleRemovalRequest(id, name);
          } else {
            handleProfileRemoval(id, name);
          }
          handleCloseDrawer();
        }}
        onFlagFalsePositive={(id, type, name, score) => {
          handleFalsePositive(id, type, name, score);
        }}
        isFlagged={selectedItem ? flaggedItems.has(
          selectedItem.type === 'data_source' ? selectedItem.data.id : selectedItem.data.id
        ) : false}
      />

      {/* Post-Scan Upgrade Modal */}
      <PostScanUpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        lockedSectionsCount={[canSeeConfidenceExplanation, canSeeContextEnrichment, canSeeCorrelation, canSeeEvidence].filter(v => !v).length}
        highRiskCount={dataSources.filter(r => r.riskLevel === "high").length}
      />
    </div>
  );
};
