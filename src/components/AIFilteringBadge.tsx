import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface AIFilteringBadgeProps {
  removedCount: number;
  confidenceImprovement: number;
  provider: string;
}

export const AIFilteringBadge = ({ removedCount, confidenceImprovement, provider }: AIFilteringBadgeProps) => {
  if (removedCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20"
    >
      <Sparkles className="w-5 h-5 text-primary animate-pulse" />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="default" className="text-xs bg-primary">
            AI Filtered
          </Badge>
          <span className="text-xs text-muted-foreground">
            via {provider === 'grok' ? 'Grok' : 'OpenAI'}
          </span>
        </div>
        <p className="text-sm text-foreground">
          <span className="font-semibold">{removedCount}</span> false positives removed
          {confidenceImprovement > 0 && (
            <span className="ml-2 inline-flex items-center gap-1 text-accent">
              <TrendingUp className="w-3 h-3" />
              +{confidenceImprovement.toFixed(1)}% confidence
            </span>
          )}
        </p>
      </div>
    </motion.div>
  );
};
