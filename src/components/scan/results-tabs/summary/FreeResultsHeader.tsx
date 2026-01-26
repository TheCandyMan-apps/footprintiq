/**
 * FreeResultsHeader Component
 * 
 * Displays a narrative-first header for Free users showing
 * "Here's what we found" with limited summary subtitle.
 */

import { Badge } from '@/components/ui/badge';
import { Shield, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FreeResultsHeaderProps {
  username: string;
  scanType?: string;
  isFullAccess: boolean;
  className?: string;
}

export function FreeResultsHeader({ 
  username, 
  scanType = 'username',
  isFullAccess,
  className 
}: FreeResultsHeaderProps) {
  if (isFullAccess) {
    return null;
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main narrative header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Here's what we found
        </h1>
        <p className="text-sm text-muted-foreground">
          You're viewing a limited summary of an advanced analysis.
        </p>
      </div>

      {/* Searched identifier badge */}
      <div className="flex items-center justify-center">
        <Badge 
          variant="secondary" 
          className="h-7 px-4 gap-2 text-sm font-medium"
        >
          <Eye className="h-3.5 w-3.5" />
          {username}
        </Badge>
      </div>

      {/* Trust line */}
      <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground/70">
        <span className="flex items-center gap-1">
          <Shield className="h-2.5 w-2.5" />
          Public sources only
        </span>
        <span>•</span>
        <span>Ethical OSINT</span>
        <span>•</span>
        <span>No monitoring</span>
      </div>
    </div>
  );
}
