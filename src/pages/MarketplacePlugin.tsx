import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Download, ExternalLink, FileText, HelpCircle } from "lucide-react";
import { SEO } from "@/components/SEO";

export default function MarketplacePlugin() {
  const { pluginId } = useParams<{ pluginId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [workspaceId] = useState("default"); // TODO: Get from workspace context

  const { data: plugin, isLoading } = useQuery({
    queryKey: ["plugin", pluginId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plugins")
        .select("*")
        .eq("id", pluginId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!pluginId,
  });

  const { data: installation } = useQuery({
    queryKey: ["plugin-install", pluginId, workspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plugin_installs")
        .select("*")
        .eq("plugin_id", pluginId)
        .eq("workspace_id", workspaceId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!pluginId,
  });

  const installMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("plugin-install", {
        body: {
          plugin_id: pluginId,
          workspace_id: workspaceId,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plugin-install", pluginId] });
      toast({
        title: "Plugin Installed",
        description: "The plugin has been successfully installed",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Installation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const uninstallMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("plugin_installs")
        .delete()
        .eq("plugin_id", pluginId)
        .eq("workspace_id", workspaceId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plugin-install", pluginId] });
      toast({
        title: "Plugin Uninstalled",
        description: "The plugin has been removed",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Uninstall Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-muted rounded w-3/4" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </main>
      </div>
    );
  }

  if (!plugin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Plugin Not Found</h1>
          <Button onClick={() => navigate("/marketplace")}>
            Back to Marketplace
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={plugin.title}
        description={plugin.description || `${plugin.title} plugin for FootprintIQ`}
      />
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/marketplace")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Marketplace
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    {plugin.icon_url && (
                      <img
                        src={plugin.icon_url}
                        alt=""
                        className="w-16 h-16 rounded-lg"
                      />
                    )}
                    <div>
                      <CardTitle className="text-3xl">{plugin.title}</CardTitle>
                      <CardDescription className="text-base mt-1">
                        by {plugin.author_name}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant={
                      plugin.status === "approved"
                        ? "default"
                        : plugin.status === "rejected"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {plugin.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{plugin.description}</p>
                <div className="flex flex-wrap gap-2">
                  {plugin.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="manifest">Manifest</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>About</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Version</h4>
                      <p className="text-sm text-muted-foreground">{plugin.version}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Entry Point</h4>
                      <a
                        href={plugin.entry_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        {plugin.entry_url}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    {plugin.published_at && (
                      <div>
                        <h4 className="font-semibold mb-2">Published</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(plugin.published_at).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="manifest">
                <Card>
                  <CardHeader>
                    <CardTitle>Plugin Manifest</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                      {JSON.stringify(plugin.manifest, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Installation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {plugin.status === "approved" ? (
                  <>
                    {installation ? (
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => uninstallMutation.mutate()}
                        disabled={uninstallMutation.isPending}
                      >
                        {uninstallMutation.isPending ? "Uninstalling..." : "Uninstall"}
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => installMutation.mutate()}
                        disabled={installMutation.isPending}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {installMutation.isPending ? "Installing..." : "Install Plugin"}
                      </Button>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    This plugin is not yet approved for installation
                  </p>
                )}
              </CardContent>
            </Card>

            {(plugin.documentation_url || plugin.support_url) && (
              <Card>
                <CardHeader>
                  <CardTitle>Resources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {plugin.documentation_url && (
                    <a
                      href={plugin.documentation_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <FileText className="w-4 h-4" />
                      Documentation
                    </a>
                  )}
                  {plugin.support_url && (
                    <a
                      href={plugin.support_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <HelpCircle className="w-4 h-4" />
                      Support
                    </a>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
