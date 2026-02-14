/**
 * LockedSection Component
 * 
 * Displays a section with locked content for Free users.
 * Shows title, optional preview content, locked count, and upgrade CTA.
 */

import { useState, ReactNode } from 'react';
import { Lock, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ProUpgradeModal } from './ProUpgradeModal';

interface LockedSectionProps {
  /** Section title */
  title: string;
  /** Optional icon component */
  icon?: React.ComponentType<{ className?: string }>;
  /** Preview content visible to Free users (blurred/truncated) */
  previewContent?: ReactNode;
  /** Number of locked items */
  lockedContentCount: number;
  /** Custom upgrade CTA text */
  upgradeCTA?: string;
  /** Whether this section is locked (true for Free users) */
  isLocked: boolean;
  /** Full content shown to Pro users */
  children?: ReactNode;
  /** Additional styling */
  className?: string;
  /** Compact variant */
  variant?: 'default' | 'compact' | 'inline';
}

export function LockedSection({
  title,
  icon: Icon,
  previewContent,
  lockedContentCount,
  upgradeCTA = 'Reveal full analysis',
  isLocked,
  children,
  className,
  variant = 'default',
}: LockedSectionProps) {
  const [showModal, setShowModal] = useState(false);

  // Pro user - show full content
  if (!isLocked) {
    return <>{children}</>;
  }

  // Inline variant - minimal footprint
  if (variant === 'inline') {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md',
            'text-xs text-muted-foreground hover:text-primary',
            'bg-muted/30 hover:bg-muted/50 border border-border/30',
            'transition-colors cursor-pointer group',
            className
          )}
        >
          <Lock className="h-3 w-3" />
          <span>{lockedContentCount} locked</span>
          <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
        <ProUpgradeModal open={showModal} onOpenChange={setShowModal} />
      </>
    );
  }

  // Compact variant - smaller card
  if (variant === 'compact') {
    return (
      <>
        <div
          className={cn(
            'relative rounded-md border border-border/30 bg-muted/10 p-2 cursor-pointer group',
            className
          )}
          onClick={() => setShowModal(true)}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              {Icon && <Icon className="h-3 w-3 text-muted-foreground shrink-0" />}
              <span className="text-xs font-medium truncate">{title}</span>
              <Badge variant="secondary" className="text-[8px] px-1 py-0 h-3.5 shrink-0">
                {lockedContentCount}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground group-hover:text-primary transition-colors">
              <Lock className="h-2.5 w-2.5" />
              <span className="hidden sm:inline">Pro</span>
            </div>
          </div>

          {/* Blurred preview */}
          {previewContent && (
            <div className="mt-1.5 blur-[3px] select-none pointer-events-none opacity-50 max-h-8 overflow-hidden">
              {previewContent}
            </div>
          )}
        </div>
        <ProUpgradeModal open={showModal} onOpenChange={setShowModal} />
      </>
    );
  }

  // Default variant - full card
  return (
    <>
      <Card
        className={cn(
          'overflow-hidden cursor-pointer group border-border/30',
          'hover:border-primary/20 transition-colors',
          className
        )}
        onClick={() => setShowModal(true)}
      >
        {/* Header */}
        <CardHeader className="py-2.5 px-3 border-b border-border/20 bg-muted/20">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
              <span className="text-sm font-medium">{title}</span>
              <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
                {lockedContentCount} hidden
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground group-hover:text-primary transition-colors">
              <Lock className="h-3 w-3" />
              <span>Unlock with Pro</span>
            </div>
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="p-3 relative">
          {/* Preview content (blurred) */}
          {previewContent ? (
            <div className="blur-[4px] select-none pointer-events-none opacity-60">
              {previewContent}
            </div>
          ) : (
            <div className="h-12 bg-gradient-to-b from-muted/30 to-transparent rounded blur-sm" />
          )}

          {/* Overlay with CTA */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent flex items-end justify-center pb-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-primary gap-1.5"
            >
              <Sparkles className="h-3 w-3" />
              {upgradeCTA}
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
      <ProUpgradeModal open={showModal} onOpenChange={setShowModal} />
    </>
  );
}

/**
 * LockedBadge - Inline indicator for locked content
 */
interface LockedBadgeProps {
  count?: number;
  label?: string;
  onClick?: () => void;
  className?: string;
}

export function LockedBadge({ 
  count, 
  label = 'Pro', 
  onClick,
  className 
}: LockedBadgeProps) {
  const [showModal, setShowModal] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={cn(
          'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full',
          'bg-muted/50 border border-border/40',
          'text-[9px] text-muted-foreground hover:text-primary hover:border-primary/30',
          'transition-colors',
          className
        )}
      >
        <Lock className="h-2 w-2" />
        {count !== undefined ? `+${count}` : label}
      </button>
      {!onClick && <ProUpgradeModal open={showModal} onOpenChange={setShowModal} />}
    </>
  );
}

/**
 * BlurredText - Wraps text with blur effect for Free users
 */
interface BlurredTextProps {
  text: string;
  isBlurred: boolean;
  className?: string;
}

export function BlurredText({ text, isBlurred, className }: BlurredTextProps) {
  if (!isBlurred) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={cn('blur-[3px] select-none', className)}>
      {text}
    </span>
  );
}
