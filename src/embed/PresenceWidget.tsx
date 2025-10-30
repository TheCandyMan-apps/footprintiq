/**
 * Embeddable Username Presence Widget
 * Lightweight component for partner sites to check username availability
 * Displays "Made with FootprintIQ" badge with affiliate link
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, ExternalLink } from "lucide-react";
import { PROVIDER_META } from "@/providers/registry.meta";

interface PresenceResult {
  platform: string;
  found: boolean;
  url: string;
}

export function PresenceWidget() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PresenceResult[]>([]);

  const checkPresence = async () => {
    if (!username.trim() || username.length < 3) return;

    setLoading(true);
    try {
      // Simulate basic presence check (in production, call your API)
      // For embed version, show top 10 platforms only
      const topPlatforms = [
        { platform: "Instagram", url: `https://instagram.com/${username}` },
        { platform: "Twitter/X", url: `https://x.com/${username}` },
        { platform: "TikTok", url: `https://tiktok.com/@${username}` },
        { platform: "LinkedIn", url: `https://linkedin.com/in/${username}` },
        { platform: "GitHub", url: `https://github.com/${username}` },
        { platform: "Reddit", url: `https://reddit.com/user/${username}` },
        { platform: "Medium", url: `https://medium.com/@${username}` },
        { platform: "Pinterest", url: `https://pinterest.com/${username}` },
        { platform: "YouTube", url: `https://youtube.com/@${username}` },
        { platform: "Twitch", url: `https://twitch.tv/${username}` },
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      setResults(
        topPlatforms.map((p) => ({
          ...p,
          found: Math.random() > 0.5, // Random for demo
        }))
      );
    } catch (error) {
      console.error("Widget error:", error);
    } finally {
      setLoading(false);
    }
  };

  const foundCount = results.filter((r) => r.found).length;

  return (
    <Card className="p-6 max-w-md mx-auto">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Enter username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && checkPresence()}
            disabled={loading}
          />
          <Button
            onClick={checkPresence}
            disabled={loading || username.length < 3}
            size="icon"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Found on {foundCount} of {results.length} platforms
              </span>
            </div>
            <div className="grid gap-2 max-h-64 overflow-y-auto">
              {results.map((result) => (
                <div
                  key={result.platform}
                  className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                >
                  <span className="text-sm">{result.platform}</span>
                  <div className="flex items-center gap-2">
                    {result.found ? (
                      <>
                        <Badge variant="default" className="text-xs">
                          Found
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => window.open(result.url, "_blank")}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Not Found
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attribution Badge */}
        <div className="pt-4 border-t flex justify-center">
          <a
            href="https://footprintiq.app?ref=widget"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            Made with <span className="font-semibold">FootprintIQ</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </Card>
  );
}
