import { ReactNode, useState, useEffect, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileCollapsibleProps {
  /** Unique key for sessionStorage persistence */
  storageKey: string;
  /** Section title shown in the toggle header */
  title: string;
  /** Optional icon rendered before the title */
  icon?: ReactNode;
  /** Optional badge rendered after the title */
  badge?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Default state on first visit (default: true = expanded) */
  defaultOpen?: boolean;
}

/**
 * Mobile-only collapsible wrapper.
 * On desktop (md+), the section renders normally without the toggle.
 * Collapse state is persisted per browser session via sessionStorage.
 */
export function MobileCollapsible({
  storageKey,
  title,
  icon,
  badge,
  children,
  className,
  defaultOpen = true,
}: MobileCollapsibleProps) {
  const isMobile = useIsMobile();
  const fullKey = `mc_${storageKey}`;

  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === 'undefined') return defaultOpen;
    const stored = sessionStorage.getItem(fullKey);
    return stored !== null ? stored === '1' : defaultOpen;
  });

  const toggle = useCallback(() => {
    setIsOpen(prev => {
      const next = !prev;
      sessionStorage.setItem(fullKey, next ? '1' : '0');
      return next;
    });
  }, [fullKey]);

  // On desktop, always render children directly
  if (!isMobile) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={toggle}
        className="w-full flex items-center justify-between gap-2 py-2 px-1 -mx-1 rounded-md active:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          {icon}
          <span className="text-sm font-semibold text-foreground truncate">{title}</span>
          {badge}
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-250 ease-in-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden pt-2">
          {children}
        </div>
      </div>
    </div>
  );
}
