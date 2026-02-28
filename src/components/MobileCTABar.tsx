import { Search, Menu, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";

export const MobileCTABar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  // Hide CTA bar when iOS keyboard is open
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const handleResize = () => {
      // If viewport height is significantly less than window height, keyboard is open
      const isKeyboard = viewport.height < window.innerHeight * 0.75;
      setKeyboardOpen(isKeyboard);
    };

    viewport.addEventListener('resize', handleResize);
    return () => viewport.removeEventListener('resize', handleResize);
  }, []);

  // Don't show on certain pages or when keyboard is open
  const hideOnPages = ['/scan', '/dashboard'];
  if (!isMobile || hideOnPages.includes(location.pathname) || keyboardOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pb-safe">
      <div className="bg-card/95 backdrop-blur-lg backdrop-saturate-150 border-t border-border shadow-elevated">
        <div className="flex items-center justify-around px-4 py-3 max-w-screen-xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center gap-1 h-auto py-2 px-4 touch-target min-h-[44px]"
            onClick={() => navigate('/')}
          >
            <Search className="w-5 h-5" />
            <span className="text-xs">Search</span>
          </Button>

          <Button
            size="lg"
            className="rounded-full px-8 touch-target min-h-[44px] shadow-glow"
            onClick={() => navigate('/free-scan')}
          >
            <Plus className="w-5 h-5 mr-2" />
            New Scan
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center gap-1 h-auto py-2 px-4 touch-target min-h-[44px]"
            onClick={() => navigate('/dashboard')}
          >
            <Menu className="w-5 h-5" />
            <span className="text-xs">History</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
