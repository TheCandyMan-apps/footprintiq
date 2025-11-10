import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SimpleResultsViewer } from '@/components/maigret/SimpleResultsViewer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function SimpleMaigretResults() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

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
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/maigret/simple')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Scanner
            </Button>
          </div>

          <SimpleResultsViewer jobId={jobId} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
