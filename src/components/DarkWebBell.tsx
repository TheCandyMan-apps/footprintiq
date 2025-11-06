import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DarkWebMonitorModal } from './DarkWebMonitorModal';
import { useDarkWebMonitor } from '@/hooks/useDarkWebMonitor';

export const DarkWebBell = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const { enabled, newFindingsCount, clearNewCount, userId } = useDarkWebMonitor();

  if (!enabled || !userId) return null;

  const handleClick = () => {
    setModalOpen(true);
  };

  return (
    <>
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClick}
          className="relative hover:bg-destructive/10"
        >
          <Bell 
            className={`w-5 h-5 ${newFindingsCount > 0 ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`}
          />
          {newFindingsCount > 0 && (
            <>
              <Badge 
                className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 px-1 bg-destructive text-white text-xs animate-pulse"
              >
                {newFindingsCount > 9 ? '9+' : newFindingsCount}
              </Badge>
              <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive/20 animate-ping" />
            </>
          )}
        </Button>
      </div>

      <DarkWebMonitorModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        userId={userId}
        onClearNew={clearNewCount}
      />
    </>
  );
};
