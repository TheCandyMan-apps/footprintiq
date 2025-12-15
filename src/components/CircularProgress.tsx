import { cn } from "@/lib/utils";

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showPercentage?: boolean;
}

export const CircularProgress = ({
  value,
  size = 120,
  strokeWidth = 8,
  className,
  showPercentage = true,
}: CircularProgressProps) => {
  // Clamp and round value to prevent wiggly animation from floating point changes
  const safeValue = Math.max(0, Math.min(100, Math.round(value || 0)));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (safeValue / 100) * circumference;
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-secondary/50"
          fill="none"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="stroke-primary transition-all duration-500 ease-out"
          fill="none"
          strokeLinecap="round"
          style={{
            filter: 'drop-shadow(0 0 8px hsl(var(--primary) / 0.5))',
          }}
        />
      </svg>
      
      {showPercentage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-primary">
            {safeValue}%
          </span>
          <span className="text-xs text-muted-foreground">Complete</span>
        </div>
      )}
    </div>
  );
};
