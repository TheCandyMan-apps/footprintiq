import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SimpleScanForm } from '@/components/maigret/SimpleScanForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SimpleMaigretScan() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Simple Maigret Scanner</h1>
            <p className="text-muted-foreground mt-2">
              Direct worker integration for username scanning
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Start New Scan</CardTitle>
              <CardDescription>
                Scan usernames across social media platforms using the simplified pipeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleScanForm />
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
