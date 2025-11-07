import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Calendar, Download, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { SettingsBreadcrumb } from '@/components/settings/SettingsBreadcrumb';
import { Separator } from '@/components/ui/separator';
import { useSubscription } from '@/hooks/useSubscription';

interface BillingHistoryItem {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  invoice_pdf?: string;
  description?: string;
}

interface UpcomingInvoice {
  amount: number;
  currency: string;
  period_start: number;
  period_end: number;
  next_payment_attempt: number;
}

export default function BillingSettings() {
  const [loading, setLoading] = useState(false);
  const { subscriptionTier, isPremium, refreshSubscription } = useSubscription();

  const { data: subscriptionData, refetch: refetchSubscription } = useQuery({
    queryKey: ['subscription-details'],
    queryFn: async () => {
      const { data } = await supabase.functions.invoke("billing/check-subscription");
      return data;
    },
  });

  const { data: billingHistory, isLoading: loadingHistory } = useQuery<BillingHistoryItem[]>({
    queryKey: ['billing-history'],
    queryFn: async () => {
      const { data } = await supabase.functions.invoke("billing/history");
      return data?.invoices || [];
    },
  });

  const { data: upcomingInvoice } = useQuery<UpcomingInvoice | null>({
    queryKey: ['upcoming-invoice'],
    queryFn: async () => {
      const { data } = await supabase.functions.invoke("billing/upcoming-invoice");
      return data?.upcoming || null;
    },
    enabled: isPremium,
  });

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('billing/checkout', {
        body: { plan: 'analyst' },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error('Failed to start upgrade process');
    } finally {
      setLoading(false);
    }
  };

  const handlePortal = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('billing/create-portal');

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Portal error:', error);
      toast.error('Failed to open billing portal');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <SettingsBreadcrumb currentPage="Billing" />
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Billing Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your subscription and billing details
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => {
              refreshSubscription();
              refetchSubscription();
            }}
          >
            Refresh
          </Button>
        </div>

        {/* Current Subscription & Next Payment */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold mb-1">Current Plan</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-3xl font-bold capitalize">{subscriptionTier}</span>
                  {isPremium && (
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  )}
                </div>
              </div>
              <Badge variant={isPremium ? "default" : "secondary"}>
                {isPremium ? "Active" : "Free"}
              </Badge>
            </div>

            {subscriptionData?.current_period_end && (
              <div className="bg-muted/50 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Calendar className="w-4 h-4" />
                  <span>Next Billing Date</span>
                </div>
                <p className="text-lg font-semibold">
                  {new Date(subscriptionData.current_period_end).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              {isPremium ? (
                <Button 
                  onClick={handlePortal}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CreditCard className="w-4 h-4" />
                  )}
                  Manage Subscription
                </Button>
              ) : (
                <Button 
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Upgrade to Analyst
                </Button>
              )}
            </div>
          </Card>

          {/* Next Payment Card */}
          {upcomingInvoice && (
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Next Payment</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Amount Due</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(upcomingInvoice.amount, upcomingInvoice.currency)}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Payment Date</p>
                  <p className="font-semibold">
                    {formatDate(upcomingInvoice.next_payment_attempt)}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Billing Period</p>
                  <p className="text-sm">
                    {formatDate(upcomingInvoice.period_start)} - {formatDate(upcomingInvoice.period_end)}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Billing History */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Billing History</h3>
          
          {loadingHistory ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : !billingHistory || billingHistory.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No billing history yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {billingHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      item.status === 'paid' 
                        ? 'bg-green-500/10 text-green-500' 
                        : 'bg-yellow-500/10 text-yellow-500'
                    }`}>
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold">
                        {item.description || 'Subscription Payment'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(item.created)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatCurrency(item.amount, item.currency)}
                      </p>
                      <p className={`text-sm capitalize ${
                        item.status === 'paid' ? 'text-green-500' : 'text-yellow-500'
                      }`}>
                        {item.status}
                      </p>
                    </div>
                    {item.invoice_pdf && (
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <a href={item.invoice_pdf} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Plan Features */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Current Plan Features</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {subscriptionTier === "free" ? (
              <>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">1 Scan per Month</p>
                    <p className="text-sm text-muted-foreground">Limited monthly scans</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Basic Detection</p>
                    <p className="text-sm text-muted-foreground">Essential data source detection</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Privacy Score</p>
                    <p className="text-sm text-muted-foreground">Basic privacy analysis</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Unlimited Scans</p>
                    <p className="text-sm text-muted-foreground">No restrictions on scans</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Advanced OSINT</p>
                    <p className="text-sm text-muted-foreground">100+ data sources</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">AI Detection</p>
                    <p className="text-sm text-muted-foreground">Catfish & fake profiles</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Auto Removal</p>
                    <p className="text-sm text-muted-foreground">Automated removal requests</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Continuous Monitoring</p>
                    <p className="text-sm text-muted-foreground">Real-time alerts</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Priority Support</p>
                    <p className="text-sm text-muted-foreground">Dedicated assistance</p>
                  </div>
                </div>
              </>
            )}
          </div>
          {!isPremium && (
            <Button 
              onClick={handleUpgrade}
              className="w-full mt-6"
              size="lg"
            >
              Upgrade Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
}
