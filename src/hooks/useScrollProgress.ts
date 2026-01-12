import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook to track scroll progress as a percentage
 * Uses requestAnimationFrame to prevent forced reflow
 */
export const useScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const rafRef = useRef<number | null>(null);

  const calculateScrollProgress = useCallback(() => {
    // Cancel any pending animation frame
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }

    // Schedule the layout read for the next frame
    rafRef.current = requestAnimationFrame(() => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      
      // Calculate scroll percentage
      const scrollableHeight = documentHeight - windowHeight;
      const progress = scrollableHeight > 0 ? (scrollTop / scrollableHeight) * 100 : 0;
      
      setScrollProgress(Math.min(100, Math.max(0, progress)));
      rafRef.current = null;
    });
  }, []);

  useEffect(() => {
    // Initial calculation using rAF
    calculateScrollProgress();
    
    window.addEventListener('scroll', calculateScrollProgress, { passive: true });
    window.addEventListener('resize', calculateScrollProgress);

    return () => {
      window.removeEventListener('scroll', calculateScrollProgress);
      window.removeEventListener('resize', calculateScrollProgress);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [calculateScrollProgress]);

  return scrollProgress;
};
