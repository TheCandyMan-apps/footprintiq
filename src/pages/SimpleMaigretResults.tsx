import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SimpleResultsViewer } from '@/components/maigret/SimpleResultsViewer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function SimpleMaigretResults() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        const returnUrl = `/maigret/results/${jobId}`;
        navigate(`/auth?redirect=${encodeURIComponent(returnUrl)}`);
        return;
      }
      
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [jobId, navigate]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Checking authentication...</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!jobId) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <p>Invalid job ID</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="space-y-4 animate-fade-in">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/scan/advanced')}
              className="hover:bg-primary/10 transition-all hover:scale-105"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Scanner
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 blur-3xl -z-10" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Username Scan Results
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Detailed OSINT analysis across 300+ platforms
              </p>
            </div>
          </div>

          <SimpleResultsViewer jobId={jobId} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
