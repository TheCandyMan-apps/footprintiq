import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Package, Download, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const { data: plugins, isLoading } = useQuery({
    queryKey: ["marketplace-plugins", searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("plugins")
        .select("*")
        .eq("status", "approved")
        .order("published_at", { ascending: false });

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: myPlugins } = useQuery({
    queryKey: ["my-plugins"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("plugins")
        .select("*")
        .eq("author_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: installed } = useQuery({
    queryKey: ["installed-plugins"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("plugin_installs")
        .select("*, plugins(*)")
        .eq("user_id", user.id)
        .eq("enabled", true);

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Plugin Marketplace"
        description="Browse and install plugins to extend FootprintIQ capabilities"
      />
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Plugin Marketplace</h1>
            <p className="text-muted-foreground">
              Extend FootprintIQ with community and official plugins
            </p>
          </div>
          
          <Button onClick={() => navigate("/marketplace/submit")}>
            <Plus className="w-4 h-4 mr-2" />
            Submit Plugin
          </Button>
        </div>

        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList>
            <TabsTrigger value="browse">
              <Package className="w-4 h-4 mr-2" />
              Browse
            </TabsTrigger>
            <TabsTrigger value="installed">
              <Download className="w-4 h-4 mr-2" />
              Installed
            </TabsTrigger>
            <TabsTrigger value="my-plugins">
              <Star className="w-4 h-4 mr-2" />
              My Plugins
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search plugins..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-4 bg-muted rounded w-full" />
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plugins?.map((plugin) => (
                  <Card key={plugin.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2">
                            {plugin.icon_url && (
                              <img src={plugin.icon_url} alt={`${plugin.title} icon`} className="w-8 h-8 rounded" />
                            )}
                            {plugin.title}
                          </CardTitle>
                          <CardDescription className="mt-2">
                            by {plugin.author_name}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">v{plugin.version}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {plugin.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-4">
                        {plugin.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="default"
                        className="w-full"
                        onClick={() => navigate(`/marketplace/plugin/${plugin.id}`)}
                      >
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="installed">
            {installed && installed.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {installed.map((install) => (
                  <Card key={install.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {install.plugins.icon_url && (
                          <img src={install.plugins.icon_url} alt="" className="w-8 h-8 rounded" />
                        )}
                        {install.plugins.title}
                      </CardTitle>
                      <CardDescription>
                        Installed {new Date(install.installed_at).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {install.plugins.description}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate(`/marketplace/plugin/${install.plugin_id}`)}
                      >
                        Manage
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No plugins installed yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-plugins">
            {myPlugins && myPlugins.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myPlugins.map((plugin) => (
                  <Card key={plugin.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle>{plugin.title}</CardTitle>
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
                      <CardDescription>v{plugin.version}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {plugin.description}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate(`/marketplace/plugin/${plugin.id}`)}
                      >
                        Edit
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Star className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">You haven't created any plugins yet</p>
                <Button onClick={() => navigate("/marketplace/submit")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Submit Your First Plugin
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
