import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Star, Download } from "lucide-react";
import { useState } from "react";

export default function PluginMarketplace() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: plugins, isLoading } = useQuery({
    queryKey: ["plugins", searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("plugin_manifests" as any)
        .select("*")
        .eq("status", "approved")
        .order("download_count", { ascending: false });

      if (searchTerm) {
        query = query.ilike("name", `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: installations } = useQuery({
    queryKey: ["plugin-installations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plugin_installations" as any)
        .select("plugin_id");

      if (error) throw error;
      return data?.map((i: any) => i.plugin_id) || [];
    },
  });

  const isInstalled = (pluginId: string) => {
    return installations?.includes(pluginId);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Plugin Marketplace</h1>
        <p className="text-muted-foreground">Extend functionality with community plugins</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search plugins..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div>Loading plugins...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plugins?.map((plugin: any) => (
            <Card key={plugin.id} className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {plugin.icon_url && (
                    <img src={plugin.icon_url} alt={`${plugin.name} icon`} className="w-10 h-10 rounded" />
                  )}
                  <div>
                    <h3 className="font-semibold">{plugin.name}</h3>
                    <p className="text-xs text-muted-foreground">v{plugin.version}</p>
                  </div>
                </div>
                <Badge variant="outline">{plugin.category}</Badge>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2">
                {plugin.description}
              </p>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  {plugin.download_count}
                </div>
                {plugin.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    {plugin.rating.toFixed(1)}
                  </div>
                )}
              </div>

              <Button 
                className="w-full" 
                variant={isInstalled(plugin.id) ? "outline" : "default"}
                disabled={isInstalled(plugin.id)}
              >
                {isInstalled(plugin.id) ? "Installed" : "Install"}
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
