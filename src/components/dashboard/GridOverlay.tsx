export function GridOverlay() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {/* Hexagon pattern SVG */}
      <svg className="w-full h-full opacity-[0.15]">
        <defs>
          <pattern
            id="hexagon-pattern"
            x="0"
            y="0"
            width="60"
            height="52"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M30 0 L45 13 L45 39 L30 52 L15 39 L15 13 Z"
              fill="none"
              stroke="hsl(280 70% 50%)"
              strokeWidth="0.5"
              opacity="0.6"
            />
          </pattern>
          <linearGradient id="grid-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(280 70% 50%)" stopOpacity="0.3" />
            <stop offset="50%" stopColor="hsl(320 70% 50%)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="hsl(263 70% 60%)" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexagon-pattern)" />
        <rect width="100%" height="100%" fill="url(#grid-gradient)" />
      </svg>
      
      {/* Additional subtle grid lines */}
      <div 
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `
            linear-gradient(90deg, hsl(280 70% 50% / 0.3) 1px, transparent 1px),
            linear-gradient(0deg, hsl(280 70% 50% / 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
    </div>
  );
}
