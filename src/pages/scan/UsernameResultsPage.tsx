import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ScanResults } from '@/components/scan/ScanResults';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { ScanErrorBoundary } from '@/components/ScanErrorBoundary';

export default function UsernameResultsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

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
            <div className="mb-4 sm:mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/scan/usernames')}
                className="mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Back to Scans</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </div>

            <ScanResults jobId={jobId} />
          </div>
        </main>
        
        <Footer />
      </div>
    </ScanErrorBoundary>
  );
}
