import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, ExternalLink, Eye, Shield } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContextEnrichmentPanel, UrlOption } from "@/components/ContextEnrichmentPanel";
import { GatedContent, useResultsGating } from "@/components/billing/GatedContent";

interface DarkWebFindingsCardProps {
  targetId: string;
}

/**
 * Extract all available URLs from a finding's metadata.
 */
function getFindingUrls(finding: any): UrlOption[] {
  if (!finding) return [];
  
  const urls: UrlOption[] = [];
  
  if (finding.url) {
    urls.push({ label: 'Source URL', url: finding.url });
  }
  
  // Check meta for additional URLs
  const meta = finding.meta as any;
  if (meta) {
    if (meta.profile_url && meta.profile_url !== finding.url) {
      urls.push({ label: 'Profile URL', url: meta.profile_url });
    }
    if (meta.source_url && meta.source_url !== finding.url && meta.source_url !== meta.profile_url) {
      urls.push({ label: 'Evidence URL', url: meta.source_url });
    }
    if (meta.link && meta.link !== finding.url && meta.link !== meta.profile_url && meta.link !== meta.source_url) {
      urls.push({ label: 'Link', url: meta.link });
    }
  }
  
  return urls;
}

/** Mask URL for free users - show domain only */
function maskUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}/••••••`;
  } catch {
    return '••••••••••••';
  }
}

/** Get category/title only from finding for summary */
function getFindingSummary(finding: any): string {
  const meta = finding.meta as any;
  return meta?.title || meta?.platform || meta?.type || "Exposure Detected";
}

export function DarkWebFindingsCard({ targetId }: DarkWebFindingsCardProps) {
  const [selectedFinding, setSelectedFinding] = useState<any>(null);
  const { canSeeSourceUrls, canSeeEvidence } = useResultsGating();

  const { data: findings, isLoading } = useQuery({
    queryKey: ["darkweb-findings", targetId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("darkweb_findings")
        .select("*")
        .eq("target_id", targetId)
        .order("observed_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getProviderName = (provider: string) => {
    const names: Record<string, string> = {
      "apify-social": "Social Media",
      "apify-osint": "Paste Sites",
      "apify-darkweb": "Dark Web",
      "intelx": "IntelX",
      "dehashed": "DeHashed",
      "darksearch": "DarkSearch",
    };
    return names[provider] || provider;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dark Web Findings</CardTitle>
          <CardDescription>Loading findings...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!findings || findings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-600" />
            No Dark Web Findings
          </CardTitle>
          <CardDescription>
            Great news! No exposed data found on the dark web for this target.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Category-level summaries (allowed for free)
  const criticalCount = findings.filter((f) => f.severity === "critical").length;
  const highCount = findings.filter((f) => f.severity === "high").length;

  const selectedUrls = getFindingUrls(selectedFinding);
  const hasUrls = selectedUrls.length > 0;

  return (
    <>
      <Card className="border-red-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Dark Web Findings
          </CardTitle>
          <CardDescription>
            {/* Total count and category summaries allowed for free */}
            {findings.length} finding{findings.length !== 1 ? "s" : ""} detected
            {criticalCount > 0 && (
              <span className="text-red-600 ml-2">
                • {criticalCount} critical
              </span>
            )}
            {highCount > 0 && (
              <span className="text-amber-600 ml-2">• {highCount} high</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {findings.map((finding) => (
                <div
                  key={finding.id}
                  className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedFinding(finding)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={getSeverityColor(finding.severity)}>
                          {finding.severity}
                        </Badge>
                        <Badge variant="outline">
                          {getProviderName(finding.provider)}
                        </Badge>
                        {finding.is_new && (
                          <Badge variant="secondary" className="bg-blue-500/10 text-blue-700 border-blue-500/20">
                            New
                          </Badge>
                        )}
                      </div>
                      {/* Category/title summary allowed */}
                      <p className="text-sm font-medium">
                        {getFindingSummary(finding)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Found: {format(new Date(finding.observed_at), "MMM d, yyyy")}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={!!selectedFinding} onOpenChange={() => setSelectedFinding(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Finding Details
            </DialogTitle>
            <DialogDescription>
              {getProviderName(selectedFinding?.provider)} •{" "}
              {selectedFinding?.observed_at &&
                format(new Date(selectedFinding.observed_at), "MMM d, yyyy h:mm a")}
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="context" disabled={!hasUrls}>
                Context
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="flex gap-2">
                <Badge variant={getSeverityColor(selectedFinding?.severity)}>
                  {selectedFinding?.severity}
                </Badge>
                {selectedFinding?.is_new && (
                  <Badge variant="secondary" className="bg-blue-500/10 text-blue-700 border-blue-500/20">
                    New
                  </Badge>
                )}
              </div>

              {/* Explainer text */}
              <p className="text-sm text-muted-foreground">
                Review the metadata below. Use the Context tab to validate this match.
              </p>

              {/* Full metadata - gated for free users */}
              {selectedFinding?.meta && (
                <GatedContent
                  isGated={!canSeeEvidence}
                  contentType="evidence"
                  fallback={
                    <div className="space-y-2">
                      {/* Show category-level info only */}
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <span className="font-medium text-foreground">Type:</span>
                        <span className="col-span-2 text-muted-foreground">
                          {(selectedFinding.meta as any)?.type || 'Exposure'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <span className="font-medium text-foreground">Platform:</span>
                        <span className="col-span-2 text-muted-foreground">
                          {(selectedFinding.meta as any)?.platform || 'Unknown'}
                        </span>
                      </div>
                      <div className="h-24 bg-muted/30 rounded animate-pulse" />
                    </div>
                  }
                >
                  <div className="space-y-2">
                    {Object.entries(selectedFinding.meta).map(([key, value]) => (
                      <div key={key} className="grid grid-cols-3 gap-2 text-sm">
                        <span className="font-medium capitalize text-foreground">
                          {key.replace(/_/g, " ")}:
                        </span>
                        <span className="col-span-2 text-muted-foreground break-all">
                          {typeof value === "object"
                            ? JSON.stringify(value, null, 2)
                            : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </GatedContent>
              )}

              {/* Source URL - gated for free users */}
              {selectedFinding?.url && (
                <GatedContent
                  isGated={!canSeeSourceUrls}
                  contentType="url"
                  compact
                  fallback={
                    <Button variant="outline" className="w-full" disabled>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {maskUrl(selectedFinding.url)}
                    </Button>
                  }
                >
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(selectedFinding.url, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Source
                  </Button>
                </GatedContent>
              )}
            </TabsContent>

            <TabsContent value="context">
              {hasUrls ? (
                <ContextEnrichmentPanel urls={selectedUrls} />
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No URL available for this finding.
                </p>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
