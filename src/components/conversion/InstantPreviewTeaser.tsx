/**
 * InstantPreviewTeaser — Animated "what you'll discover" block
 * shown below the scan form on mobile to reduce bounce by
 * giving users a taste of value before they submit.
 */
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Shield, AlertTriangle, Eye } from 'lucide-react';

const PREVIEW_ITEMS = [
  { icon: Globe, label: 'Social media profiles', count: '12+', delay: 0 },
  { icon: Eye, label: 'Data broker listings', count: '3', delay: 0.6 },
  { icon: AlertTriangle, label: 'Breach exposures', count: '5', delay: 1.2 },
  { icon: Shield, label: 'Risk assessment', count: '1', delay: 1.8 },
];

export function InstantPreviewTeaser() {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const timers = PREVIEW_ITEMS.map((_, i) =>
      setTimeout(() => setVisibleCount(i + 1), 800 + i * 700)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="mt-6 space-y-2">
      <p className="text-xs text-muted-foreground text-center font-medium uppercase tracking-wider">
        What you'll discover
      </p>
      <div className="grid grid-cols-2 gap-2">
        <AnimatePresence>
          {PREVIEW_ITEMS.slice(0, visibleCount).map(({ icon: Icon, label, count }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="flex items-center gap-2.5 p-3 rounded-lg bg-muted/30 border border-border/40"
            >
              <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{label}</p>
                <p className="text-[10px] text-muted-foreground">Avg. {count} found</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
