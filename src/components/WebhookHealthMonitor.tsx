import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Activity, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  ExternalLink,
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface WebhookEvent {
  id: string;
  action: string;
  created_at: string;
  meta: {
    invoice_id?: string;
    subscription_id?: string;
    amount?: number;
    currency?: string;
    customer_email?: string;
    attempt_count?: number;
  };
}

/**
 * Webhook Health Monitor
 * 
 * Displays the health and status of Stripe webhook integration.
 * Shows recent webhook events and their processing status.
 */
export function WebhookHealthMonitor() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    successfulPayments: 0,
    failedPayments: 0,
    subscriptionEvents: 0,
  });

  useEffect(() => {
    loadWebhookHealth();
  }, []);

  const loadWebhookHealth = async () => {
    setLoading(true);
    try {
      // Fetch recent webhook-related audit logs
      const { data, error } = await supabase
        .from('audit_log')
        .select('*')
        .in('action', [
          'subscription.payment_succeeded',
          'subscription.payment_failed',
          'subscription.created',
          'subscription.updated',
          'subscription.cancelled',
        ])
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Map audit log data to WebhookEvent format
      const mappedEvents: WebhookEvent[] = (data || []).map(log => ({
        id: log.id,
        action: log.action,
        created_at: log.at,
        meta: typeof log.meta === 'object' && log.meta !== null ? log.meta as any : {},
      }));

      setEvents(mappedEvents);

      // Calculate stats
      const successful = mappedEvents.filter(e => e.action === 'subscription.payment_succeeded').length;
      const failed = mappedEvents.filter(e => e.action === 'subscription.payment_failed').length;
      const subscriptions = mappedEvents.filter(e => 
        e.action.includes('subscription.') && !e.action.includes('payment')
      ).length;

      setStats({
        totalEvents: mappedEvents.length,
        successfulPayments: successful,
        failedPayments: failed,
        subscriptionEvents: subscriptions,
      });
    } catch (error) {
      console.error('Error loading webhook health:', error);
      toast({
        title: 'Error',
        description: 'Failed to load webhook health data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (action: string) => {
    if (action.includes('succeeded')) return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (action.includes('failed')) return <XCircle className="h-4 w-4 text-destructive" />;
    if (action.includes('created')) return <Activity className="h-4 w-4 text-blue-500" />;
    if (action.includes('cancelled')) return <AlertCircle className="h-4 w-4 text-orange-500" />;
    return <Activity className="h-4 w-4 text-muted-foreground" />;
  };

  const formatAction = (action: string) => {
    return action
      .replace('subscription.', '')
      .replace('_', ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatCurrency = (amount?: number, currency?: string) => {
    if (!amount || !currency) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getHealthStatus = () => {
    const failureRate = stats.totalEvents > 0 
      ? (stats.failedPayments / (stats.successfulPayments + stats.failedPayments)) * 100 
      : 0;
    
    if (failureRate === 0) return { label: 'Healthy', color: 'bg-green-500', icon: CheckCircle2 };
    if (failureRate < 10) return { label: 'Warning', color: 'bg-yellow-500', icon: AlertTriangle };
    return { label: 'Critical', color: 'bg-red-500', icon: XCircle };
  };

  const health = getHealthStatus();
  const HealthIcon = health.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Webhook Health Monitor
            </CardTitle>
            <CardDescription>
              Real-time monitoring of Stripe webhook events
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadWebhookHealth}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Health Status */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${health.color}/20`}>
              <HealthIcon className={`h-5 w-5 ${health.color.replace('bg-', 'text-')}`} />
            </div>
            <div>
              <div className="font-medium">System Status</div>
              <div className="text-sm text-muted-foreground">Webhook processing health</div>
            </div>
          </div>
          <Badge className={health.color}>{health.label}</Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Activity className="h-4 w-4" />
              <span className="text-sm">Total Events</span>
            </div>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm">Successful</span>
            </div>
            <div className="text-2xl font-bold">{stats.successfulPayments}</div>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 text-destructive mb-1">
              <XCircle className="h-4 w-4" />
              <span className="text-sm">Failed</span>
            </div>
            <div className="text-2xl font-bold">{stats.failedPayments}</div>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Subscriptions</span>
            </div>
            <div className="text-2xl font-bold">{stats.subscriptionEvents}</div>
          </div>
        </div>

        {/* Recent Events */}
        <div>
          <h4 className="font-medium mb-3">Recent Webhook Events</h4>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
              Loading events...
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>No webhook events found</p>
              <p className="text-sm mt-1">Events will appear here after webhook activity</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1">
                    {getEventIcon(event.action)}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{formatAction(event.action)}</div>
                      <div className="text-sm text-muted-foreground">
                        {event.meta?.customer_email || 'Unknown customer'}
                      </div>
                      {event.meta?.amount && (
                        <div className="text-sm font-medium mt-1">
                          {formatCurrency(event.meta.amount, event.meta.currency)}
                        </div>
                      )}
                      {event.meta?.attempt_count && event.meta.attempt_count > 1 && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          Attempt {event.meta.attempt_count}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(event.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Setup Instructions */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            Webhook Configuration
          </h4>
          <p className="text-sm text-muted-foreground mb-3">
            Ensure webhooks are properly configured in your Stripe dashboard for real-time updates.
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://dashboard.stripe.com/webhooks', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Stripe Dashboard
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('/STRIPE_WEBHOOK_SETUP.md', '_blank')}
            >
              Setup Guide
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
