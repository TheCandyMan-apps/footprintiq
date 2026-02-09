import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrialConversionMetrics } from './TrialConversionMetrics';
import { EmailMetricsDashboard } from './EmailMetricsDashboard';
import { AbandonedCheckoutMetrics } from './AbandonedCheckoutMetrics';
import { useTrialEmailAnalytics } from '@/hooks/useTrialEmailAnalytics';
import { useAbandonedCheckouts } from '@/hooks/useAbandonedCheckouts';
import { TrendingUp, Mail, Calendar, ShoppingCart } from 'lucide-react';

type DateRangeOption = '7d' | '30d' | '90d' | 'all';

export function GrowthAnalyticsTabs() {
  const [dateRangeOption, setDateRangeOption] = useState<DateRangeOption>('all');

  const getDateRange = (option: DateRangeOption): { start: Date; end: Date } | null => {
    const end = new Date();
    const start = new Date();

    switch (option) {
      case '7d':
        start.setDate(start.getDate() - 7);
        return { start, end };
      case '30d':
        start.setDate(start.getDate() - 30);
        return { start, end };
      case '90d':
        start.setDate(start.getDate() - 90);
        return { start, end };
      case 'all':
        return null;
      default:
        start.setDate(start.getDate() - 30);
        return { start, end };
    }
  };

  const dateRange = getDateRange(dateRangeOption);
  const { data, isLoading, isPlaceholderData } = useTrialEmailAnalytics(dateRange);
  const { data: checkoutData, isLoading: checkoutLoading, isPlaceholderData: checkoutPlaceholder } = useAbandonedCheckouts(dateRange);

  return (
    <div className="space-y-6">
      {/* Header with Date Range Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Growth Analytics</h2>
        </div>
        <Select value={dateRangeOption} onValueChange={(v) => setDateRangeOption(v as DateRangeOption)}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="trial-funnel" className="space-y-6">
        <TabsList>
          <TabsTrigger value="trial-funnel" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trial Funnel
          </TabsTrigger>
          <TabsTrigger value="abandoned-checkouts" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Checkouts
          </TabsTrigger>
          <TabsTrigger value="email-performance" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trial-funnel">
          <TrialConversionMetrics 
            metrics={data?.trialMetrics} 
            isLoading={isLoading && !isPlaceholderData} 
          />
        </TabsContent>

        <TabsContent value="abandoned-checkouts">
          <AbandonedCheckoutMetrics 
            metrics={checkoutData} 
            isLoading={checkoutLoading && !checkoutPlaceholder} 
          />
        </TabsContent>

        <TabsContent value="email-performance">
          <EmailMetricsDashboard 
            metrics={data?.emailMetrics} 
            isLoading={isLoading && !isPlaceholderData} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
