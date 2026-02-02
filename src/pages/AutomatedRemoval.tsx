import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Zap, CheckCircle, XCircle, Clock, TrendingUp } from "lucide-react";
import { SEO } from "@/components/SEO";

export default function AutomatedRemoval() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [removals, setRemovals] = useState<any[]>([]);
  const [dataSources, setDataSources] = useState<any[]>([]);

  useEffect(() => {
    checkAuth();
    loadData();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) navigate("/auth");
  };

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load campaigns
      const { data: campaignsData } = await supabase
        .from("removal_campaigns")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      // Load automated removals
      const { data: removalsData } = await supabase
        .from("automated_removals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      // Load available data sources for removal
      const { data: sources } = await supabase
        .from("data_sources")
        .select("*, scans!inner(user_id)")
        .eq("scans.user_id", user.id);

      setCampaigns(campaignsData || []);
      setRemovals(removalsData || []);
      setDataSources(sources || []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const highRiskSources = dataSources
        .filter(ds => ds.risk_level === "high")
        .map(ds => ds.name);

      const { error } = await supabase
        .from("removal_campaigns")
        .insert({
          user_id: user.id,
          name: `Campaign ${new Date().toLocaleDateString()}`,
          description: "Automated removal for high-risk sources",
          target_sources: highRiskSources,
          total_requests: highRiskSources.length,
        });

      if (error) throw error;

      // Create automated removal jobs
      for (const source of dataSources.filter(ds => ds.risk_level === "high")) {
        await supabase.from("automated_removals").insert({
          user_id: user.id,
          source_id: source.id,
          status: "pending",
          next_attempt_at: new Date().toISOString(),
        });
      }

      toast({ title: "Success", description: "Removal campaign created" });
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed": return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending": return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (loading) {
    return <div className="container mx-auto py-8">Loading automated removal...</div>;
  }

  return (
    <>
      <SEO 
        title="Free Data Broker Removal — Automated Personal Data Removal | FootprintIQ"
        description="Free data broker removal tool to automatically remove your personal information from data brokers and people search sites. Our automated removal system handles opt-out requests across 100+ platforms."
        canonical="https://footprintiq.app/automated-removal"
        schema={{
          breadcrumbs: {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app/" },
              { "@type": "ListItem", position: 2, name: "Free Data Broker Removal", item: "https://footprintiq.app/automated-removal" }
            ]
          }
        }}
      />
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Free Data Broker Removal</h1>
              <p className="text-muted-foreground">
                Automated data broker removal to opt-out from people search sites and data aggregators
              </p>
            </div>
            <Button onClick={createCampaign}>
              <Zap className="h-4 w-4 mr-2" />
              New Campaign
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Total Campaigns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{campaigns.length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Successful Removals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {removals.filter(r => r.status === "success").length}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  Pending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {removals.filter(r => r.status === "pending").length}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Active Campaigns</CardTitle>
              <CardDescription>Track your automated removal campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              {campaigns.length === 0 ? (
                <div className="text-center py-8">
                  <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No campaigns yet. Create your first automated removal campaign.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="font-medium">{campaign.name}</p>
                          <p className="text-sm text-muted-foreground">{campaign.description}</p>
                        </div>
                        <Badge variant={campaign.status === "active" ? "default" : "secondary"}>
                          {campaign.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>
                            {campaign.successful_removals} / {campaign.total_requests}
                          </span>
                        </div>
                        <Progress 
                          value={(campaign.successful_removals / campaign.total_requests) * 100} 
                        />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Success Rate: {campaign.success_rate?.toFixed(1)}%</span>
                          <span>Failed: {campaign.failed_removals}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Removal Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {removals.slice(0, 10).map((removal) => (
                  <div key={removal.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(removal.status)}
                      <div>
                        <p className="font-medium">Source ID: {removal.source_id.slice(0, 8)}...</p>
                        <p className="text-sm text-muted-foreground">
                          Attempts: {removal.attempt_count} | 
                          {removal.last_attempt_at && ` Last: ${new Date(removal.last_attempt_at).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    <Badge variant={
                      removal.status === "success" ? "default" : 
                      removal.status === "failed" ? "destructive" : "secondary"
                    }>
                      {removal.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
