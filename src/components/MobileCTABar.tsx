import { Search, Menu, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

export const MobileCTABar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [tapped, setTapped] = useState<string | null>(null);

  // Hide CTA bar when iOS keyboard is open
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const handleResize = () => {
      const isKeyboard = viewport.height < window.innerHeight * 0.75;
      setKeyboardOpen(isKeyboard);
    };

    viewport.addEventListener('resize', handleResize);
    return () => viewport.removeEventListener('resize', handleResize);
  }, []);

  const handleTap = useCallback((id: string, path: string) => {
    setTapped(id);
    setTimeout(() => setTapped(null), 150);
    navigate(path);
  }, [navigate]);

  // Check if a scan is currently running
  const isScanRunning = location.pathname.startsWith('/results/');

  // Don't show on certain pages or when keyboard is open
  const hideOnPages = ['/scan', '/dashboard'];
  if (!isMobile || hideOnPages.includes(location.pathname) || keyboardOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pb-safe">
      <div className="bg-card/95 backdrop-blur-md backdrop-saturate-150 border-t border-border/60 shadow-[0_-1px_3px_0_hsl(var(--foreground)/0.04),0_-4px_16px_-4px_hsl(var(--foreground)/0.06)]">
        <div className="flex items-center justify-around px-4 py-4 max-w-screen-xl mx-auto">
          <button
            onClick={() => handleTap('search', '/')}
            className={cn(
              "flex flex-col items-center gap-1 min-w-[44px] min-h-[44px] justify-center rounded-lg transition-transform duration-100 active:scale-90",
              tapped === 'search' && "scale-90"
            )}
          >
            <Search className="w-5 h-5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Search</span>
          </button>

          <button
            onClick={() => handleTap('scan', '/scan')}
            className={cn(
              "relative inline-flex items-center gap-2 rounded-full px-8 min-h-[48px] bg-primary text-primary-foreground font-medium shadow-md transition-transform duration-100 active:scale-95",
              tapped === 'scan' && "scale-95"
            )}
          >
            <Plus className="w-5 h-5" />
            New Scan
            {isScanRunning && (
              <span className="absolute top-1.5 right-2.5 w-2 h-2 rounded-full bg-accent animate-pulse" />
            )}
          </button>

          <button
            onClick={() => handleTap('history', '/dashboard')}
            className={cn(
              "flex flex-col items-center gap-1 min-w-[44px] min-h-[44px] justify-center rounded-lg transition-transform duration-100 active:scale-90",
              tapped === 'history' && "scale-90"
            )}
          >
            <Menu className="w-5 h-5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">History</span>
          </button>
        </div>
      </div>
    </div>
  );
};