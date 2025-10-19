import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getPartnerTier } from "@/lib/partners";
import { Users, DollarSign, TrendingUp, Copy, ExternalLink } from "lucide-react";

const PartnerDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    clients: 0,
    revenue: 0,
    commission: 0
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        // In production, fetch actual partner stats from database
        // For now, showing example data
        setStats({
          clients: 12,
          revenue: 24500,
          commission: 4900
        });
      }
    });
  }, [navigate]);

  const referralLink = user ? `https://footprintiq.app/?ref=${user.id}` : "";
  const currentTier = getPartnerTier(stats.clients);

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard"
    });
  };

  return (
    <>
      <SEO
        title="Partner Dashboard — FootprintIQ"
        description="Manage your FootprintIQ partner account, track commissions, and view client referrals."
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 py-12 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Partner Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back! Track your performance and manage your referrals.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Total Clients</h3>
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <p className="text-3xl font-bold">{stats.clients}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Tier: {currentTier.name}
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Total Revenue</h3>
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <p className="text-3xl font-bold">${stats.revenue.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  All time
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Your Commission</h3>
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <p className="text-3xl font-bold">${stats.commission.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {currentTier.commission}% rate
                </p>
              </Card>
            </div>

            {/* Referral Link */}
            <Card className="p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">Your Referral Link</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="flex-1 px-4 py-2 bg-muted rounded-md font-mono text-sm"
                />
                <Button onClick={copyReferralLink} variant="outline">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Share this link to track your referrals and earn commission
              </p>
            </Card>

            {/* Tier Benefits */}
            <Card className="p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">Your Current Tier: {currentTier.name}</h2>
              <div className="space-y-2">
                {currentTier.benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Resources */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Partner Resources</h2>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-between">
                  <span>Marketing Materials</span>
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between">
                  <span>Partner Training</span>
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between">
                  <span>Contact Partner Support</span>
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default PartnerDashboard;
