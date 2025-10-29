import { AlertCircle, CheckCircle, Info, LightbulbIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlogCalloutProps {
  type?: "info" | "warning" | "tip" | "success";
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const calloutConfig = {
  info: {
    icon: Info,
    className: "bg-blue-500/5 border-blue-500/20 text-blue-700 dark:text-blue-300",
    iconClassName: "text-blue-500",
  },
  warning: {
    icon: AlertCircle,
    className: "bg-amber-500/5 border-amber-500/20 text-amber-700 dark:text-amber-300",
    iconClassName: "text-amber-500",
  },
  tip: {
    icon: LightbulbIcon,
    className: "bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-300",
    iconClassName: "text-emerald-500",
  },
  success: {
    icon: CheckCircle,
    className: "bg-green-500/5 border-green-500/20 text-green-700 dark:text-green-300",
    iconClassName: "text-green-500",
  },
};

export const BlogCallout = ({ type = "info", title, children, className }: BlogCalloutProps) => {
  const config = calloutConfig[type];
  const Icon = config.icon;

  return (
    <div className={cn(
      "my-6 rounded-2xl border-2 p-6 transition-all",
      config.className,
      className
    )}>
      <div className="flex gap-4">
        <Icon className={cn("w-6 h-6 flex-shrink-0 mt-0.5", config.iconClassName)} />
        <div className="flex-1">
          {title && (
            <h4 className="font-bold text-lg mb-2">{title}</h4>
          )}
          <div className="text-sm leading-relaxed [&>ul]:mt-2 [&>ul]:space-y-1 [&>ol]:mt-2 [&>ol]:space-y-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
