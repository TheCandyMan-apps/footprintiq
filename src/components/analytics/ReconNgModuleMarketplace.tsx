import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Download, RefreshCw, Search, Package, CheckCircle2, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ReconNgModule {
  name: string;
  version: string;
  status: string;
  updated: string;
  category: string;
  installed: boolean;
}

export function ReconNgModuleMarketplace() {
  const [modules, setModules] = useState<ReconNgModule[]>([]);
  const [filteredModules, setFilteredModules] = useState<ReconNgModule[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [installingModule, setInstallingModule] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    loadModules();
  }, []);

  useEffect(() => {
    filterModules();
  }, [searchQuery, selectedCategory, modules]);

  const loadModules = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('recon-ng-modules', {
        body: { action: 'list' }
      });

      if (error) throw error;

      if (data.success) {
        setModules(data.modules);
      } else {
        toast.error("Failed to load modules");
      }
    } catch (error: any) {
      console.error("Error loading modules:", error);
      toast.error("Failed to load module marketplace");
    } finally {
      setLoading(false);
    }
  };

  const filterModules = () => {
    let filtered = modules;

    if (selectedCategory !== "all") {
      filtered = filtered.filter(m => m.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredModules(filtered);
  };

  const handleInstall = async (moduleName: string) => {
    setInstallingModule(moduleName);
    try {
      const { data, error } = await supabase.functions.invoke('recon-ng-modules', {
        body: { action: 'install', module: moduleName }
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`Module ${moduleName} installed successfully`);
        await loadModules(); // Reload to update status
      } else {
        toast.error(data.error || "Failed to install module");
      }
    } catch (error: any) {
      console.error("Error installing module:", error);
      toast.error("Failed to install module");
    } finally {
      setInstallingModule(null);
    }
  };

  const handleUpdate = async (moduleName: string) => {
    setInstallingModule(moduleName);
    try {
      const { data, error } = await supabase.functions.invoke('recon-ng-modules', {
        body: { action: 'update', module: moduleName }
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`Module ${moduleName} updated successfully`);
        await loadModules();
      } else {
        toast.error(data.error || "Failed to update module");
      }
    } catch (error: any) {
      console.error("Error updating module:", error);
      toast.error("Failed to update module");
    } finally {
      setInstallingModule(null);
    }
  };

  const categories = ["all", ...new Set(modules.map(m => m.category))];
  const installedCount = modules.filter(m => m.installed).length;

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Recon-ng Module Marketplace</h3>
            <p className="text-sm text-muted-foreground">
              Browse and install 100+ OSINT modules
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadModules}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Badge variant="secondary">
            <Package className="h-3 w-3 mr-1" />
            {installedCount} installed
          </Badge>
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="w-full justify-start overflow-x-auto">
            {categories.map(cat => (
              <TabsTrigger key={cat} value={cat} className="capitalize">
                {cat} {cat !== 'all' && `(${modules.filter(m => m.category === cat).length})`}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <ScrollArea className="h-[500px]">
          <div className="space-y-2">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading modules...
              </div>
            ) : filteredModules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No modules found
              </div>
            ) : (
              filteredModules.map((module) => (
                <Card key={module.name} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono">{module.name}</code>
                        {module.installed && (
                          <Badge variant="success" className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Installed
                          </Badge>
                        )}
                        <Badge variant="outline">{module.category}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>v{module.version}</span>
                        {module.updated && <span>Updated: {module.updated}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {module.installed ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdate(module.name)}
                          disabled={installingModule === module.name}
                        >
                          {installingModule === module.name ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Update
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleInstall(module.name)}
                          disabled={installingModule === module.name}
                        >
                          {installingModule === module.name ? (
                            <>
                              <Download className="h-4 w-4 mr-2 animate-spin" />
                              Installing...
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4 mr-2" />
                              Install
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg text-sm">
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            Installed modules are available immediately for use in scans. Updates are recommended for bug fixes and new features.
          </span>
        </div>
      </div>
    </Card>
  );
}
