import { Header } from '@/components/Header';
import { SEO } from '@/components/SEO';
import { ScanHistoryDashboard } from '@/components/analytics/ScanHistoryDashboard';
import { WorkerHealthDashboard } from '@/components/monitoring/WorkerHealthDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Activity } from 'lucide-react';

export default function ScanAnalytics() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Scan Analytics & Performance — FootprintIQ"
        description="Comprehensive analytics dashboard showing scan success rates, completion times, provider performance, and historical trends."
        canonical="https://footprintiq.app/analytics/scans"
      />
      <Header />

      <div className="container mx-auto py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Scan Analytics & Monitoring</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into scan performance, success rates, and system health
          </p>
        </div>

        <Tabs defaultValue="history" className="space-y-6">
          <TabsList>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Scan History
            </TabsTrigger>
            <TabsTrigger value="health" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              System Health
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-6">
            <ScanHistoryDashboard />
          </TabsContent>

          <TabsContent value="health" className="space-y-6">
            <WorkerHealthDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
