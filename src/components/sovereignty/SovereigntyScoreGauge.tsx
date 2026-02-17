import { motion } from 'framer-motion';

interface SovereigntyScoreGaugeProps {
  score: number;
  size?: number;
}

export function SovereigntyScoreGauge({ score, size = 160 }: SovereigntyScoreGaugeProps) {
  const radius = (size - 20) / 2;
  const circumference = Math.PI * radius; // half circle
  const progress = (score / 100) * circumference;

  const getColor = () => {
    if (score >= 70) return 'hsl(var(--success))';
    if (score >= 40) return 'hsl(var(--warning, 38 92% 50%))';
    return 'hsl(var(--destructive))';
  };

  const getLabel = () => {
    if (score >= 80) return 'Strong';
    if (score >= 60) return 'Moderate';
    if (score >= 40) return 'Developing';
    return 'At Risk';
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
        {/* Background arc */}
        <path
          d={`M 10 ${size / 2 + 10} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2 + 10}`}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <motion.path
          d={`M 10 ${size / 2 + 10} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2 + 10}`}
          fill="none"
          stroke={getColor()}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
        {/* Score text */}
        <text
          x={size / 2}
          y={size / 2 - 5}
          textAnchor="middle"
          className="fill-foreground text-3xl font-bold"
          style={{ fontSize: '2rem' }}
        >
          {score}
        </text>
        <text
          x={size / 2}
          y={size / 2 + 18}
          textAnchor="middle"
          className="fill-muted-foreground"
          style={{ fontSize: '0.75rem' }}
        >
          / 100
        </text>
      </svg>
      <span className="text-sm font-medium" style={{ color: getColor() }}>
        {getLabel()}
      </span>
    </div>
  );
}
