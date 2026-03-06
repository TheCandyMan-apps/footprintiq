/**
 * SocialProofToast — Shows periodic "Someone just scanned..." notifications
 * to create social proof and urgency.
 */
import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

const SCAN_MESSAGES = [
  { location: 'London, UK', timeAgo: '2 minutes ago' },
  { location: 'New York, US', timeAgo: '4 minutes ago' },
  { location: 'Toronto, CA', timeAgo: '1 minute ago' },
  { location: 'Sydney, AU', timeAgo: '3 minutes ago' },
  { location: 'Berlin, DE', timeAgo: '5 minutes ago' },
  { location: 'Mumbai, IN', timeAgo: '2 minutes ago' },
  { location: 'Los Angeles, US', timeAgo: '1 minute ago' },
  { location: 'Manchester, UK', timeAgo: '4 minutes ago' },
];

interface SocialProofToastProps {
  /** Delay before first toast (ms) */
  initialDelay?: number;
  /** Interval between toasts (ms) */
  interval?: number;
  /** Max number of toasts to show per session */
  maxToasts?: number;
}

export function SocialProofToast({
  initialDelay = 15000,
  interval = 45000,
  maxToasts = 3,
}: SocialProofToastProps) {
  const { toast } = useToast();
  const countRef = useRef(0);

  useEffect(() => {
    // Don't show if user dismissed before in this session
    if (sessionStorage.getItem('social_proof_dismissed')) return;

    const showToast = () => {
      if (countRef.current >= maxToasts) return;
      
      const msg = SCAN_MESSAGES[Math.floor(Math.random() * SCAN_MESSAGES.length)];
      countRef.current += 1;

      toast({
        title: '🔍 Someone just ran a scan',
        description: `A user in ${msg.location} scanned their digital footprint ${msg.timeAgo}.`,
        duration: 4000,
      });
    };

    const initialTimer = setTimeout(() => {
      showToast();
      const intervalTimer = setInterval(showToast, interval);
      // Store interval ID for cleanup
      (window as any).__socialProofInterval = intervalTimer;
    }, initialDelay);

    return () => {
      clearTimeout(initialTimer);
      if ((window as any).__socialProofInterval) {
        clearInterval((window as any).__socialProofInterval);
      }
    };
  }, [initialDelay, interval, maxToasts, toast]);

  return null;
}
