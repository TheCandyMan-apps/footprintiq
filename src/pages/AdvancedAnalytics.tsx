import { Header } from "@/components/Header";
import { SEO } from "@/components/SEO";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportBuilder } from "@/components/analytics/ReportBuilder";
import { ComparativeAnalysis } from "@/components/analytics/ComparativeAnalysis";
import { CustomMetrics } from "@/components/analytics/CustomMetrics";
import { ReconNgScanForm } from "@/components/analytics/ReconNgScanForm";
import { ReconNgResults } from "@/components/analytics/ReconNgResults";
import { BarChart3, GitCompare, TrendingUp, FileText, Database, Brain, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function AdvancedAnalytics() {
  const { data: workspaces } = useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('workspace_members')
        .select('workspace_id, workspaces(id, name)')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data?.map(m => m.workspaces).filter(Boolean) || [];
    },
  });

  const workspaceId = workspaces?.[0]?.id || '';

  return (
    <>
      <SEO 
        title="Advanced Analytics — FootprintIQ Business Intelligence"
        description="Advanced analytics and business intelligence for OSINT data. Custom reports, comparative analysis, and predictive insights."
      />
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">Advanced Analytics</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Business intelligence and data insights
            </p>
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="builder" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="builder">
                <FileText className="h-4 w-4 mr-2" />
                Report Builder
              </TabsTrigger>
              <TabsTrigger value="comparison">
                <GitCompare className="h-4 w-4 mr-2" />
                Comparative Analysis
              </TabsTrigger>
              <TabsTrigger value="metrics">
                <TrendingUp className="h-4 w-4 mr-2" />
                Custom Metrics
              </TabsTrigger>
              <TabsTrigger value="recon-ng">
                <Shield className="h-4 w-4 mr-2" />
                Recon-ng Intel
              </TabsTrigger>
              <TabsTrigger value="warehouse">
                <Database className="h-4 w-4 mr-2" />
                Data Warehouse
              </TabsTrigger>
              <TabsTrigger value="predictive">
                <Brain className="h-4 w-4 mr-2" />
                Predictive Analytics
              </TabsTrigger>
            </TabsList>

            {/* Report Builder */}
            <TabsContent value="builder">
              <ReportBuilder />
            </TabsContent>

            {/* Comparative Analysis */}
            <TabsContent value="comparison">
              <ComparativeAnalysis />
            </TabsContent>

            {/* Custom Metrics */}
            <TabsContent value="metrics">
              <CustomMetrics />
            </TabsContent>

            {/* Recon-ng Intelligence */}
            <TabsContent value="recon-ng" className="space-y-6">
              <ReconNgScanForm workspaceId={workspaceId} />
              <ReconNgResults workspaceId={workspaceId} />
            </TabsContent>

            {/* Data Warehouse (Placeholder) */}
            <TabsContent value="warehouse">
              <div className="text-center py-12">
                <Database className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Data Warehouse Connectors</h3>
                <p className="text-muted-foreground mb-4">
                  Connect to BigQuery, Snowflake, S3, and more
                </p>
                <p className="text-sm text-muted-foreground">Coming soon in next update</p>
              </div>
            </TabsContent>

            {/* Predictive Analytics (Placeholder) */}
            <TabsContent value="predictive">
              <div className="text-center py-12">
                <Brain className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Predictive Analytics</h3>
                <p className="text-muted-foreground mb-4">
                  AI-powered forecasting and trend prediction
                </p>
                <p className="text-sm text-muted-foreground">Coming soon in next update</p>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
}
