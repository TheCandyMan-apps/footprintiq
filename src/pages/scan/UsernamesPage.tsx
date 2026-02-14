import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { UsernameScanForm } from '@/components/scan/UsernameScanForm';
import { ScanJobList } from '@/components/scan/ScanJobList';
import { WorkerHealth } from '@/components/scan/WorkerHealth';
import { UsernameScanComparison } from '@/components/scan/UsernameScanComparison';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UsernamesProBanner } from '@/components/conversion/UsernamesProBanner';

export default function UsernamesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Username Scan - FootprintIQ</title>
        <meta
          name="description"
          content="Search for usernames across hundreds of social media platforms and websites with our multi-tool OSINT scanner"
        />
      </Helmet>
      
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Username Scan</h1>
              <p className="text-muted-foreground mt-2">
                Search for profiles across social media platforms, forums, and websites
              </p>
            </div>
            <WorkerHealth />
          </div>

          {/* Pro conversion banner */}
          <UsernamesProBanner />

          <Alert className="bg-muted/50">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <Link to="/ai-answers-hub" className="font-medium underline underline-offset-4 hover:text-primary">
                AI Answers
              </Link>{" "}
              explains accuracy limits, legality, and ethical use of username OSINT.{" "}
              <Link to="/ai-answers/are-username-search-tools-accurate" className="underline underline-offset-4 hover:text-primary">
                Are username search tools accurate?
              </Link>
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="scan" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="scan">New Scan</TabsTrigger>
              <TabsTrigger value="compare">Compare Scans</TabsTrigger>
            </TabsList>

            <TabsContent value="scan" className="space-y-6 mt-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <UsernameScanForm />
                <ScanJobList />
              </div>
            </TabsContent>

            <TabsContent value="compare" className="mt-6">
              <UsernameScanComparison />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
