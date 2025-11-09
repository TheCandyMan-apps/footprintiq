import { useState } from "react";
import { HarvesterTab } from "@/components/scan/HarvesterTab";
import { HarvesterResults } from "@/components/scan/HarvesterResults";
import { HarvesterConsentDialog } from "@/components/dialogs/HarvesterConsentDialog";
import { ScanProgressDialog } from "@/components/scan/ScanProgressDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const HarvesterDemo = () => {
  const { toast } = useToast();
  const [showConsent, setShowConsent] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [activeScanId, setActiveScanId] = useState<string | null>(null);
  const [scanResults, setScanResults] = useState<any>(null);
  const [showProgress, setShowProgress] = useState(false);

  const handleConsentGiven = () => {
    setConsentGiven(true);
    toast({
      title: "Consent Recorded",
      description: "You can now use Harvester Recon responsibly",
    });
  };

  const handleScanStart = (scanId: string) => {
    if (!consentGiven) {
      setShowConsent(true);
      return;
    }

    setActiveScanId(scanId);
    setShowProgress(true);
    setScanResults(null);

    // Listen for scan completion
    const channel = supabase
      .channel('scan-progress')
      .on('broadcast', { event: 'scan_complete' }, (payload) => {
        if (payload.payload.scan_id === scanId) {
          // Fetch full results with type assertion
          supabase
            .from('scans')
            .select('*')
            .eq('id', scanId)
            .single()
            .then(({ data }) => {
              if (data) {
                const scanData = data as any;
                const results = scanData.metadata || {};
                setScanResults({
                  emails: results.emails || [],
                  subdomains: results.subdomains || [],
                  hosts: results.hosts || [],
                  ips: results.ips || [],
                  correlations: results.correlations || [],
                  domain: scanData.email || scanData.username || 'unknown'
                });
                setShowProgress(false);
              }
            });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card className="border-primary/50 bg-gradient-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <CardTitle className="text-2xl">Harvester Recon - Premium OSINT</CardTitle>
          </div>
          <CardDescription>
            Discover emails, subdomains, and hosts from multiple open-source intelligence sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-lg border border-primary/20 bg-primary/5 flex items-start gap-3">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-semibold text-sm">About Harvester</h4>
              <p className="text-xs text-muted-foreground">
                Harvester performs passive reconnaissance by collecting publicly available data from
                search engines, professional networking platforms, certificate transparency logs, and
                DNS records. It correlates findings to reveal hidden connections between emails,
                subdomains, and infrastructure.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="scan" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scan">New Scan</TabsTrigger>
          <TabsTrigger value="results" disabled={!scanResults}>
            Results {scanResults && `(${
              (scanResults.emails?.length || 0) + 
              (scanResults.subdomains?.length || 0)
            } findings)`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scan">
          <HarvesterTab 
            onScanStart={handleScanStart}
            workspaceId={undefined} // Would come from workspace context in real app
          />
        </TabsContent>

        <TabsContent value="results">
          {scanResults ? (
            <HarvesterResults
              results={scanResults}
              scanId={activeScanId || ''}
              domain={scanResults.domain}
            />
          ) : (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No results yet. Run a scan to see findings.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <HarvesterConsentDialog
        open={showConsent}
        onOpenChange={setShowConsent}
        onConsent={handleConsentGiven}
      />

      {activeScanId && (
        <ScanProgressDialog
          open={showProgress}
          onOpenChange={setShowProgress}
          scanId={activeScanId}
        />
      )}
    </div>
  );
};
