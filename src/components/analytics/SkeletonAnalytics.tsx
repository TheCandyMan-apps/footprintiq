import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const SkeletonMetricCard = ({ delay = 0 }: { delay?: number }) => (
  <Card className="bg-gradient-card" style={{ animationDelay: `${delay}ms` }}>
    <CardContent className="pt-6">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
        <div className="flex items-center justify-between relative z-10">
          <div className="space-y-2 flex-1">
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            <div className="h-8 w-16 bg-muted rounded animate-pulse" />
          </div>
          <div className="w-8 h-8 bg-muted rounded animate-pulse" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const SkeletonBarChart = () => (
  <Card className="bg-gradient-card">
    <CardHeader>
      <div className="h-5 w-48 bg-muted rounded animate-pulse" />
    </CardHeader>
    <CardContent>
      <div className="relative overflow-hidden h-[300px]">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
        <div className="relative z-10 h-full flex items-end justify-around gap-4 px-8">
          {[60, 80, 45, 90, 35].map((height, i) => (
            <div
              key={i}
              className="flex-1 bg-muted rounded-t-lg animate-pulse"
              style={{ 
                height: `${height}%`,
                animationDelay: `${i * 100}ms`
              }}
            />
          ))}
        </div>
        {/* X-axis line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-border" />
      </div>
    </CardContent>
  </Card>
);

const SkeletonPieChart = () => (
  <Card className="bg-gradient-card">
    <CardHeader>
      <div className="h-5 w-40 bg-muted rounded animate-pulse" />
    </CardHeader>
    <CardContent>
      <div className="relative overflow-hidden h-[300px] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
        <div className="relative z-10 w-48 h-48">
          {/* Outer circle */}
          <div className="absolute inset-0 rounded-full border-8 border-muted animate-pulse" />
          {/* Inner segments - creating visual pie slices */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div className="absolute w-full h-full bg-muted/50" style={{ clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 50%)' }} />
            <div className="absolute w-full h-full bg-muted/40" style={{ clipPath: 'polygon(50% 50%, 100% 50%, 100% 100%)' }} />
            <div className="absolute w-full h-full bg-muted/30" style={{ clipPath: 'polygon(50% 50%, 100% 100%, 50% 100%)' }} />
            <div className="absolute w-full h-full bg-muted/20" style={{ clipPath: 'polygon(50% 50%, 50% 100%, 0% 100%, 0% 0%, 50% 0%)' }} />
          </div>
          {/* Center circle */}
          <div className="absolute inset-[25%] rounded-full bg-card" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const SkeletonSeverityBreakdown = () => (
  <Card className="bg-gradient-card">
    <CardHeader>
      <div className="h-5 w-36 bg-muted rounded animate-pulse" />
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2 mb-4 relative z-10" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-muted animate-pulse" />
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              </div>
              <div className="h-4 w-8 bg-muted rounded animate-pulse" />
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="h-2 rounded-full bg-muted animate-pulse"
                style={{ width: `${Math.random() * 60 + 20}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const SkeletonLineChart = () => (
  <Card className="bg-gradient-card">
    <CardHeader>
      <div className="h-5 w-56 bg-muted rounded mb-2 animate-pulse" />
      <div className="h-3 w-48 bg-muted rounded animate-pulse" />
    </CardHeader>
    <CardContent>
      <div className="relative overflow-hidden h-[400px]">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
        <div className="relative z-10 h-full flex flex-col">
          {/* Grid lines */}
          <div className="flex-1 flex flex-col justify-between">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-px bg-border/30" />
            ))}
          </div>
          {/* Animated line paths */}
          <div className="absolute inset-0 p-4">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Path 1 */}
              <path
                d="M 0 80 L 20 60 L 40 70 L 60 40 L 80 50 L 100 30"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="2"
                className="animate-pulse"
              />
              {/* Path 2 */}
              <path
                d="M 0 70 L 20 75 L 40 65 L 60 55 L 80 60 L 100 45"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="2"
                className="animate-pulse"
                style={{ animationDelay: '300ms' }}
              />
            </svg>
          </div>
          {/* X-axis labels placeholder */}
          <div className="flex justify-between px-4 pt-2">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-3 w-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const SkeletonThreatAnalytics = () => {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Threat Analytics
            </CardTitle>
            <CardDescription>
              Security insights and trends from your scans
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="opacity-50">7 Days</Badge>
            <Badge variant="outline" className="opacity-50">30 Days</Badge>
            <Badge variant="outline" className="opacity-50">90 Days</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" disabled>Overview</TabsTrigger>
            <TabsTrigger value="severity" disabled>Severity</TabsTrigger>
            <TabsTrigger value="trends" disabled>Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <SkeletonMetricCard delay={0} />
              <SkeletonMetricCard delay={100} />
              <SkeletonMetricCard delay={200} />
              <SkeletonMetricCard delay={300} />
            </div>

            {/* Bar Chart Skeleton */}
            <SkeletonBarChart />
          </TabsContent>

          <TabsContent value="severity" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SkeletonPieChart />
              <SkeletonSeverityBreakdown />
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <SkeletonLineChart />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
