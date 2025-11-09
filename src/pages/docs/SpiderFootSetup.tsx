import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Terminal, Server, Key, ExternalLink, CheckCircle2, AlertTriangle } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function SpiderFootSetup() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>SpiderFoot Setup Guide - FootprintIQ</title>
        <meta
          name="description"
          content="Learn how to deploy and configure SpiderFoot for 200+ module OSINT reconnaissance"
        />
      </Helmet>
      
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-primary/10">
                <Shield className="w-12 h-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold">SpiderFoot Deployment Guide</h1>
            <p className="text-xl text-muted-foreground">
              Deploy your own SpiderFoot server for 200+ module reconnaissance
            </p>
          </div>

          {/* Prerequisites */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-primary" />
              Prerequisites
            </h2>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                <span>Docker installed on your machine or server</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                <span>A cloud hosting account (Render, Fly.io, AWS, etc.)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                <span>Basic knowledge of environment variables and secrets</span>
              </li>
            </ul>
          </Card>

          {/* Step 1: Docker Setup */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Terminal className="w-6 h-6 text-primary" />
              Step 1: Pull SpiderFoot Docker Image
            </h2>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                SpiderFoot provides an official Docker image that makes deployment simple:
              </p>
              <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                docker pull spiderfoot/spiderfoot
              </div>
              <Alert>
                <AlertDescription>
                  This will download the latest stable version of SpiderFoot
                </AlertDescription>
              </Alert>
            </div>
          </Card>

          {/* Step 2: Local Testing */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Server className="w-6 h-6 text-primary" />
              Step 2: Test Locally
            </h2>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Before deploying to production, test SpiderFoot locally:
              </p>
              <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-2">
                <div>docker run -d \</div>
                <div className="pl-4">-p 5001:5001 \</div>
                <div className="pl-4">--name spiderfoot \</div>
                <div className="pl-4">spiderfoot/spiderfoot</div>
              </div>
              <p className="text-muted-foreground">
                Access SpiderFoot at <code className="bg-muted px-2 py-1 rounded">http://localhost:5001</code>
              </p>
            </div>
          </Card>

          {/* Step 3: Deploy to Cloud */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <ExternalLink className="w-6 h-6 text-primary" />
              Step 3: Deploy to Cloud Platform
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Option A: Render</h3>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground pl-4">
                  <li>Create a new Web Service on Render</li>
                  <li>Select "Deploy an existing image from a registry"</li>
                  <li>Enter image: <code className="bg-muted px-2 py-1 rounded">spiderfoot/spiderfoot</code></li>
                  <li>Set port to 5001</li>
                  <li>Deploy and copy the URL</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Option B: Fly.io</h3>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-2">
                  <div>fly launch --image spiderfoot/spiderfoot \</div>
                  <div className="pl-4">--internal-port 5001</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Option C: AWS/GCP/Azure</h3>
                <p className="text-muted-foreground">
                  Deploy using container services like ECS, Cloud Run, or Container Instances.
                  Ensure port 5001 is exposed and accessible.
                </p>
              </div>
            </div>
          </Card>

          {/* Step 4: Configure Secrets */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Key className="w-6 h-6 text-primary" />
              Step 4: Configure FootprintIQ Secrets
            </h2>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Add your SpiderFoot deployment URL to FootprintIQ:
              </p>
              <ol className="list-decimal list-inside space-y-3 text-muted-foreground pl-4">
                <li>
                  Copy your SpiderFoot deployment URL (e.g., <code className="bg-muted px-2 py-1 rounded">https://your-spiderfoot.onrender.com</code>)
                </li>
                <li>
                  Contact <a href="mailto:admin@footprintiq.app" className="text-primary hover:underline">admin@footprintiq.app</a> with:
                  <ul className="list-disc list-inside pl-6 mt-2 space-y-1">
                    <li>Your FootprintIQ workspace ID</li>
                    <li>Your SpiderFoot deployment URL</li>
                    <li>Optional: SpiderFoot API key (if configured)</li>
                  </ul>
                </li>
                <li>
                  Our team will configure the <code className="bg-muted px-2 py-1 rounded">SPIDERFOOT_API_URL</code> secret for your workspace
                </li>
              </ol>
              <Alert className="border-primary/50 bg-primary/5">
                <AlertDescription>
                  <strong>Security Note:</strong> Never share your API keys publicly. Our team will securely store your configuration.
                </AlertDescription>
              </Alert>
            </div>
          </Card>

          {/* Step 5: Verify */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-primary" />
              Step 5: Verify Integration
            </h2>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Once configured, verify your SpiderFoot integration:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground pl-4">
                <li>Navigate to the Advanced Scan page</li>
                <li>The SpiderFoot Recon tab should now be visible</li>
                <li>Run a test scan to confirm functionality</li>
                <li>Check that results are being returned successfully</li>
              </ol>
            </div>
          </Card>

          {/* Resources */}
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/30">
            <h2 className="text-2xl font-semibold mb-4">Additional Resources</h2>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => window.open('https://github.com/smicallef/spiderfoot', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                SpiderFoot GitHub Repository
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => window.open('https://www.spiderfoot.net/documentation/', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Official SpiderFoot Documentation
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => window.location.href = 'mailto:admin@footprintiq.app?subject=SpiderFoot Setup Help'}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Contact FootprintIQ Support
              </Button>
            </div>
          </Card>

          {/* Back Button */}
          <div className="flex justify-center pt-4">
            <Button
              variant="default"
              size="lg"
              onClick={() => window.location.href = '/scan/advanced'}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              Back to Advanced Scan
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
