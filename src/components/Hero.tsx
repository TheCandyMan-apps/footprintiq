import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { analytics } from "@/lib/analytics";

export const Hero = () => {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) return;
    analytics.trackEvent('hero_scan_start', { type: 'username' });
    navigate(`/scan?q=${encodeURIComponent(trimmed)}`);
  }, [username, navigate]);

  return (
    <section className="relative min-h-[60svh] md:min-h-[85vh] flex items-center justify-center bg-background">
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-background" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 md:px-6 py-12 md:py-24 text-center">
        <p className="text-xs md:text-sm font-medium uppercase tracking-widest text-primary mb-3 md:mb-4">
          Ethical Digital Footprint Scanner
        </p>

        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight tracking-tight text-foreground">
          Find Where a Username Appears Online
        </h1>

        <p className="text-base sm:text-xl md:text-2xl text-muted-foreground mb-6 md:mb-10 max-w-2xl mx-auto leading-relaxed">
          FootprintIQ scans hundreds of platforms to reveal profiles, exposure risks, and digital footprint signals.
        </p>

        {/* Username input */}
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter a username to scan…"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-14 text-base sm:text-lg pl-12 pr-5 bg-background border-2 border-border focus:border-primary rounded-xl"
                aria-label="Username to scan"
                maxLength={255}
                autoCorrect="off"
                autoCapitalize="off"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={!username.trim()}
              className="h-14 px-8 text-lg rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm active:scale-[0.97] transition-transform"
            >
              Run Scan
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </form>

        {/* Trust strip */}
        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
            Free to use — no sign-up required
          </span>
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
            Public data only — ethical OSINT
          </span>
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
            Built for self-assessment &amp; risk reduction
          </span>
        </div>
      </div>
    </section>
  );
};
