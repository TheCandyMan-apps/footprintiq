import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PremiumApifyOptionsProps {
  onChange: (options: any) => void;
}

export function PremiumApifyOptions({ onChange }: PremiumApifyOptionsProps) {
  const [socialMediaFinder, setSocialMediaFinder] = useState(false);
  const [osintScraper, setOsintScraper] = useState(false);
  const [osintKeywords, setOsintKeywords] = useState<string[]>([]);
  const [darkwebScraper, setDarkwebScraper] = useState(false);
  const [darkwebSearch, setDarkwebSearch] = useState("");
  const [darkwebUrls, setDarkwebUrls] = useState<string[]>([]);
  const [darkwebDepth, setDarkwebDepth] = useState(3);
  const [darkwebPages, setDarkwebPages] = useState(10);

  const handleChange = () => {
    onChange({
      socialMediaFinder,
      osintScraper,
      osintKeywords: osintKeywords.length > 0 ? osintKeywords : undefined,
      darkwebScraper,
      darkwebSearch: darkwebSearch || undefined,
      darkwebUrls: darkwebUrls.length > 0 ? darkwebUrls : undefined,
      darkwebDepth,
      darkwebPages,
    });
  };

  const updateSocialMedia = (checked: boolean) => {
    setSocialMediaFinder(checked);
    setTimeout(handleChange, 0);
  };

  const updateOsint = (checked: boolean) => {
    setOsintScraper(checked);
    setTimeout(handleChange, 0);
  };

  const updateDarkweb = (checked: boolean) => {
    setDarkwebScraper(checked);
    setTimeout(handleChange, 0);
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Premium Apify Actors</h3>
        <Badge variant="secondary">Pro Feature</Badge>
      </div>

      {/* Social Media Finder */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch
              id="social-media"
              checked={socialMediaFinder}
              onCheckedChange={updateSocialMedia}
            />
            <Label htmlFor="social-media" className="cursor-pointer">
              Social Media Finder
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Find username presence across social platforms</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Badge variant="outline">3 credits</Badge>
        </div>
      </div>

      {/* OSINT Scraper */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch
              id="osint-scraper"
              checked={osintScraper}
              onCheckedChange={updateOsint}
            />
            <Label htmlFor="osint-scraper" className="cursor-pointer">
              OSINT Paste Scraper
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Search paste sites for leaked data</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Badge variant="outline">2 credits</Badge>
        </div>
        {osintScraper && (
          <div className="ml-6 space-y-2">
            <Label htmlFor="osint-keywords">Search Keywords (comma-separated)</Label>
            <Input
              id="osint-keywords"
              placeholder="email@domain.com, username, etc."
              value={osintKeywords.join(", ")}
              onChange={(e) => {
                const keywords = e.target.value.split(",").map(k => k.trim()).filter(Boolean);
                setOsintKeywords(keywords);
                setTimeout(handleChange, 0);
              }}
            />
          </div>
        )}
      </div>

      {/* Dark Web Scraper */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch
              id="darkweb-scraper"
              checked={darkwebScraper}
              onCheckedChange={updateDarkweb}
            />
            <Label htmlFor="darkweb-scraper" className="cursor-pointer">
              Dark Web Scraper
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Search dark web marketplaces and forums</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Badge variant="outline">5 credits</Badge>
        </div>
        {darkwebScraper && (
          <div className="ml-6 space-y-2">
            <div>
              <Label htmlFor="darkweb-search">Search Term</Label>
              <Input
                id="darkweb-search"
                placeholder="Search query..."
                value={darkwebSearch}
                onChange={(e) => {
                  setDarkwebSearch(e.target.value);
                  setTimeout(handleChange, 0);
                }}
              />
            </div>
            <div>
              <Label htmlFor="darkweb-urls">Start URLs (comma-separated, optional)</Label>
              <Input
                id="darkweb-urls"
                placeholder="http://example.onion, ..."
                value={darkwebUrls.join(", ")}
                onChange={(e) => {
                  const urls = e.target.value.split(",").map(u => u.trim()).filter(Boolean);
                  setDarkwebUrls(urls);
                  setTimeout(handleChange, 0);
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="darkweb-depth">Max Depth</Label>
                <Input
                  id="darkweb-depth"
                  type="number"
                  min={1}
                  max={10}
                  value={darkwebDepth}
                  onChange={(e) => {
                    setDarkwebDepth(Number(e.target.value));
                    setTimeout(handleChange, 0);
                  }}
                />
              </div>
              <div>
                <Label htmlFor="darkweb-pages">Max Pages</Label>
                <Input
                  id="darkweb-pages"
                  type="number"
                  min={1}
                  max={100}
                  value={darkwebPages}
                  onChange={(e) => {
                    setDarkwebPages(Number(e.target.value));
                    setTimeout(handleChange, 0);
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="pt-2 border-t text-sm text-muted-foreground">
        <p className="font-medium">Total estimated cost:</p>
        <p>
          {(socialMediaFinder ? 3 : 0) + (osintScraper ? 2 : 0) + (darkwebScraper ? 5 : 0)} credits
        </p>
      </div>
    </Card>
  );
}
