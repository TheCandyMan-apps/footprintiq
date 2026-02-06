import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Shield, ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

interface ShareData {
  score: number;
  level: string;
}

export default function ScanShare() {
  const { scanId } = useParams<{ scanId: string }>();
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (scanId) {
      loadShareData();
    }
  }, [scanId]);

  const loadShareData = async () => {
    try {
      // Derive a consistent score from scanId hash for demo purposes
      // In production, this would come from stored exposure_score
      const hash = scanId?.split('').reduce((a, c) => a + c.charCodeAt(0), 0) || 50;
      const derivedScore = (hash % 60) + 30; // Range 30-90
      const derivedLevel = derivedScore < 40 ? 'low' : derivedScore < 70 ? 'moderate' : 'high';
      
      setShareData({
        score: derivedScore,
        level: derivedLevel,
      });
    } catch (err) {
      console.error('Failed to load share data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Generate OG image URL
  const ogImageUrl = scanId 
    ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/og-share-image?scanId=${scanId}&score=${shareData?.score || 50}&level=${shareData?.level || 'moderate'}`
    : 'https://footprintiq.app/og-image.jpg';

  const levelLabel = shareData?.level 
    ? shareData.level.charAt(0).toUpperCase() + shareData.level.slice(1) 
    : 'Unknown';

  return (
    <>
      <Helmet>
        <title>Digital Exposure Score | FootprintIQ</title>
        <meta name="description" content="Someone shared their digital exposure score. Check your own digital footprint for free." />
        <meta property="og:title" content="Digital Exposure Score | FootprintIQ" />
        <meta property="og:description" content="Someone checked their digital footprint. See what the internet knows about you." />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Digital Exposure Score | FootprintIQ" />
        <meta name="twitter:description" content="Someone checked their digital footprint. See what the internet knows about you." />
        <meta name="twitter:image" content={ogImageUrl} />
      </Helmet>

      <Header />
      
      <main className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
        <Card className="max-w-lg w-full">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Someone shared their exposure score</h1>
              <p className="text-muted-foreground">
                They checked their digital footprint and found what the internet knows about them.
              </p>
            </div>

            {!loading && shareData && (
              <div className="mb-8 p-6 rounded-xl bg-muted/30 border border-border">
                <div className="text-5xl font-bold text-primary mb-2">
                  {shareData.score}<span className="text-2xl text-muted-foreground">/100</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {levelLabel} Exposure
                </div>
              </div>
            )}

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Curious about your own digital footprint?
              </p>
              <Button size="lg" className="w-full" asChild>
                <Link to="/scan">
                  <Search className="w-5 h-5 mr-2" />
                  Run Your Free Scan
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Public data only
                </span>
                <span>•</span>
                <span>No PII shared</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </>
  );
}
