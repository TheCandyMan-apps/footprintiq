import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DeepResearchPanel } from "@/components/research/DeepResearchPanel";
import { FeatureGate } from "@/components/tier-gating/FeatureGate";

export default function Research() {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Deep Research | FootprintIQ</title>
        <meta name="description" content="AI-powered deep research with real-time web intelligence from Perplexity. Research usernames, emails, phones, and more." />
      </Helmet>
      
      <Header />
      
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Deep Research</h1>
          <p className="text-muted-foreground">
            AI-powered research with real-time web intelligence from Perplexity
          </p>
        </div>

        <FeatureGate feature="deep_research">
          <DeepResearchPanel />
        </FeatureGate>
      </main>
      
      <Footer />
    </div>
  );
}