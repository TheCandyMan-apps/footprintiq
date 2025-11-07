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
import { useUserPersona } from "@/hooks/useUserPersona";
import { Upload, Search, Lock, CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ImageMatch {
  thumbnail_url: string;
  url: string;
  domain: string;
  match_percent: number;
  crawl_date: string;
}

export function ReverseImageComponent() {
  const navigate = useNavigate();
  const { workspace } = useWorkspace();
  const { isStandard } = useUserPersona();
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
    if (!selectedFile) {
      toast.error("Please select an image first");
      return;
    }

    if (isStandard) {
      toast.error("Premium subscription required", {
        description: "Reverse Image Intel is a premium feature",
        action: {
          label: "Upgrade",
          onClick: () => navigate('/pricing')
        }
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

      if (!workspace?.id) {
        toast.error("No workspace selected");
        setIsSearching(false);
        return;
      }

      // Check/deduct credits
      const { data: balanceData } = await supabase.rpc('get_credits_balance', {
        _workspace_id: workspace.id
      });

      const currentBalance = balanceData || 0;
      const creditCost = 10; // Cost for reverse image search

      if (currentBalance < creditCost) {
        toast.error(`Insufficient credits. Need ${creditCost} credits`, {
          description: "Purchase more credits to continue",
        });
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

      // Get signed URL
      const { data: signedData } = await supabase.storage
        .from('scan-images')
        .createSignedUrl(fileName, 3600);

      if (!signedData?.signedUrl) throw new Error("Failed to create signed URL");

      // Small delay for "verifying" UX
      setTimeout(() => setShowVerifying(false), 300);

      // Call reverse image search with TinEye
      const { data, error } = await supabase.functions.invoke('reverse-image-search', {
        body: {
          imageUrl: signedData.signedUrl,
          workspaceId: workspace.id,
          useTinEye: true,
          creditCost
        }
      });

      if (error) throw error;

      // Delete temporary file
      await supabase.storage.from('scan-images').remove([fileName]);

      setResults(data.matches || []);
      setSearchComplete(true);
      
      if (data.matches && data.matches.length > 0) {
        toast.success(`Found ${data.matches.length} matches! 🎉`);
      } else {
        toast.info("No matches – try another image");
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

      const { data, error } = await supabase
        .from('cases')
        .insert({
          user_id: user.id,
          title: `Reverse Image Search - ${new Date().toLocaleDateString()}`,
          description: `Found ${results.length} matches`,
          status: 'open',
          priority: 'medium',
          image_results: results
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

  // Premium lock overlay for standard users
  if (isStandard) {
    return (
      <Card className="relative">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
          <div className="text-center space-y-4 p-6">
            <Lock className="w-12 h-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Premium Feature</h3>
              <p className="text-muted-foreground mb-4">
                Unlock Reverse Image Intel – trace origins across billions of images!
              </p>
              <Button onClick={() => navigate('/pricing')}>
                Unlock for $15/mo
              </Button>
            </div>
          </div>
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Reverse Image Intel
          </CardTitle>
          <CardDescription>
            Trace image origins across billions of indexed images
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 blur-sm">
          <div className="space-y-2">
            <Label>Upload Image</Label>
            <Input type="file" accept="image/*" disabled />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Reverse Image Intel
          <Badge variant="secondary" className="ml-auto">Premium</Badge>
        </CardTitle>
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
                        {match.match_percent}% match
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
  );
}
