import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Globe, Server, Network, Save, Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface HarvesterResultsProps {
  results: {
    emails: string[];
    subdomains: string[];
    hosts: string[];
    ips: string[];
    correlations: Array<{
      type: string;
      source: string;
      target: string;
      description: string;
    }>;
  };
  scanId: string;
  domain: string;
}

export const HarvesterResults = ({ results, scanId, domain }: HarvesterResultsProps) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveToCase = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('cases')
        .insert({
          user_id: user.id,
          title: `Harvester Scan - ${domain}`,
          type: 'harvester',
          status: 'open',
          data: {
            scan_id: scanId,
            domain,
            results,
            timestamp: new Date().toISOString()
          }
        });

      if (error) throw error;

      toast({
        title: "Saved to Cases",
        description: "Harvester results have been saved to your cases",
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save results",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Copied to clipboard",
    });
  };

  const handleExport = () => {
    const exportData = JSON.stringify(results, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `harvester-${domain}-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Exported",
      description: "Results exported to JSON file",
    });
  };

  const totalFindings = results.emails.length + results.subdomains.length + 
                        results.hosts.length + results.ips.length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Harvest Results - {domain}</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button size="sm" onClick={handleSaveToCase} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save to Case'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <Mail className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{results.emails.length}</div>
              <div className="text-xs text-muted-foreground">Emails</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <Globe className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{results.subdomains.length}</div>
              <div className="text-xs text-muted-foreground">Subdomains</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <Server className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{results.hosts.length + results.ips.length}</div>
              <div className="text-xs text-muted-foreground">Hosts/IPs</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <Network className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{results.correlations.length}</div>
              <div className="text-xs text-muted-foreground">Correlations</div>
            </div>
          </div>

          <Tabs defaultValue="emails" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="emails">
                Emails ({results.emails.length})
              </TabsTrigger>
              <TabsTrigger value="subdomains">
                Subdomains ({results.subdomains.length})
              </TabsTrigger>
              <TabsTrigger value="hosts">
                Hosts ({results.hosts.length + results.ips.length})
              </TabsTrigger>
              <TabsTrigger value="correlations">
                Correlations ({results.correlations.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="emails" className="space-y-2">
              {results.emails.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No emails found
                </p>
              ) : (
                results.emails.map((email, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-primary" />
                      <span className="font-mono text-sm">{email}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopy(email)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="subdomains" className="space-y-2">
              {results.subdomains.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No subdomains found
                </p>
              ) : (
                results.subdomains.map((subdomain, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-primary" />
                      <span className="font-mono text-sm">{subdomain}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopy(subdomain)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="hosts" className="space-y-2">
              {results.hosts.length + results.ips.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No hosts or IPs found
                </p>
              ) : (
                <>
                  {results.hosts.map((host, i) => (
                    <div
                      key={`host-${i}`}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Server className="w-4 h-4 text-primary" />
                        <span className="font-mono text-sm">{host}</span>
                        <Badge variant="outline" className="text-xs">Host</Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopy(host)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  {results.ips.map((ip, i) => (
                    <div
                      key={`ip-${i}`}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Network className="w-4 h-4 text-primary" />
                        <span className="font-mono text-sm">{ip}</span>
                        <Badge variant="outline" className="text-xs">IP</Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopy(ip)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </>
              )}
            </TabsContent>

            <TabsContent value="correlations" className="space-y-2">
              {results.correlations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No correlations found
                </p>
              ) : (
                results.correlations.map((correlation, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-lg border bg-card space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <Network className="w-4 h-4 text-primary" />
                      <Badge variant="outline" className="text-xs">
                        {correlation.type.replace('_', ' → ')}
                      </Badge>
                    </div>
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Source:</span>
                        <span className="font-mono">{correlation.source}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Target:</span>
                        <span className="font-mono">{correlation.target}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {correlation.description}
                    </p>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
