import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Zap, Mail, Globe, Server, Network, Loader2, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";

interface HarvesterTabProps {
  onScanStart?: (scanId: string) => void;
  workspaceId?: string;
}

const SOURCES = [
  { id: 'google', name: 'Google', icon: Globe, description: 'Google search engine' },
  { id: 'hunter', name: 'Hunter.io', icon: Mail, description: 'Professional email finder' },
  { id: 'shodan', name: 'Shodan', icon: Server, description: 'Internet-connected devices' },
  { id: 'censys', name: 'Censys', icon: Network, description: 'Internet infrastructure' },
];

export const HarvesterTab = ({ onScanStart, workspaceId }: HarvesterTabProps) => {
  const { toast } = useToast();
  const { isPremium } = useSubscription();
  const [domain, setDomain] = useState('');
  const [selectedSources, setSelectedSources] = useState<string[]>(['google', 'hunter']);
  const [isScanning, setIsScanning] = useState(false);

  const handleSourceToggle = (sourceId: string) => {
    setSelectedSources(prev =>
      prev.includes(sourceId)
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    );
  };

  const handleScan = async () => {
    if (!isPremium) {
      toast({
        title: "Premium Feature",
        description: "Upgrade to access Harvester Recon for email and subdomain harvesting!",
        variant: "destructive",
      });
      return;
    }

    if (!domain.trim()) {
      toast({
        title: "Domain Required",
        description: "Please enter a domain to scan",
        variant: "destructive",
      });
      return;
    }

    if (selectedSources.length === 0) {
      toast({
        title: "Select Sources",
        description: "Please select at least one source to scan",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke('harvester-scan', {
        body: {
          domain: domain.trim(),
          sources: selectedSources,
          workspace_id: workspaceId
        }
      });

      if (error) {
        if (error.message.includes('Premium feature')) {
          toast({
            title: "Premium Required",
            description: "This feature requires a premium subscription",
            variant: "destructive",
          });
          return;
        }
        
        if (error.message.includes('Insufficient credits')) {
          toast({
            title: "Insufficient Credits",
            description: "You need 10 credits to run a harvester scan",
            variant: "destructive",
          });
          return;
        }
        
        throw error;
      }

      if (data?.scan_id) {
        toast({
          title: "Scan Started",
          description: `Harvesting data from ${selectedSources.length} sources...`,
        });
        
        if (onScanStart) {
          onScanStart(data.scan_id);
        }
      }
    } catch (error) {
      console.error('Scan error:', error);
      toast({
        title: "Scan Failed",
        description: error instanceof Error ? error.message : "Failed to start harvester scan",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  if (!isPremium) {
    return (
      <Card className="border-primary/50 bg-gradient-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            <CardTitle>Harvester Recon</CardTitle>
            <Badge variant="default" className="ml-auto">
              <Zap className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          </div>
          <CardDescription>
            Upgrade for email and subdomain harvest across 100+ sources!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
              <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Email Discovery</h4>
                <p className="text-xs text-muted-foreground">
                  Find company emails, contacts, and corporate addresses
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
              <Globe className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Subdomain Enum</h4>
                <p className="text-xs text-muted-foreground">
                  Discover hidden subdomains and infrastructure
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
              <Server className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Host Detection</h4>
                <p className="text-xs text-muted-foreground">
                  Identify servers, IPs, and network assets
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
              <Network className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Correlations</h4>
                <p className="text-xs text-muted-foreground">
                  Link emails to subdomains and IPs automatically
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
            <h4 className="font-semibold mb-2 text-sm">Premium Sources Include:</h4>
            <ul className="grid grid-cols-2 gap-2 text-xs">
              <li>✓ Google Search</li>
              <li>✓ Hunter.io</li>
              <li>✓ Shodan</li>
              <li>✓ Censys</li>
              <li>✓ Bing Search</li>
              <li>✓ DuckDuckGo</li>
              <li>✓ Certificate Logs</li>
              <li>✓ DNS Records</li>
            </ul>
          </div>

          <Button className="w-full" size="lg">
            <Zap className="w-4 h-4 mr-2" />
            Upgrade to Access Harvester
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <CardTitle>Harvester Recon</CardTitle>
          <Badge variant="outline" className="ml-auto">
            10 Credits
          </Badge>
        </div>
        <CardDescription>
          Discover emails, subdomains, and hosts from multiple OSINT sources
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="domain">Target Domain</Label>
          <Input
            id="domain"
            placeholder="example.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            disabled={isScanning}
          />
          <p className="text-xs text-muted-foreground">
            Enter a domain name to harvest data from
          </p>
        </div>

        <div className="space-y-3">
          <Label>Select Sources</Label>
          <div className="grid gap-3">
            {SOURCES.map((source) => {
              const Icon = source.icon;
              return (
                <div
                  key={source.id}
                  className="flex items-start gap-3 p-3 rounded-lg border transition-colors hover:bg-accent"
                >
                  <Checkbox
                    id={source.id}
                    checked={selectedSources.includes(source.id)}
                    onCheckedChange={() => handleSourceToggle(source.id)}
                    disabled={isScanning}
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-primary" />
                      <label
                        htmlFor={source.id}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {source.name}
                      </label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {source.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 rounded-lg bg-muted/50 space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Ethical Use Notice
          </h4>
          <p className="text-xs text-muted-foreground">
            This tool performs passive OSINT reconnaissance only. All data is collected from
            publicly available sources. Use responsibly for security research and privacy
            protection purposes only.
          </p>
        </div>

        <Button
          onClick={handleScan}
          disabled={isScanning || !domain.trim() || selectedSources.length === 0}
          className="w-full"
          size="lg"
        >
          {isScanning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Harvesting...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4 mr-2" />
              Start Harvester Scan
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
