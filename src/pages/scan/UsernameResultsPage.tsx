import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ScanResults } from '@/components/scan/ScanResults';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Share2, Download, Shield, Clock } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { ScanErrorBoundary } from '@/components/ScanErrorBoundary';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function UsernameResultsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [scanDate, setScanDate] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;
    
    // Fetch scan date for display
    const fetchScanDate = async () => {
      const { data } = await supabase
        .from('scans')
        .select('created_at')
        .eq('id', jobId)
        .maybeSingle();
      
      if (data?.created_at) {
        setScanDate(data.created_at);
      }
    };
    
    fetchScanDate();
  }, [jobId]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Link Copied',
        description: 'Scan results link copied to clipboard',
      });
    } catch {
      toast({
        title: 'Share',
        description: url,
      });
    }
  };

  const handleExport = () => {
    // Trigger the export via event - ScanResults will handle it
    const event = new CustomEvent('trigger-export-report');
    window.dispatchEvent(event);
  };

  if (!jobId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Invalid job ID</p>
      </div>
    );
  }

  return (
    <ScanErrorBoundary context="results">
      <div className="min-h-screen flex flex-col bg-background">
        <Helmet>
          <title>Scan Results - FootprintIQ</title>
          <meta name="description" content="View your username scan results in real-time" />
        </Helmet>
        
        <Header />
        
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/scan/usernames')}
                className="w-fit"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Scanner
              </Button>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Share Report</span>
                </Button>
                <Button
                  size="sm"
                  onClick={handleExport}
                  className="gap-2 bg-primary hover:bg-primary/90"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export Report</span>
                </Button>
              </div>
            </div>

            {/* Status Row */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                {scanDate && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <Clock className="h-3.5 w-3.5" />
                    <span>Last scanned: {formatDistanceToNow(new Date(scanDate), { addSuffix: true })}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Secured & Compliant</span>
              </div>
            </div>

            <ScanResults jobId={jobId} />
          </div>
        </main>
        
        <Footer />
      </div>
    </ScanErrorBoundary>
  );
}