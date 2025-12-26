import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DeepResearchPanel } from "@/components/research/DeepResearchPanel";
import { FeatureGate } from "@/components/tier-gating/FeatureGate";

export default function Research() {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Web Intelligence | FootprintIQ</title>
        <meta name="description" content="Search the public web for mentions, profiles, and discussions. Powered by Perplexity for real-time web intelligence." />
      </Helmet>
      
      <Header />
      
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Web Intelligence</h1>
          <p className="text-muted-foreground">
            Search the public web for mentions, profiles, and discussions about a target
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