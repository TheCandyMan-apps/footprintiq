import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton for the Connections tab — mimics the graph toolbar + canvas + inspector layout.
 */
export function ConnectionsTabSkeleton() {
  return (
    <div className="space-y-2">
      {/* Toolbar: mode toggle + view controls */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-56 rounded" />
        <div className="flex-1" />
        <Skeleton className="h-7 w-24 rounded" />
        <Skeleton className="h-7 w-24 rounded" />
      </div>

      {/* Stats bar */}
      <div className="flex gap-2">
        <Skeleton className="h-5 w-20 rounded" />
        <Skeleton className="h-5 w-20 rounded" />
        <Skeleton className="h-5 w-24 rounded" />
      </div>

      {/* Graph canvas + inspector side panel */}
      <div className="flex gap-2">
        {/* Graph area */}
        <div className="flex-1 border border-border/20 rounded-lg bg-card overflow-hidden" style={{ height: '55vh' }}>
          {/* Simulated graph nodes */}
          <div className="relative w-full h-full">
            {[
              { top: '20%', left: '30%', w: 48 },
              { top: '35%', left: '55%', w: 40 },
              { top: '50%', left: '25%', w: 44 },
              { top: '40%', left: '70%', w: 36 },
              { top: '65%', left: '50%', w: 42 },
              { top: '25%', left: '75%', w: 38 },
            ].map((node, i) => (
              <Skeleton
                key={i}
                className="absolute rounded-full"
                style={{ top: node.top, left: node.left, width: node.w, height: node.w }}
              />
            ))}
            {/* Simulated edges */}
            {[
              { top: '30%', left: '35%', w: 120, rotate: 15 },
              { top: '45%', left: '40%', w: 100, rotate: -20 },
              { top: '38%', left: '58%', w: 80, rotate: 30 },
            ].map((edge, i) => (
              <Skeleton
                key={`e${i}`}
                className="absolute h-[2px]"
                style={{
                  top: edge.top,
                  left: edge.left,
                  width: edge.w,
                  transform: `rotate(${edge.rotate}deg)`,
                  transformOrigin: 'left center',
                }}
              />
            ))}
          </div>
        </div>

        {/* Inspector panel */}
        <div className="hidden md:block w-64 border border-border/20 rounded-lg bg-card p-3 space-y-3" style={{ height: '55vh' }}>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-10 rounded-full mx-auto" />
          <Skeleton className="h-4 w-24 mx-auto" />
          <Skeleton className="h-3 w-20 mx-auto" />
          <div className="space-y-2 pt-2 border-t border-border/15">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      </div>
    </div>
  );
}
