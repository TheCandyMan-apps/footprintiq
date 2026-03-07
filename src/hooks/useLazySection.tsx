import { useEffect, useRef, useState, ReactNode } from 'react';

/**
 * Only mounts children when the placeholder scrolls into view.
 * Keeps the component mounted once revealed (no re-unmounting).
 * Uses a generous rootMargin so content loads before the user reaches it.
 */
export function LazySection({
  children,
  fallback,
  className,
}: {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <div ref={ref} className={className}>
      {visible ? children : (fallback ?? <div className="min-h-[200px]" />)}
    </div>
  );
}
