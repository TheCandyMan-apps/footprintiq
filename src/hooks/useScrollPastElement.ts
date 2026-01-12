import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook to detect when user has scrolled past a certain point
 * Uses requestAnimationFrame to prevent forced reflow
 * @param threshold - Number of pixels to scroll before returning true (default: 800)
 * @returns boolean indicating if user has scrolled past threshold
 */
export const useScrollPastElement = (threshold: number = 800) => {
  const [isPastThreshold, setIsPastThreshold] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastScrollY = useRef<number>(0);

  const handleScroll = useCallback(() => {
    // Cancel any pending animation frame
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }

    // Schedule the layout read for the next frame
    rafRef.current = requestAnimationFrame(() => {
      const scrollPosition = window.scrollY;
      
      // Only update state if threshold crossing changed
      if (scrollPosition > threshold !== lastScrollY.current > threshold) {
        setIsPastThreshold(scrollPosition > threshold);
      }
      lastScrollY.current = scrollPosition;
      rafRef.current = null;
    });
  }, [threshold]);

  useEffect(() => {
    // Check initial position using rAF
    rafRef.current = requestAnimationFrame(() => {
      const scrollPosition = window.scrollY;
      setIsPastThreshold(scrollPosition > threshold);
      lastScrollY.current = scrollPosition;
      rafRef.current = null;
    });

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [threshold, handleScroll]);

  return isPastThreshold;
};
