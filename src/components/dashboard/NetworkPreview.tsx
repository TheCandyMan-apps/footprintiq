import { GlassCard } from './GlassCard';
import { Network } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface NetworkPreviewProps {
  nodeCount?: number;
  onClick?: () => void;
}

export function NetworkPreview({ nodeCount = 12, onClick }: NetworkPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Simple network visualization
    const nodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
    }));

    let animationFrame: number;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Update positions
      nodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;
      });

      // Draw connections
      ctx.strokeStyle = 'rgba(147, 51, 234, 0.2)';
      ctx.lineWidth = 1;
      nodes.forEach((node, i) => {
        nodes.slice(i + 1).forEach(otherNode => {
          const dx = node.x - otherNode.x;
          const dy = node.y - otherNode.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(otherNode.x, otherNode.y);
            ctx.stroke();
          }
        });
      });

      // Draw nodes
      nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(147, 51, 234, 0.8)';
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(147, 51, 234, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      animationFrame = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationFrame);
  }, [nodeCount]);

  return (
    <GlassCard
      intensity="medium"
      glowColor="purple"
      disableHover={!onClick}
      className="p-6 cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Network className="w-5 h-5 text-primary" />
          Network Graph
        </h3>
      </div>
      <div className="relative h-48 rounded-lg bg-background/20 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={400}
          height={192}
          className="w-full h-full"
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/60 backdrop-blur-sm">
          <span className="text-sm font-medium">Click to expand</span>
        </div>
      </div>
    </GlassCard>
  );
}
