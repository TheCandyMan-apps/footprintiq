import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface LastScannedProps {
  timestamp?: Date | string;
}

export const LastScanned = ({ timestamp }: LastScannedProps) => {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    const updateTimeAgo = () => {
      if (!timestamp) {
        setTimeAgo('2 min ago');
        return;
      }

      const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) {
        setTimeAgo('just now');
      } else if (diffMins < 60) {
        setTimeAgo(`${diffMins} min ago`);
      } else if (diffMins < 1440) {
        const hours = Math.floor(diffMins / 60);
        setTimeAgo(`${hours} hour${hours > 1 ? 's' : ''} ago`);
      } else {
        const days = Math.floor(diffMins / 1440);
        setTimeAgo(`${days} day${days > 1 ? 's' : ''} ago`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [timestamp]);

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <Clock className="w-3 h-3" />
      </div>
      <span>Last scanned: {timeAgo}</span>
    </div>
  );
};
