import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Shield, TrendingUp, Database, Activity, Bot } from 'lucide-react';
import { useAdminAnalytics } from '@/hooks/useAdminAnalytics';

export function AdminAnalytics() {
  const { analytics, isLoading } = useAdminAnalytics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="h-20 animate-pulse bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Users',
      value: analytics?.totalUsers || 0,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Admins',
      value: analytics?.adminCount || 0,
      icon: Shield,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      title: 'Premium Users',
      value: analytics?.premiumUsers || 0,
      icon: TrendingUp,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Free Users',
      value: analytics?.freeUsers || 0,
      icon: Users,
      color: 'text-gray-500',
      bgColor: 'bg-gray-500/10',
    },
    {
      title: 'Recent Signups (30d)',
      value: analytics?.recentSignups || 0,
      icon: Activity,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Total Scans',
      value: analytics?.totalScans || 0,
      icon: Database,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">AI-referred scans</CardTitle>
          <div className="p-2 rounded-lg bg-accent/10">
            <Bot className="w-4 h-4 text-accent-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6">
            <div>
              <div className="text-2xl font-bold">{(analytics?.aiReferred7d ?? 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </div>
            <div>
              <div className="text-2xl font-bold">{(analytics?.aiReferred30d ?? 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground/50 mt-2">chatgpt.com · openai.com · bing.com</p>
        </CardContent>
      </Card>
    </div>
  );
}
