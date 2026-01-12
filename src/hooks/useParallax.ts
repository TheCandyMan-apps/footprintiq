import { useEffect, useState, RefObject, useRef, useCallback } from 'react';

interface ParallaxOptions {
  speed?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  enableOnMobile?: boolean;
}

export const useParallax = (
  ref: RefObject<HTMLElement>,
  options: ParallaxOptions = {}
) => {
  const {
    speed = 0.5,
    direction = 'up',
    enableOnMobile = false,
  } = options;

  const [offset, setOffset] = useState(0);
  const rafRef = useRef<number | null>(null);

  const handleScroll = useCallback(() => {
    // Cancel any pending animation frame
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }

    // Schedule the layout read for the next frame
    rafRef.current = requestAnimationFrame(() => {
      if (!ref.current) {
        rafRef.current = null;
        return;
      }

      const rect = ref.current.getBoundingClientRect();
      const scrollProgress = window.scrollY;
      const elementTop = rect.top + scrollProgress;
      const windowHeight = window.innerHeight;

      // Only calculate parallax when element is in viewport
      if (rect.top < windowHeight && rect.bottom > 0) {
        const parallaxOffset = (scrollProgress - elementTop + windowHeight) * speed;
        setOffset(parallaxOffset);
      }
      rafRef.current = null;
    });
  }, [ref, speed]);

  useEffect(() => {
    // Check if mobile and parallax is disabled on mobile
    const isMobile = window.innerWidth < 768;
    if (isMobile && !enableOnMobile) {
      return;
    }

    handleScroll(); // Calculate initial position
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [handleScroll, enableOnMobile]);

  // Convert offset to transform based on direction
  const getTransform = () => {
    switch (direction) {
      case 'up':
        return `translate3d(0, ${-offset}px, 0)`;
      case 'down':
        return `translate3d(0, ${offset}px, 0)`;
      case 'left':
        return `translate3d(${-offset}px, 0, 0)`;
      case 'right':
        return `translate3d(${offset}px, 0, 0)`;
      default:
        return `translate3d(0, ${-offset}px, 0)`;
    }
  };

  return {
    transform: getTransform(),
    offset,
  };
};

// Simple hook for scroll-based opacity changes
export const useScrollFade = (ref: RefObject<HTMLElement>) => {
  const [opacity, setOpacity] = useState(1);
  const rafRef = useRef<number | null>(null);

  const handleScroll = useCallback(() => {
    // Cancel any pending animation frame
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }

    // Schedule the layout read for the next frame
    rafRef.current = requestAnimationFrame(() => {
      if (!ref.current) {
        rafRef.current = null;
        return;
      }

      const rect = ref.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Fade out as element scrolls up
      const fadeStart = windowHeight * 0.2;
      const fadeEnd = 0;
      
      if (rect.top > fadeStart) {
        setOpacity(1);
      } else if (rect.top < fadeEnd) {
        setOpacity(0);
      } else {
        const fadeProgress = (rect.top - fadeEnd) / (fadeStart - fadeEnd);
        setOpacity(fadeProgress);
      }
      rafRef.current = null;
    });
  }, [ref]);

  useEffect(() => {
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [handleScroll]);

  return opacity;
};
