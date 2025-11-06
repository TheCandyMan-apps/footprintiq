import { Search, Menu, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

export const MobileCTABar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  // Don't show on certain pages
  const hideOnPages = ['/new-scan', '/scan-history'];
  if (!isMobile || hideOnPages.includes(location.pathname)) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pb-safe">
      <div className="bg-card/95 backdrop-blur-lg border-t border-border shadow-elevated">
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
            onClick={() => navigate('/new-scan')}
          >
            <Plus className="w-5 h-5 mr-2" />
            New Scan
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center gap-1 h-auto py-2 px-4 touch-target min-h-[44px]"
            onClick={() => navigate('/scan-history')}
          >
            <Menu className="w-5 h-5" />
            <span className="text-xs">History</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
