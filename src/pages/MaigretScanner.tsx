import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { UsernameScanForm } from '@/components/maigret/UsernameScanForm';
import { ScanJobList } from '@/components/maigret/ScanJobList';
import { ScanResultsTable } from '@/components/maigret/ScanResultsTable';
import { WorkerStatus } from '@/components/maigret/WorkerStatus';

export default function MaigretScanner() {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleScanStarted = (jobId: string) => {
    setSelectedJobId(jobId);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Maigret Username Scanner</h1>
              <p className="text-muted-foreground mt-2">
                Search for usernames across hundreds of social media platforms and websites
              </p>
            </div>
            <WorkerStatus />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <UsernameScanForm onScanStarted={handleScanStarted} />
            </div>
            <div>
              <ScanJobList 
                refreshTrigger={refreshTrigger} 
                onJobSelect={setSelectedJobId}
              />
            </div>
          </div>

          {selectedJobId && (
            <ScanResultsTable jobId={selectedJobId} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
