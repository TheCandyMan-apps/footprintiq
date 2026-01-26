/**
 * FreeResultsHeader Component
 * 
 * Displays a narrative-first header for Free users showing
 * "Here's what we found" with redacted scan note.
 */

import { Badge } from '@/components/ui/badge';
import { Lock, Shield, Eye } from 'lucide-react';
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
    <div className={cn('space-y-3', className)}>
      {/* Main narrative header */}
      <div className="text-center space-y-1.5">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Here's what we found
        </h1>
        <p className="text-sm text-muted-foreground">
          for <span className="font-medium text-foreground">{username}</span>
        </p>
      </div>

      {/* Redacted scan note */}
      <div className="flex items-center justify-center gap-2">
        <Badge 
          variant="secondary" 
          className="h-6 px-3 gap-1.5 text-xs font-normal bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
        >
          <Eye className="h-3 w-3" />
          You're viewing a redacted Advanced scan
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
        <span>Cancel anytime</span>
      </div>
    </div>
  );
}
