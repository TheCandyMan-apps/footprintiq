import { useScrollProgress } from "@/hooks/useScrollProgress";

export const ScrollProgressBar = () => {
  const scrollProgress = useScrollProgress();

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-border/30 backdrop-blur-sm">
      <div
        className="h-full bg-gradient-to-r from-primary via-accent to-primary transition-all duration-150 ease-out shadow-glow"
        style={{
          width: `${scrollProgress}%`,
          background: 'linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 50%, hsl(var(--primary)) 100%)',
        }}
      >
        {/* Animated shine effect */}
        <div
          className="h-full w-full opacity-50"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
            animation: 'shimmer 2s infinite',
          }}
        />
      </div>
    </div>
  );
};
