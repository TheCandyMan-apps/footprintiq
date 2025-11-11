import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useTierGating } from "@/hooks/useTierGating";
import { Upload, Search, Lock, CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SubscriptionDebug } from "@/components/debug/SubscriptionDebug";

interface ImageMatch {
  thumbnail_url: string;
  url: string;
  domain: string;
  match_percent: number;
  crawl_date: string;
  score?: number;
  matchPercent?: number;
}

export function ReverseImageComponent() {
  const navigate = useNavigate();
  const { workspace } = useWorkspace();
const { checkFeatureAccess } = useTierGating();
  const reverseAccess = checkFeatureAccess('reverse_image_search');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<ImageMatch[]>([]);
  const [searchComplete, setSearchComplete] = useState(false);
  const [showVerifying, setShowVerifying] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image too large. Maximum size is 10MB");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSearch = async () => {
    if (!selectedFile || !workspace?.id) {
      toast.error("Please select an image first");
      return;
    }

    // Check credits first (10 credits required)
    const CREDIT_COST = 10;
    const { data: balanceData } = await supabase.rpc('get_credits_balance', {
      _workspace_id: workspace.id
    });
    
    const balance = balanceData || 0;
    
    // If no tier access and insufficient credits, show upgrade
    if (!reverseAccess.hasAccess && balance < CREDIT_COST) {
      toast.error("Premium subscription or credits required", {
        description: `Reverse Image Intel requires premium access or ${CREDIT_COST} credits (you have ${balance})`,
        action: {
          label: "Upgrade",
          onClick: () => navigate("/settings/billing"),
        },
      });
      return;
    }

    setIsSearching(true);
    setShowVerifying(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please refresh and sign in again");
        setIsSearching(false);
        return;
      }

      // Upload to temporary storage
      const fileName = `temp/${user.id}/${Date.now()}_${selectedFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('scan-images')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Create signed URL (1 hour expiration) for TinEye access
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('scan-images')
        .createSignedUrl(fileName, 3600);

      if (signedUrlError || !signedUrlData) {
        console.error('Failed to create signed URL:', signedUrlError);
        await supabase.storage.from('scan-images').remove([fileName]);
        throw new Error('Failed to create signed URL');
      }

      // Small delay for "verifying" UX
      setTimeout(() => setShowVerifying(false), 300);

      // Call reverse image search backend
      const { data, error } = await supabase.functions.invoke('reverse-image-search', {
        body: {
          imageUrl: signedUrlData.signedUrl,
          workspaceId: workspace.id,
        }
      });

      if (error) throw error;

      if (data.error) {
        if (data.required && data.current !== undefined) {
          throw new Error(`Insufficient credits: need ${data.required}, have ${data.current}`);
        }
        throw new Error(data.error);
      }

      // Delete temporary file
      await supabase.storage.from('scan-images').remove([fileName]);

      const matches = data.matches || [];
      setResults(matches.map((m: any) => ({
        thumbnail_url: m.thumbnail || m.url,
        url: m.url,
        domain: m.site,
        match_percent: m.matchPercent || m.score || 85,
        crawl_date: m.crawlDate || new Date().toISOString(),
        score: m.score,
        matchPercent: m.matchPercent,
      })));
      setSearchComplete(true);
      
      if (!data.providerConfigured && matches.length > 0) {
        toast.success(`Found ${matches.length} matches (sample data - TinEye not configured yet)`, {
          description: `${data.creditsDeducted} credits deducted`,
        });
      } else if (matches.length === 0) {
        toast.info("No matches found", {
          description: `${data.creditsDeducted} credits deducted`,
        });
      } else {
        toast.success(`Found ${matches.length} matches`, {
          description: `${data.creditsDeducted} credits deducted`,
        });
      }

    } catch (error) {
      console.error("Reverse image search error:", error);
      toast.error(error instanceof Error ? error.message : "Search failed");
    } finally {
      setIsSearching(false);
      setShowVerifying(false);
    }
  };

  const handleSaveToCase = async () => {
    if (!workspace?.id || results.length === 0) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create result item with type 'image'
      const resultItem = {
        type: 'image' as const,
        data: { matches: results },
        timestamp: new Date().toISOString(),
        source: 'TinEye'
      };

      const { data, error } = await supabase
        .from('cases')
        .insert({
          user_id: user.id,
          title: `Reverse Image Search - ${new Date().toLocaleDateString()}`,
          description: `Found ${results.length} matches`,
          status: 'open',
          priority: 'medium',
          image_results: results,
          results: [resultItem]
        } as any)
        .select()
        .single();

      if (error) throw error;

      toast.success("Saved to case", {
        description: "View in Workspaces",
        action: {
          label: "View",
          onClick: () => navigate('/workspaces')
        }
      });

    } catch (error) {
      console.error("Save to case error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save");
    }
  };

  // No blocking overlay - show premium badge but allow credit-based access
  return (
    <div className="space-y-4">
      <SubscriptionDebug />
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 w-5" />
              Reverse Image Intel
            </CardTitle>
            {!reverseAccess.hasAccess && (
              <Badge variant="default" className="gap-1">
                <Lock className="h-3 w-3" />
                Premium or Credits
              </Badge>
            )}
          </div>
          <CardDescription>
            Trace image origins across billions of indexed images • 10 credits per search
          </CardDescription>
        </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image-upload">Upload Image</Label>
            <div className="flex gap-2">
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isSearching}
              />
              <Button
                onClick={handleSearch}
                disabled={!selectedFile || isSearching}
                className="min-w-[120px]"
              >
                {isSearching ? (
                  <>
                    <Search className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </div>

          {previewUrl && (
            <div className="border rounded-lg p-4">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-48 mx-auto rounded-md"
              />
            </div>
          )}

          {showVerifying && (
            <Alert>
              <AlertDescription className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Verifying image...
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Results Section */}
        {searchComplete && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {results.length} {results.length === 1 ? 'Match' : 'Matches'} Found
              </h3>
              {results.length > 0 && (
                <Button onClick={handleSaveToCase} variant="outline" size="sm">
                  Save to Case
                </Button>
              )}
            </div>

            {results.length === 0 ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No matches found. Try uploading a different image.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.map((match, idx) => (
                  <Card key={idx} className="overflow-hidden">
                    <div className="aspect-video relative bg-muted">
                      <img
                        src={match.thumbnail_url}
                        alt={`Match ${idx + 1}`}
                        className="object-cover w-full h-full"
                      />
                      <Badge
                        className="absolute top-2 right-2"
                        variant={match.match_percent > 80 ? "default" : "secondary"}
                      >
                        {match.score ? `Score: ${match.score.toFixed(1)}` : `${match.match_percent}% match`}
                      </Badge>
                    </div>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        <span className="font-medium truncate">{match.domain}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Crawled: {new Date(match.crawl_date).toLocaleDateString()}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => window.open(match.url, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Source
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Privacy Notice */}
        <Alert>
          <AlertDescription className="text-xs">
            🔒 Privacy: Uploaded images are processed securely and deleted immediately after search.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
    </div>
  );
}
