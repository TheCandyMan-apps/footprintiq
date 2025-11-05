import { useState, useEffect } from 'react';

/**
 * Hook to detect when user has scrolled past a certain point
 * @param threshold - Number of pixels to scroll before returning true (default: 800)
 * @returns boolean indicating if user has scrolled past threshold
 */
export const useScrollPastElement = (threshold: number = 800) => {
  const [isPastThreshold, setIsPastThreshold] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsPastThreshold(scrollPosition > threshold);
    };

    handleScroll(); // Check initial position
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold]);

  return isPastThreshold;
};
