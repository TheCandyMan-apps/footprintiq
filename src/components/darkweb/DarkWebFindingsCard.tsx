import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

interface DarkWebFindingsCardProps {
  targetId: string;
}

export function DarkWebFindingsCard({ targetId }: DarkWebFindingsCardProps) {
  const [selectedFinding, setSelectedFinding] = useState<any>(null);

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
            <Shield className="h-5 w-5 text-green-500" />
            No Dark Web Findings
          </CardTitle>
          <CardDescription>
            Great news! No exposed data found on the dark web for this target.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const criticalCount = findings.filter((f) => f.severity === "critical").length;
  const highCount = findings.filter((f) => f.severity === "high").length;

  return (
    <>
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Dark Web Findings
          </CardTitle>
          <CardDescription>
            {findings.length} finding{findings.length !== 1 ? "s" : ""} detected
            {criticalCount > 0 && (
              <span className="text-destructive ml-2">
                • {criticalCount} critical
              </span>
            )}
            {highCount > 0 && (
              <span className="text-orange-500 ml-2">• {highCount} high</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {findings.map((finding) => (
                <div
                  key={finding.id}
                  className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
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
                          <Badge variant="default" className="bg-blue-500">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium">
                        {(finding.meta as any)?.title ||
                          (finding.meta as any)?.platform ||
                          (finding.meta as any)?.type ||
                          "Exposure Detected"}
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
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Finding Details
            </DialogTitle>
            <DialogDescription>
              {getProviderName(selectedFinding?.provider)} •{" "}
              {selectedFinding?.observed_at &&
                format(new Date(selectedFinding.observed_at), "MMM d, yyyy h:mm a")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Badge variant={getSeverityColor(selectedFinding?.severity)}>
                {selectedFinding?.severity}
              </Badge>
              {selectedFinding?.is_new && (
                <Badge variant="default" className="bg-blue-500">
                  New
                </Badge>
              )}
            </div>

            {selectedFinding?.meta && (
              <div className="space-y-2">
                {Object.entries(selectedFinding.meta).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-3 gap-2 text-sm">
                    <span className="font-medium capitalize">
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
            )}

            {selectedFinding?.url && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open(selectedFinding.url, "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Source
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
