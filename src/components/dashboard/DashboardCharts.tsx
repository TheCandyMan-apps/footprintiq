import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load recharts to reduce initial bundle size
const LazyBarChart = lazy(() => 
  import('recharts').then(module => ({ default: module.BarChart }))
);
const LazyBar = lazy(() => 
  import('recharts').then(module => ({ default: module.Bar }))
);
const LazyResponsiveContainer = lazy(() => 
  import('recharts').then(module => ({ default: module.ResponsiveContainer }))
);
const LazyLineChart = lazy(() => 
  import('recharts').then(module => ({ default: module.LineChart }))
);
const LazyLine = lazy(() => 
  import('recharts').then(module => ({ default: module.Line }))
);
const LazyXAxis = lazy(() => 
  import('recharts').then(module => ({ default: module.XAxis }))
);
const LazyYAxis = lazy(() => 
  import('recharts').then(module => ({ default: module.YAxis }))
);

interface ChartFallbackProps {
  height?: number;
}

const ChartFallback = ({ height = 80 }: ChartFallbackProps) => (
  <Skeleton className="w-full" style={{ height }} />
);

interface DashboardBarChartProps {
  data: any[];
  height?: number;
  dataKey: string;
  fill?: string;
}

export const DashboardBarChart = ({ 
  data, 
  height = 80, 
  dataKey,
  fill = "hsl(var(--primary))"
}: DashboardBarChartProps) => (
  <Suspense fallback={<ChartFallback height={height} />}>
    <LazyResponsiveContainer width="100%" height={height}>
      <LazyBarChart data={data}>
        <LazyBar dataKey={dataKey} fill={fill} radius={[4, 4, 0, 0]} />
      </LazyBarChart>
    </LazyResponsiveContainer>
  </Suspense>
);

interface DashboardLineChartProps {
  data: any[];
  height?: number;
  dataKey: string;
  stroke?: string;
  showAxes?: boolean;
}

export const DashboardLineChart = ({ 
  data, 
  height = 80, 
  dataKey,
  stroke = "hsl(var(--primary))",
  showAxes = false
}: DashboardLineChartProps) => (
  <Suspense fallback={<ChartFallback height={height} />}>
    <LazyResponsiveContainer width="100%" height={height}>
      <LazyLineChart data={data}>
        {showAxes && (
          <>
            <LazyXAxis dataKey="name" hide />
            <LazyYAxis hide />
          </>
        )}
        <LazyLine 
          type="monotone" 
          dataKey={dataKey} 
          stroke={stroke} 
          strokeWidth={2}
          dot={false}
        />
      </LazyLineChart>
    </LazyResponsiveContainer>
  </Suspense>
);
