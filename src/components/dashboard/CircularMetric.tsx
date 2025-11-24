import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface CircularMetricProps {
  value: number;
  max?: number;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  gradient?: boolean;
  className?: string;
}

export function CircularMetric({
  value,
  max = 10,
  label,
  size = 'md',
  gradient = true,
  className,
}: CircularMetricProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  
  const sizeMap = {
    sm: { dimension: 80, stroke: 6, fontSize: 'text-xl' },
    md: { dimension: 120, stroke: 8, fontSize: 'text-3xl' },
    lg: { dimension: 160, stroke: 10, fontSize: 'text-4xl' },
  };

  const { dimension, stroke, fontSize } = sizeMap[size];
  const radius = (dimension - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  // Ensure minimum 20% visibility for small values
  const percentage = Math.max(20, (animatedValue / max) * 100);
  const offset = circumference - (percentage / 100) * circumference;
  
  // Sanitize label for valid SVG ID
  const sanitizedLabel = label.replace(/\s+/g, '-').toLowerCase();

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    const duration = 1500; // 1.5 seconds
    
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easedProgress = easeOutCubic(progress);
      setAnimatedValue(easedProgress * value);
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    const timer = setTimeout(() => {
      animationFrame = requestAnimationFrame(animate);
    }, 100);
    
    return () => {
      clearTimeout(timer);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [value]);

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className="relative" style={{ width: dimension, height: dimension }}>
        {/* Background circle */}
        <svg
          className="transform -rotate-90"
          width={dimension}
          height={dimension}
        >
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            stroke="hsl(var(--border))"
            strokeWidth={stroke}
            fill="none"
            opacity="0.2"
          />
          {gradient ? (
            <>
              <defs>
                <linearGradient id={`gradient-${sanitizedLabel}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(280 90% 60%)" />
                  <stop offset="50%" stopColor="hsl(320 90% 60%)" />
                  <stop offset="100%" stopColor="hsl(263 90% 65%)" />
                </linearGradient>
              </defs>
              <circle
                cx={dimension / 2}
                cy={dimension / 2}
                r={radius}
                stroke={`url(#gradient-${sanitizedLabel})`}
                strokeWidth={stroke + 2}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
                style={{
                  filter: 'drop-shadow(0 0 8px hsl(280 90% 60% / 0.6))',
                }}
              />
            </>
          ) : (
            <circle
              cx={dimension / 2}
              cy={dimension / 2}
              r={radius}
              stroke="hsl(var(--primary))"
              strokeWidth={stroke}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          )}
        </svg>
        {/* Center value */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("font-bold bg-gradient-to-br from-primary via-primary to-accent bg-clip-text text-transparent", fontSize)}>
            {animatedValue.toFixed(1)}
          </span>
        </div>
      </div>
      <span className="text-sm font-medium text-muted-foreground text-center">{label}</span>
    </div>
  );
}
