import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Globe, Search, Shield } from "lucide-react";

export interface ApifyOptions {
  socialMedia?: {
    platforms?: string[];
    maxResults?: number;
  };
  osint?: {
    sites?: string[];
    keywords?: string[];
    useProxies?: boolean;
  };
  darkweb?: {
    startUrls?: string[];
    searchTerms?: string[];
    maxDepth?: number;
    maxPages?: number;
    maxItems?: number;
  };
}

interface ApifyOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options: ApifyOptions;
  onOptionsChange: (options: ApifyOptions) => void;
}

export function ApifyOptionsDialog({
  open,
  onOpenChange,
  options,
  onOptionsChange,
}: ApifyOptionsDialogProps) {
  const [localOptions, setLocalOptions] = useState<ApifyOptions>(options);

  const popularPlatforms = [
    "Facebook", "Twitter", "Instagram", "LinkedIn", "TikTok", 
    "GitHub", "Reddit", "Pinterest", "YouTube"
  ];

  const osintSites = [
    "Pastebin", "Github Gist", "Codepad", "Ideone", 
    "Dumpz", "Pasteorg", "Textbin"
  ];

  const handleSave = () => {
    onOptionsChange(localOptions);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Advanced Scan Options</DialogTitle>
          <DialogDescription>
            Configure Apify actors for deeper OSINT intelligence
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="social" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="social">
              <Globe className="w-4 h-4 mr-2" />
              Social Media
            </TabsTrigger>
            <TabsTrigger value="osint">
              <Search className="w-4 h-4 mr-2" />
              OSINT Scraper
            </TabsTrigger>
            <TabsTrigger value="darkweb">
              <Shield className="w-4 h-4 mr-2" />
              Dark Web
            </TabsTrigger>
          </TabsList>

          <TabsContent value="social" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Target Platforms</Label>
              <p className="text-sm text-muted-foreground">
                Select platforms to search (300+ supported)
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {popularPlatforms.map((platform) => (
                  <Badge
                    key={platform}
                    variant={
                      localOptions.socialMedia?.platforms?.includes(platform)
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() => {
                      const current = localOptions.socialMedia?.platforms || [];
                      const updated = current.includes(platform)
                        ? current.filter((p) => p !== platform)
                        : [...current, platform];
                      setLocalOptions({
                        ...localOptions,
                        socialMedia: { ...localOptions.socialMedia, platforms: updated },
                      });
                    }}
                  >
                    {platform}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxResults">Max Results per Platform</Label>
              <Input
                id="maxResults"
                type="number"
                min="1"
                max="100"
                value={localOptions.socialMedia?.maxResults || 10}
                onChange={(e) =>
                  setLocalOptions({
                    ...localOptions,
                    socialMedia: {
                      ...localOptions.socialMedia,
                      maxResults: parseInt(e.target.value) || 10,
                    },
                  })
                }
              />
            </div>
          </TabsContent>

          <TabsContent value="osint" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Target Sites</Label>
              <p className="text-sm text-muted-foreground">
                Select paste/code sites to scrape for leaked data
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {osintSites.map((site) => (
                  <Badge
                    key={site}
                    variant={
                      localOptions.osint?.sites?.includes(site)
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() => {
                      const current = localOptions.osint?.sites || [];
                      const updated = current.includes(site)
                        ? current.filter((s) => s !== site)
                        : [...current, site];
                      setLocalOptions({
                        ...localOptions,
                        osint: { ...localOptions.osint, sites: updated },
                      });
                    }}
                  >
                    {site}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords (comma-separated)</Label>
              <Textarea
                id="keywords"
                placeholder="email, password, api_key, credentials"
                value={localOptions.osint?.keywords?.join(", ") || ""}
                onChange={(e) =>
                  setLocalOptions({
                    ...localOptions,
                    osint: {
                      ...localOptions.osint,
                      keywords: e.target.value.split(",").map((k) => k.trim()),
                    },
                  })
                }
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="proxies"
                checked={localOptions.osint?.useProxies || false}
                onCheckedChange={(checked) =>
                  setLocalOptions({
                    ...localOptions,
                    osint: { ...localOptions.osint, useProxies: checked },
                  })
                }
              />
              <Label htmlFor="proxies">Use rotating proxies (recommended)</Label>
            </div>
          </TabsContent>

          <TabsContent value="darkweb" className="space-y-4 mt-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
              <p className="text-sm text-destructive font-medium">
                ⚠️ Dark web scanning requires consent and is rate-limited
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startUrls">Start URLs (one per line)</Label>
              <Textarea
                id="startUrls"
                placeholder="http://example.onion/&#10;http://another.onion/forum"
                value={localOptions.darkweb?.startUrls?.join("\n") || ""}
                onChange={(e) =>
                  setLocalOptions({
                    ...localOptions,
                    darkweb: {
                      ...localOptions.darkweb,
                      startUrls: e.target.value.split("\n").filter((u) => u.trim()),
                    },
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="searchTerms">Search Terms (comma-separated)</Label>
              <Input
                id="searchTerms"
                placeholder="email, phone, leaked, database"
                value={localOptions.darkweb?.searchTerms?.join(", ") || ""}
                onChange={(e) =>
                  setLocalOptions({
                    ...localOptions,
                    darkweb: {
                      ...localOptions.darkweb,
                      searchTerms: e.target.value.split(",").map((t) => t.trim()),
                    },
                  })
                }
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxDepth">Max Depth</Label>
                <Input
                  id="maxDepth"
                  type="number"
                  min="1"
                  max="5"
                  value={localOptions.darkweb?.maxDepth || 2}
                  onChange={(e) =>
                    setLocalOptions({
                      ...localOptions,
                      darkweb: {
                        ...localOptions.darkweb,
                        maxDepth: parseInt(e.target.value) || 2,
                      },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxPages">Max Pages</Label>
                <Input
                  id="maxPages"
                  type="number"
                  min="1"
                  max="100"
                  value={localOptions.darkweb?.maxPages || 20}
                  onChange={(e) =>
                    setLocalOptions({
                      ...localOptions,
                      darkweb: {
                        ...localOptions.darkweb,
                        maxPages: parseInt(e.target.value) || 20,
                      },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxItems">Max Items</Label>
                <Input
                  id="maxItems"
                  type="number"
                  min="1"
                  max="1000"
                  value={localOptions.darkweb?.maxItems || 100}
                  onChange={(e) =>
                    setLocalOptions({
                      ...localOptions,
                      darkweb: {
                        ...localOptions.darkweb,
                        maxItems: parseInt(e.target.value) || 100,
                      },
                    })
                  }
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Options
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
