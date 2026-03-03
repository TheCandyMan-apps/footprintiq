import { useRef, useState, useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface LazySectionProps {
  children: ReactNode;
  /** Placeholder shown before the section scrolls into view */
  fallback?: ReactNode;
  /** Root margin for IntersectionObserver (default: 100px lookahead) */
  rootMargin?: string;
  /** Extra class names on the wrapper */
  className?: string;
}

/**
 * Defers rendering of children until the section scrolls near the viewport.
 * Applies a subtle fade-in on mount to avoid jarring pop-in.
 */
export function LazySection({
  children,
  fallback = null,
  rootMargin = '100px',
  className,
}: LazySectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} className={cn(className)}>
      {visible ? (
        <div className="animate-fade-in" style={{ animationDuration: '180ms' }}>
          {children}
        </div>
      ) : (
        fallback
      )}
    </div>
  );
}
