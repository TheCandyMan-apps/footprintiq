import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { UsernameScanForm } from '@/components/scan/UsernameScanForm';
import { ScanJobList } from '@/components/scan/ScanJobList';
import { WorkerHealth } from '@/components/scan/WorkerHealth';
import { Helmet } from 'react-helmet-async';

export default function UsernamesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Username Scan - FootprintIQ</title>
        <meta
          name="description"
          content="Search for usernames across hundreds of social media platforms and websites with our advanced Maigret scanner"
        />
      </Helmet>
      
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Username Scan</h1>
              <p className="text-muted-foreground mt-2">
                Search for profiles across social media platforms, forums, and websites
              </p>
            </div>
            <WorkerHealth />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <UsernameScanForm />
            <ScanJobList />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
