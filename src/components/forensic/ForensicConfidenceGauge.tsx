import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface ForensicConfidenceGaugeProps {
  score: number;
  size?: number;
  className?: string;
}

export function ForensicConfidenceGauge({ 
  score, 
  size = 160,
  className 
}: ForensicConfidenceGaugeProps) {
  const normalizedScore = Math.max(0, Math.min(100, score));
  
  const { color, label } = useMemo(() => {
    if (normalizedScore >= 71) {
      return { color: 'hsl(142, 76%, 36%)', label: 'High Reliability' };
    } else if (normalizedScore >= 51) {
      return { color: 'hsl(48, 96%, 53%)', label: 'Moderate Reliability' };
    } else if (normalizedScore >= 31) {
      return { color: 'hsl(25, 95%, 53%)', label: 'Low Reliability' };
    } else {
      return { color: 'hsl(0, 84%, 60%)', label: 'Unreliable' };
    }
  }, [normalizedScore]);

  // SVG arc calculations
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (normalizedScore / 100) * circumference;
  const dashOffset = circumference - progress;

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background circle */}
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/20"
          />
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 8px ${color}40)`,
            }}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span 
            className="text-4xl font-bold tabular-nums"
            style={{ color }}
          >
            {normalizedScore}%
          </span>
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            Confidence
          </span>
        </div>
      </div>
      
      {/* Label below gauge */}
      <span 
        className="text-sm font-medium px-3 py-1 rounded-full"
        style={{ 
          backgroundColor: `${color}15`,
          color,
        }}
      >
        {label}
      </span>
    </div>
  );
}
