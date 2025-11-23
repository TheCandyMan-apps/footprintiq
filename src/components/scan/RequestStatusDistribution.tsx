import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HelpIcon } from '@/components/ui/help-icon';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, Clock, Loader2, XCircle } from 'lucide-react';

interface RequestStatusDistributionProps {
  scanId: string;
}

export function RequestStatusDistribution({ scanId }: RequestStatusDistributionProps) {
  const { data: statusCounts, isLoading } = useQuery({
    queryKey: ['removal-requests-status', scanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automated_removals')
        .select('status')
        .eq('source_id', scanId);

      if (error) throw error;

      // Count by status
      const counts = {
        pending: 0,
        in_progress: 0,
        completed: 0,
        failed: 0
      };

      data?.forEach((item) => {
        const status = item.status?.toLowerCase() || 'pending';
        if (status in counts) {
          counts[status as keyof typeof counts]++;
        }
      });

      return counts;
    },
    enabled: !!scanId
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalRequests = statusCounts
    ? Object.values(statusCounts).reduce((sum, count) => sum + count, 0)
    : 0;

  if (totalRequests === 0) {
    return null; // Don't show if no removal requests
  }

  const statusConfig = [
    {
      key: 'pending',
      label: 'Pending',
      icon: Clock,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
      borderColor: 'border-yellow-200 dark:border-yellow-800'
    },
    {
      key: 'in_progress',
      label: 'In Progress',
      icon: Loader2,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      borderColor: 'border-blue-200 dark:border-blue-800'
    },
    {
      key: 'completed',
      label: 'Completed',
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    {
      key: 'failed',
      label: 'Failed',
      icon: XCircle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-950/30',
      borderColor: 'border-red-200 dark:border-red-800'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            Request Status Distribution
            <HelpIcon helpKey="request_status" />
          </CardTitle>
          <Badge variant="secondary">{totalRequests} total</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {statusConfig.map((config) => {
            const count = statusCounts?.[config.key as keyof typeof statusCounts] || 0;
            const Icon = config.icon;
            const percentage = totalRequests > 0 ? Math.round((count / totalRequests) * 100) : 0;

            return (
              <div
                key={config.key}
                className={`flex items-center gap-3 p-4 rounded-lg border ${config.borderColor} ${config.bgColor} transition-all hover:scale-105`}
              >
                <Icon className={`h-5 w-5 ${config.color} ${config.key === 'in_progress' ? 'animate-spin' : ''}`} />
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{count}</span>
                    <span className="text-xs text-muted-foreground">{percentage}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{config.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
