import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useWorkspace } from "@/hooks/useWorkspace";
import { Search, Crown, Lock, Loader2, Info, ExternalLink, CheckCircle2 } from "lucide-react";
import { WhatsMyNameConsentModal } from "./WhatsMyNameConsentModal";
import { ScanProgressDialog } from "./ScanProgressDialog";

interface WhatsMyNameMatch {
  site: string;
  url: string;
  category: string;
  confidence: number;
  found: boolean;
}

interface WhatsMyNameTabProps {
  subscriptionTier: string;
}

export const WhatsMyNameTab = ({ subscriptionTier }: WhatsMyNameTabProps) => {
  const [username, setUsername] = useState("");
  const [filters, setFilters] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<WhatsMyNameMatch[]>([]);
  const [showConsent, setShowConsent] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);
  const { toast } = useToast();
  const { workspace } = useWorkspace();

  const isPremium = subscriptionTier === 'premium' || subscriptionTier === 'enterprise';

  const handleScan = async () => {
    if (!consentAccepted) {
      setShowConsent(true);
      return;
    }

    if (!username.trim()) {
      toast({
        title: "Username Required",
        description: "Please enter a username to scan",
        variant: "destructive",
      });
      return;
    }

    if (!workspace?.id) {
      toast({
        title: "Workspace Required",
        description: "Please select a workspace",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setProgressOpen(true);

    try {
      const { data, error } = await supabase.functions.invoke('whatsmyname-scan', {
        body: {
          username: username.trim(),
          filters: filters.trim(),
          workspaceId: workspace.id,
        },
      });

      if (error) {
        if (error.message?.includes('Premium') || error.message?.includes('upgrade')) {
          toast({
            title: "Premium Required",
            description: "WhatsMyName scans require a Premium subscription",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      if (data?.results) {
        // Parse results into matches array
        const matches: WhatsMyNameMatch[] = Object.entries(data.results?.sites || {}).map(([site, info]: [string, any]) => ({
          site,
          url: info.url || '#',
          category: info.category || 'Unknown',
          confidence: info.confidence || 0.5,
          found: info.found !== false,
        }));

        setResults(matches.filter(m => m.found));
        
        toast({
          title: "Scan Complete",
          description: `Found ${matches.filter(m => m.found).length} matches across 500+ sites`,
        });
      }
    } catch (err) {
      console.error('[WhatsMyNameTab] Scan error:', err);
      toast({
        title: "Scan Failed",
        description: err instanceof Error ? err.message : 'Failed to scan username',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setProgressOpen(false);
    }
  };

  const handleSaveToCase = async () => {
    if (!workspace?.id || results.length === 0) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('cases').insert({
        user_id: user.id,
        title: `WhatsMyName: ${username}`,
        description: `Username scan for ${username}`,
        results: results.map(r => ({
          site: r.site,
          url: r.url,
          category: r.category,
          confidence: r.confidence,
        })),
        status: 'open',
      });

      if (error) throw error;

      toast({
        title: "Saved to Cases",
        description: `${results.length} results saved successfully`,
      });
    } catch (err) {
      console.error('[WhatsMyNameTab] Save error:', err);
      toast({
        title: "Save Failed",
        description: err instanceof Error ? err.message : 'Failed to save to case',
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              WhatsMyName Enrich
              {!isPremium && <Badge variant="secondary"><Crown className="h-3 w-3 mr-1" />Premium</Badge>}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Search for usernames across 500+ social media sites and platforms
            </p>
          </div>
        </div>

        {!isPremium ? (
          <Alert className="border-primary/20 bg-primary/5">
            <Lock className="h-4 w-4" />
            <AlertDescription>
              <strong>Upgrade to Premium</strong> for 500+ site username checks! Discover profiles across social networks, forums, and specialized platforms.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username to search"
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="filters">
                Filters (Optional)
                <span className="text-xs text-muted-foreground ml-2">
                  e.g., "category:social" or "category:gaming"
                </span>
              </Label>
              <Input
                id="filters"
                value={filters}
                onChange={(e) => setFilters(e.target.value)}
                placeholder="category:social, category:gaming, etc."
                disabled={loading}
              />
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <strong>Cost:</strong> 10 credits per scan. Searches 500+ sites for username matches.
              </AlertDescription>
            </Alert>

            <Button 
              onClick={handleScan} 
              disabled={loading || !username.trim()}
              className="w-full gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Scanning 500+ Sites...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Start WhatsMyName Scan
                </>
              )}
            </Button>
          </div>
        )}
      </Card>

      {results.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">
              Found {results.length} matches for "{username}"
            </h4>
            <Button onClick={handleSaveToCase} variant="outline" size="sm">
              Save to Case
            </Button>
          </div>

          <div className="grid gap-3 max-h-[500px] overflow-y-auto">
            {results.map((match, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border hover:border-primary/30 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="font-medium">{match.site}</span>
                    <Badge variant="secondary" className="text-xs">
                      {match.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Confidence: {Math.round(match.confidence * 100)}%
                    </span>
                    {match.url !== '#' && (
                      <a
                        href={match.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        View Profile <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <WhatsMyNameConsentModal
        open={showConsent}
        onOpenChange={setShowConsent}
        onAccept={() => {
          setConsentAccepted(true);
          setShowConsent(false);
          handleScan();
        }}
      />

      <ScanProgressDialog
        open={progressOpen}
        onOpenChange={setProgressOpen}
        scanId={null}
        onComplete={() => setProgressOpen(false)}
      />
    </div>
  );
};
