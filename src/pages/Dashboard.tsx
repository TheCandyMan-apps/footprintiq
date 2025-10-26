import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { 
  Shield, 
  TrendingDown, 
  Clock, 
  Plus,
  BarChart3
} from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface Scan {
  id: string;
  scan_type: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  privacy_score?: number;
  total_sources_found: number;
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
  created_at: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchScans();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchScans = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("scans")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error loading scans",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setScans(data || []);
    }
    setLoading(false);
  };


  const handleNewScan = () => {
    navigate("/scan");
  };

  const handleViewScan = (scanId: string) => {
    navigate(`/results/${scanId}`);
  };

  const calculateAverageScore = () => {
    if (scans.length === 0) return 0;
    const validScores = scans.filter(s => s.privacy_score !== null);
    if (validScores.length === 0) return 0;
    const sum = validScores.reduce((acc, s) => acc + (s.privacy_score || 0), 0);
    return Math.round(sum / validScores.length);
  };

  const getTotalDataPoints = () => {
    return scans.reduce((acc, s) => acc + s.total_sources_found, 0);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold">Privacy Dashboard</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Track your digital footprint and monitor your privacy score over time
          </p>
        </div>
        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Privacy Score</p>
                <p className={`text-3xl font-bold ${getScoreColor(calculateAverageScore())}`}>
                  {calculateAverageScore()}/100
                </p>
              </div>
              <BarChart3 className="w-10 h-10 text-primary opacity-50" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Scans</p>
                <p className="text-3xl font-bold">{scans.length}</p>
              </div>
              <Clock className="w-10 h-10 text-primary opacity-50" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Data Sources Found</p>
                <p className="text-3xl font-bold">{getTotalDataPoints()}</p>
              </div>
              <TrendingDown className="w-10 h-10 text-destructive opacity-50" />
            </div>
          </Card>
        </div>

        {/* New Scan Button */}
        <div className="mb-6 flex gap-3">
          <Button onClick={handleNewScan} size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            Start New Scan
          </Button>
          <Button onClick={() => navigate('/graph')} variant="outline" size="lg" className="gap-2">
            <BarChart3 className="w-5 h-5" />
            Entity Graph
          </Button>
          <Button onClick={() => navigate('/search')} variant="outline" size="lg" className="gap-2">
            <BarChart3 className="w-5 h-5" />
            Search
          </Button>
        </div>

        {/* Scan History */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Scan History</h2>
          
          {loading ? (
            <Card className="p-8 text-center text-muted-foreground">
              Loading your scans...
            </Card>
          ) : scans.length === 0 ? (
            <Card className="p-8 text-center">
              <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No scans yet</h3>
              <p className="text-muted-foreground mb-4">
                Start your first privacy scan to see what information is available about you online.
              </p>
              <Button onClick={handleNewScan}>
                <Plus className="w-4 h-4 mr-2" />
                Start First Scan
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {scans.map((scan) => (
                <Card 
                  key={scan.id} 
                  className="p-6 bg-gradient-card border-border hover:shadow-glow transition-all cursor-pointer"
                  onClick={() => handleViewScan(scan.id)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">
                        {scan.scan_type === 'username' 
                          ? `Username: ${scan.username}`
                          : `${scan.first_name} ${scan.last_name}`
                        }
                      </h3>
                      <div className="flex flex-wrap gap-3 text-sm">
                        <span className="text-muted-foreground">
                          {new Date(scan.created_at).toLocaleDateString()}
                        </span>
                        <span className="text-destructive">
                          {scan.high_risk_count} High Risk
                        </span>
                        <span className="text-primary">
                          {scan.medium_risk_count} Medium Risk
                        </span>
                        <span className="text-accent">
                          {scan.low_risk_count} Low Risk
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {scan.privacy_score && (
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Score</p>
                          <p className={`text-2xl font-bold ${getScoreColor(scan.privacy_score)}`}>
                            {scan.privacy_score}
                          </p>
                        </div>
                      )}
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;