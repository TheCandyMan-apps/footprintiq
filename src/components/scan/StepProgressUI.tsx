import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface StepStatus {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed';
}

interface StepProgressUIProps {
  scanId: string;
  username: string;
  currentStep: number;
  totalSteps: number;
  steps: StepStatus[];
  percentComplete: number;
  isComplete: boolean;
  isFailed: boolean;
}

export function StepProgressUI({
  username,
  currentStep,
  totalSteps,
  steps,
  percentComplete,
  isComplete,
  isFailed,
}: StepProgressUIProps) {
  const getStatusIcon = (status: StepStatus['status']) => {
    switch (status) {
      case 'completed':
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"
          >
            <Check className="w-3 h-3 text-primary-foreground" />
          </motion.div>
        );
      case 'active':
        return (
          <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
            <Loader2 className="w-3 h-3 text-primary animate-spin" />
          </div>
        );
      case 'pending':
      default:
        return (
          <div className="w-5 h-5 rounded-full border border-muted-foreground/30 flex items-center justify-center">
            <Circle className="w-2 h-2 text-muted-foreground/30" />
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {/* Header with circular progress */}
      <div className="flex items-center gap-4">
        {/* Circular progress indicator */}
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
            {/* Background circle */}
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              className="stroke-secondary"
              strokeWidth="3"
            />
            {/* Progress circle */}
            <motion.circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              className="stroke-primary"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${percentComplete} 100`}
              initial={{ strokeDasharray: '0 100' }}
              animate={{ strokeDasharray: `${percentComplete} 100` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </svg>
          {/* Center percentage */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-semibold text-foreground">
              {percentComplete}%
            </span>
          </div>
        </div>

        {/* Status text */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground">Search progress</h3>
          <p className="text-sm text-muted-foreground">
            {isFailed ? 'Scan failed' : isComplete ? 'Complete!' : 'Running...'}
          </p>
        </div>
      </div>

      {/* Linear progress bar */}
      <Progress value={percentComplete} className="h-2" animated />

      {/* Step list */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'flex gap-3 p-3 rounded-lg transition-colors duration-200',
                step.status === 'active' && 'bg-primary/5 border border-primary/20',
                step.status === 'completed' && 'bg-secondary/50',
                step.status === 'pending' && 'opacity-50'
              )}
            >
              {/* Status icon */}
              <div className="flex-shrink-0 mt-0.5">
                {getStatusIcon(step.status)}
              </div>

              {/* Step content */}
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    'text-sm font-medium',
                    step.status === 'completed' && 'text-muted-foreground',
                    step.status === 'active' && 'text-foreground',
                    step.status === 'pending' && 'text-muted-foreground'
                  )}
                >
                  {step.title}
                </p>
                <p
                  className={cn(
                    'text-xs mt-0.5',
                    step.status === 'active' && 'text-muted-foreground',
                    step.status !== 'active' && 'text-muted-foreground/60'
                  )}
                >
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Results preview */}
      <div className="pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground mb-2">Target</p>
        <div className="bg-secondary/50 rounded-lg px-4 py-3">
          <p className="font-mono text-sm text-foreground">{username}</p>
        </div>
      </div>

      {/* Status message */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-sm text-primary font-medium"
        >
          Analysis complete! Preparing results...
        </motion.div>
      )}

      {isFailed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-sm text-destructive font-medium"
        >
          Scan encountered an error. Please try again.
        </motion.div>
      )}
    </div>
  );
}
