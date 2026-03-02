import { Header } from "@/components/Header";
import { SEO } from "@/components/SEO";
import { WatchlistManager } from "@/components/watchlist/WatchlistManager";

export default function Watchlists() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Watchlists – Monitor Targets Continuously | FootprintIQ"
        description="Create and manage OSINT watchlists to continuously monitor usernames, emails, and digital identities for new exposures."
      />
      <Header />
      <main className="container mx-auto px-4 py-8">
        <WatchlistManager />
      </main>
    </div>
  );
}