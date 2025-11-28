import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Package } from "lucide-react";
import { SEO } from "@/components/SEO";
import { AdminNav } from "@/components/admin/AdminNav";

export default function MarketplaceReview() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPlugin, setSelectedPlugin] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  const { data: pendingPlugins, isLoading } = useQuery({
    queryKey: ["pending-plugins"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plugins")
        .select("*")
        .in("status", ["draft", "submitted"])
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async ({
      pluginId,
      decision,
      notes,
    }: {
      pluginId: string;
      decision: "approved" | "rejected";
      notes: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("plugin-review", {
        body: {
          plugin_id: pluginId,
          decision,
          notes,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-plugins"] });
      setSelectedPlugin(null);
      setReviewNotes("");
      toast({
        title: "Review Submitted",
        description: "Plugin review has been processed",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Review Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleReview = (decision: "approved" | "rejected") => {
    if (!selectedPlugin) return;

    reviewMutation.mutate({
      pluginId: selectedPlugin,
      decision,
      notes: reviewNotes,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Marketplace Review"
        description="Review pending plugin submissions"
      />
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex gap-6">
          <aside className="hidden lg:block w-64 shrink-0">
            <AdminNav />
          </aside>

          <div className="flex-1 space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-1">Plugin Review Queue</h1>
              <p className="text-muted-foreground">
                Review and approve plugin submissions
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-4 bg-muted rounded w-full" />
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : pendingPlugins && pendingPlugins.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pendingPlugins.map((plugin) => (
                  <Card
                    key={plugin.id}
                    className={
                      selectedPlugin === plugin.id
                        ? "ring-2 ring-primary"
                        : ""
                    }
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{plugin.title}</CardTitle>
                          <CardDescription className="mt-1">
                            by {plugin.author_name}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">{plugin.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {plugin.description}
                      </p>

                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-semibold">Version:</span> {plugin.version}
                        </div>
                        <div className="text-sm">
                          <span className="font-semibold">Entry URL:</span>{" "}
                          <a
                            href={plugin.entry_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {plugin.entry_url.substring(0, 40)}...
                          </a>
                        </div>
                        <div className="text-sm">
                          <span className="font-semibold">Tags:</span>{" "}
                          {plugin.tags.join(", ")}
                        </div>
                      </div>

                      <details className="text-sm">
                        <summary className="cursor-pointer font-semibold mb-2">
                          View Manifest
                        </summary>
                        <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                          {JSON.stringify(plugin.manifest, null, 2)}
                        </pre>
                      </details>

                      {selectedPlugin === plugin.id && (
                        <div className="space-y-4 pt-4 border-t">
                          <Textarea
                            placeholder="Review notes (optional)..."
                            value={reviewNotes}
                            onChange={(e) => setReviewNotes(e.target.value)}
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <Button
                              variant="default"
                              className="flex-1"
                              onClick={() => handleReview("approved")}
                              disabled={reviewMutation.isPending}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              className="flex-1"
                              onClick={() => handleReview("rejected")}
                              disabled={reviewMutation.isPending}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      )}

                      {selectedPlugin !== plugin.id && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setSelectedPlugin(plugin.id)}
                        >
                          Review Plugin
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No plugins pending review</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
