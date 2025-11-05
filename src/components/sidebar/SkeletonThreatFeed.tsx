import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Shield } from "lucide-react";

const SkeletonAlertItem = ({ delay = 0 }: { delay?: number }) => (
  <div
    className="relative p-3 rounded-lg border border-border/50 bg-card/50 overflow-hidden"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
    <div className="relative z-10 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-muted animate-pulse" />
          <div className="h-5 w-16 rounded-full bg-muted animate-pulse" />
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-muted animate-pulse" />
          <div className="h-3 w-16 rounded bg-muted animate-pulse" />
        </div>
      </div>
      
      <div className="space-y-1">
        <div className="h-4 w-full bg-muted rounded animate-pulse" />
        <div className="h-3 w-3/4 bg-muted rounded animate-pulse" />
      </div>
    </div>
  </div>
);

const SkeletonAlertItemCollapsed = ({ delay = 0 }: { delay?: number }) => (
  <div
    className="relative p-3 rounded-lg border border-border/50 bg-card/50 overflow-hidden"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
    <div className="flex justify-center">
      <div className="w-5 h-5 rounded bg-muted animate-pulse" />
    </div>
  </div>
);

const SkeletonActivityItem = ({ delay = 0 }: { delay?: number }) => (
  <div
    className="relative p-2 rounded-lg border border-border/30 bg-card/30 overflow-hidden"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
    <div className="relative z-10 space-y-2">
      <div className="flex items-center justify-between">
        <div className="h-5 w-16 rounded-full bg-muted animate-pulse" />
        <div className="h-5 w-14 rounded-full bg-muted animate-pulse" />
      </div>
      <div className="h-3 w-32 bg-muted rounded animate-pulse" />
      <div className="h-3 w-24 bg-muted rounded animate-pulse" />
    </div>
  </div>
);

interface SkeletonThreatFeedContentProps {
  isOpen: boolean;
}

export const SkeletonThreatFeedContent = ({ isOpen }: SkeletonThreatFeedContentProps) => {
  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-muted animate-pulse" />
          {isOpen && <span className="text-muted-foreground">Recent Alerts</span>}
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="space-y-2 p-2">
            {isOpen ? (
              <>
                <SkeletonAlertItem delay={0} />
                <SkeletonAlertItem delay={100} />
                <SkeletonAlertItem delay={200} />
              </>
            ) : (
              <>
                <SkeletonAlertItemCollapsed delay={0} />
                <SkeletonAlertItemCollapsed delay={100} />
                <SkeletonAlertItemCollapsed delay={200} />
              </>
            )}
          </div>
        </SidebarGroupContent>
      </SidebarGroup>

      {isOpen && (
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel>
            <span className="text-muted-foreground">Recent Activity</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-2 p-2">
              <SkeletonActivityItem delay={0} />
              <SkeletonActivityItem delay={100} />
              <SkeletonActivityItem delay={200} />
              <SkeletonActivityItem delay={300} />
              <SkeletonActivityItem delay={400} />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      )}
    </>
  );
};

// Empty state skeleton when no data
export const SkeletonEmptyState = () => (
  <div className="text-center py-8 text-muted-foreground text-sm">
    <div className="relative inline-block">
      <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl animate-pulse" />
      <Shield className="w-8 h-8 mx-auto mb-2 opacity-30 relative z-10 animate-pulse" />
    </div>
    <div className="space-y-2 mt-2">
      <div className="h-4 w-32 bg-muted rounded mx-auto animate-pulse" />
      <div className="h-3 w-24 bg-muted rounded mx-auto animate-pulse" />
    </div>
  </div>
);
