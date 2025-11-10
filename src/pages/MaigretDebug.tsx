import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MaigretDebugPanel } from '@/components/maigret/MaigretDebugPanel';

export default function MaigretDebug() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Maigret Debug Panel</h1>
            <p className="text-muted-foreground mt-2">
              Monitor worker health and recent scan results
            </p>
          </div>

          <MaigretDebugPanel />
        </div>
      </main>
      <Footer />
    </div>
  );
}
