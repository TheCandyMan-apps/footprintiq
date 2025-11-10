import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { useWorkspace } from "@/hooks/useWorkspace";
import { MonitoredUsernamesManager } from "@/components/maigret/MonitoredUsernamesManager";
import { ProfileChangesHistory } from "@/components/maigret/ProfileChangesHistory";
import { ProfileComparisonView } from "@/components/maigret/ProfileComparisonView";
import { MaigretNetworkVisualization } from "@/components/maigret/MaigretNetworkVisualization";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MaigretMonitoring() {
  const { workspace, loading } = useWorkspace();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertDescription>
              Please select a workspace to use profile monitoring
            </AlertDescription>
          </Alert>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Maigret Profile Monitoring - FootprintIQ"
        description="Monitor username profiles across social media platforms for changes over time with automatic alerts"
      />
      
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Page header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">Maigret Profile Monitoring</h1>
            <p className="text-muted-foreground">
              Track username profiles across 300+ platforms and get notified of any changes
            </p>
          </div>

          {/* Info alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Add usernames to monitor their profiles across social media platforms. 
              We'll automatically check for changes every 24 hours and send you email alerts 
              when profiles are created, deleted, or modified.
            </AlertDescription>
          </Alert>

          {/* Tabs for managing and viewing */}
          <Tabs defaultValue="manage" className="w-full">
            <TabsList className="grid w-full max-w-3xl grid-cols-4">
              <TabsTrigger value="manage">Manage</TabsTrigger>
              <TabsTrigger value="visualize">Network</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="compare">Compare</TabsTrigger>
            </TabsList>

            <TabsContent value="manage" className="space-y-6 mt-6">
              <MonitoredUsernamesManager workspaceId={workspace.id} />
            </TabsContent>

            <TabsContent value="visualize" className="mt-6">
              <MaigretNetworkVisualization workspaceId={workspace.id} />
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <ProfileChangesHistory workspaceId={workspace.id} />
            </TabsContent>

            <TabsContent value="compare" className="mt-6">
              <ProfileComparisonView workspaceId={workspace.id} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
