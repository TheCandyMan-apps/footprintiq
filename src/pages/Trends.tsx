import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TrendChart } from "@/components/TrendChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { ExportDataDialog } from "@/components/ExportDataDialog";

const Trends = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }
    setUserId(session.user.id);
    setLoading(false);
  };

  if (loading || !userId) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Privacy Trends - FootprintIQ"
        description="Track your digital privacy trends over time"
      />
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Privacy Trends</h1>
              <p className="text-muted-foreground">Analyze your digital footprint over time</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="180">Last 6 months</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            <ExportDataDialog />
          </div>
        </div>

        <div className="space-y-6">
          <TrendChart userId={userId} days={days} />

          <Card>
            <CardHeader>
              <CardTitle>About Trend Analysis</CardTitle>
              <CardDescription>
                Track changes in your digital footprint over time
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">What We Track</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Privacy score changes over time</li>
                  <li>Total data exposures trend</li>
                  <li>Risk level distribution</li>
                  <li>New vs. removed exposures</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">How to Improve</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Run regular scans to track progress</li>
                  <li>Act on high-risk findings first</li>
                  <li>Use removal tools to reduce exposures</li>
                  <li>Monitor for new data leaks</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Trends;
