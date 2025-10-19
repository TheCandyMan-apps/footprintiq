import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { calculateGlobalRiskIndex, type GlobalMetrics } from "@/lib/globalAnalytics";
import { Globe, TrendingUp, Shield, AlertTriangle, Database } from "lucide-react";

const GlobalIndex = () => {
  const [metrics, setMetrics] = useState<GlobalMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchGlobalMetrics();
  }, []);

  const fetchGlobalMetrics = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('global-analytics');
      
      if (error) throw error;
      setMetrics(data);
    } catch (error) {
      toast({
        title: "Error loading metrics",
        description: "Failed to fetch global analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const riskIndex = metrics ? calculateGlobalRiskIndex(metrics) : 0;

  return (
    <>
      <SEO
        title="Global Exposure Index — FootprintIQ"
        description="Real-time anonymized analytics on global digital exposure trends. See how privacy risks evolve across regions and industries."
        canonical="https://footprintiq.app/global-index"
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1">
          {/* Hero Section */}
          <section className="py-20 px-6 bg-gradient-to-br from-primary/5 via-background to-accent/5">
            <div className="max-w-4xl mx-auto text-center">
              <Globe className="w-16 h-16 mx-auto mb-6 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Global Exposure Index
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Real-time insights into worldwide digital exposure trends based on anonymized scan data
              </p>
            </div>
          </section>

          {/* Key Metrics */}
          <section className="py-16 px-6">
            <div className="max-w-6xl mx-auto">
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Loading global metrics...</p>
                </div>
              ) : (
                <>
                  {/* Global Risk Index */}
                  <Card className="p-8 mb-8 text-center bg-gradient-card">
                    <h2 className="text-2xl font-bold mb-4">Global Privacy Risk Index</h2>
                    <div className="flex items-center justify-center gap-4">
                      <Shield className="w-12 h-12 text-primary" />
                      <p className="text-6xl font-bold text-primary">{riskIndex}</p>
                      <TrendingUp className="w-12 h-12 text-destructive" />
                    </div>
                    <p className="text-muted-foreground mt-4">
                      Based on {metrics?.totalScans.toLocaleString() || 0} anonymized scans from the last 30 days
                    </p>
                  </Card>

                  {/* Stats Grid */}
                  <div className="grid md:grid-cols-3 gap-6 mb-12">
                    <Card className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Total Scans</h3>
                        <Database className="w-5 h-5 text-primary" />
                      </div>
                      <p className="text-3xl font-bold">{metrics?.totalScans.toLocaleString() || 0}</p>
                    </Card>

                    <Card className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Exposures Found</h3>
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                      </div>
                      <p className="text-3xl font-bold">{metrics?.totalExposures.toLocaleString() || 0}</p>
                    </Card>

                    <Card className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Avg Risk Score</h3>
                        <TrendingUp className="w-5 h-5 text-primary" />
                      </div>
                      <p className="text-3xl font-bold">{metrics?.averageRiskScore || 0}/100</p>
                    </Card>
                  </div>

                  {/* Top Categories */}
                  <Card className="p-6 mb-8">
                    <h2 className="text-xl font-bold mb-6">Top Exposure Categories</h2>
                    <div className="space-y-4">
                      {metrics?.topCategories.slice(0, 5).map((cat, index) => (
                        <div key={cat.name} className="flex items-center gap-4">
                          <span className="text-2xl font-bold text-muted-foreground w-8">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <p className="font-medium">{cat.name}</p>
                            <div className="w-full bg-muted h-2 rounded-full mt-2">
                              <div 
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${(cat.count / metrics.totalExposures) * 100}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {cat.count.toLocaleString()} findings
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Data Notice */}
                  <Card className="p-6 bg-muted/50">
                    <p className="text-sm text-muted-foreground text-center">
                      All data is anonymized and aggregated to protect user privacy. 
                      Individual scan results are never shared or exposed.
                    </p>
                  </Card>
                </>
              )}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default GlobalIndex;
