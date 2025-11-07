import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfidenceScoreBadgeProps {
  score: number;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ConfidenceScoreBadge({ 
  score, 
  showIcon = true, 
  size = "md",
  className 
}: ConfidenceScoreBadgeProps) {
  const getConfidenceLevel = () => {
    if (score >= 85) return { label: "Very High", variant: "default" as const, icon: Shield, color: "text-emerald-600" };
    if (score >= 70) return { label: "High", variant: "secondary" as const, icon: Shield, color: "text-green-600" };
    if (score >= 50) return { label: "Medium", variant: "outline" as const, icon: Info, color: "text-yellow-600" };
    if (score >= 30) return { label: "Low", variant: "outline" as const, icon: AlertTriangle, color: "text-orange-600" };
    return { label: "Very Low", variant: "destructive" as const, icon: AlertTriangle, color: "text-red-600" };
  };

  const level = getConfidenceLevel();
  const Icon = level.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5"
  };

  return (
    <Badge 
      variant={level.variant}
      className={cn(
        "flex items-center gap-1.5 font-medium",
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Icon className="w-3 h-3" />}
      <span>{score}%</span>
      <span className="text-muted-foreground">•</span>
      <span>{level.label}</span>
    </Badge>
  );
}
