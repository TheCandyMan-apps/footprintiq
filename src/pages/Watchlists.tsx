import { Header } from "@/components/Header";
import { WatchlistManager } from "@/components/watchlist/WatchlistManager";

export default function Watchlists() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <WatchlistManager />
      </main>
    </div>
  );
}