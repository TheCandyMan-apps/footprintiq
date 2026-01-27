import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Sparkles, Users, Network, Shield, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProUnlockTransitionProps {
  isVisible: boolean;
  onDismiss: () => void;
}

const UNLOCK_ITEMS = [
  { icon: Users, label: 'All profiles revealed', delay: 0.2 },
  { icon: Network, label: 'Connections labeled', delay: 0.4 },
  { icon: Shield, label: 'LENS verification enabled', delay: 0.6 },
  { icon: Brain, label: 'Confidence explanations unlocked', delay: 0.8 },
];

export function ProUnlockTransition({ isVisible, onDismiss }: ProUnlockTransitionProps) {
  const [showItems, setShowItems] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Start showing items after initial animation
      const itemsTimer = setTimeout(() => setShowItems(true), 300);
      // Auto-dismiss after 5 seconds
      const dismissTimer = setTimeout(() => onDismiss(), 5000);
      
      return () => {
        clearTimeout(itemsTimer);
        clearTimeout(dismissTimer);
      };
    } else {
      setShowItems(false);
    }
  }, [isVisible, onDismiss]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={cn(
            'fixed bottom-6 right-6 z-50',
            'w-[340px] rounded-xl border border-primary/20',
            'bg-background/95 backdrop-blur-md shadow-2xl',
            'overflow-hidden'
          )}
        >
          {/* Gradient accent bar */}
          <div className="h-1 bg-gradient-to-r from-primary via-primary/80 to-primary/60" />
          
          <div className="p-5">
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Pro unlocked</h3>
                <p className="text-sm text-muted-foreground">LENS verification is now available</p>
              </div>
            </motion.div>

            {/* Checklist */}
            <div className="space-y-2.5">
              {UNLOCK_ITEMS.map((item, idx) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={showItems ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ 
                    delay: item.delay, 
                    duration: 0.3,
                    ease: 'easeOut'
                  }}
                  className="flex items-center gap-3"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={showItems ? { scale: 1 } : { scale: 0 }}
                    transition={{ delay: item.delay + 0.1, type: 'spring', stiffness: 300 }}
                  >
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </motion.div>
                  <div className="flex items-center gap-2">
                    <item.icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{item.label}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Progress bar for auto-dismiss */}
            <motion.div 
              className="mt-4 h-0.5 bg-muted rounded-full overflow-hidden"
            >
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 5, ease: 'linear' }}
                className="h-full bg-primary/40"
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
