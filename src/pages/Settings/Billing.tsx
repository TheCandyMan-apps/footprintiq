import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Calendar, Download, CheckCircle2, Loader2, ArrowRight, Zap } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { SettingsBreadcrumb } from '@/components/settings/SettingsBreadcrumb';
import { Separator } from '@/components/ui/separator';
import { useSubscription } from '@/hooks/useSubscription';
import { StripePaymentForm } from '@/components/billing/StripePaymentForm';
import { TestModeToggle } from '@/components/billing/TestModeToggle';
import { PaymentErrorBoundary } from '@/components/billing/PaymentErrorBoundary';
import { CreditPackCard } from '@/components/CreditPackCard';
import { useSearchParams } from 'react-router-dom';
import { SUBSCRIPTION_PLANS, CREDIT_PACKS } from '@/config/stripe';
import { useWorkspace } from '@/hooks/useWorkspace';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

// Pricing tiers - using centralized config
const PRICING_TIERS = {
  pro: SUBSCRIPTION_PLANS.pro,
  pro_annual: {
    ...SUBSCRIPTION_PLANS.pro,
    name: 'PRO Annual',
    price: 190,
    period: 'year',
    priceId: 'price_1SQwWCPNdM5SAyj7XS394cD9', // Annual price ID
    savings: 38,
  },
  business: SUBSCRIPTION_PLANS.business,
  enterprise: SUBSCRIPTION_PLANS.enterprise,
};

export default function BillingSettings() {
  const [loading, setLoading] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<keyof typeof PRICING_TIERS | null>(null);
  const [verifyingUpgrade, setVerifyingUpgrade] = useState(false);
  const [pollingAttempts, setPollingAttempts] = useState(0);
  const MAX_POLLING_ATTEMPTS = 6; // 30 seconds with 5s intervals
  const { subscriptionTier, isPremium, refreshSubscription } = useSubscription();
  const [searchParams] = useSearchParams();
  const [purchasingPack, setPurchasingPack] = useState<string | null>(null);
  const { workspace } = useWorkspace();

  // Handle credit purchase success/cancel
  useEffect(() => {
    const creditsSuccess = searchParams.get('credits_success');
    const pack = searchParams.get('pack');
    const creditsCanceled = searchParams.get('credits_canceled');

    if (creditsSuccess && pack) {
      toast({
        title: '✅ Credits Purchased!',
        description: `Your ${pack === 'starter' ? '500' : '2000'} credits have been added to your account.`,
      });
      // Remove query params
      window.history.replaceState({}, '', '/settings/billing');
    } else if (creditsCanceled) {
      toast({
        title: 'Purchase Canceled',
        description: 'Your credit purchase was canceled.',
        variant: 'destructive',
      });
      window.history.replaceState({}, '', '/settings/billing');
    }
  }, [searchParams]);

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

  const handleUpgrade = async (plan: keyof typeof PRICING_TIERS) => {
    setSelectedPlan(plan);
    setShowPaymentDialog(true);
  };

  const verifyUpgrade = async (expectedTier: string): Promise<boolean> => {
    try {
      await refreshSubscription();
      const { data } = await supabase.functions.invoke("billing/check-subscription");
      
      // Check if user role was updated
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('subscription_tier')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      return userRole?.subscription_tier === expectedTier || 
             data?.subscription_tier === expectedTier;
    } catch (error) {
      console.error('Verification error:', error);
      return false;
    }
  };

  const handlePaymentSuccess = async () => {
    if (!selectedPlan) return;

    setVerifyingUpgrade(true);
    setPollingAttempts(0);

    const expectedTier = selectedPlan;
    let attempts = 0;

    // Poll for up to 30 seconds
    const pollInterval = setInterval(async () => {
      attempts++;
      setPollingAttempts(attempts);

      const isVerified = await verifyUpgrade(expectedTier);

      if (isVerified) {
        clearInterval(pollInterval);
        setVerifyingUpgrade(false);
        setShowPaymentDialog(false);
        setSelectedPlan(null);
        toast({
          title: '✅ Upgrade Successful!',
          description: 'Your premium features are now unlocked.',
        });
        refreshSubscription();
        refetchSubscription();
      } else if (attempts >= MAX_POLLING_ATTEMPTS) {
        clearInterval(pollInterval);
        setVerifyingUpgrade(false);
        toast({
          title: 'Verification Timeout',
          description: 'Your payment is processing. Please refresh in a moment or contact support@footprintiq.app if issues persist.',
          variant: 'destructive',
        });
      }
    }, 5000);

    // Initial check immediately
    const isVerified = await verifyUpgrade(expectedTier);
    if (isVerified) {
      clearInterval(pollInterval);
      setVerifyingUpgrade(false);
      setShowPaymentDialog(false);
      setSelectedPlan(null);
      toast({
        title: '✅ Upgrade Successful!',
        description: 'Your premium features are now unlocked.',
      });
      refreshSubscription();
      refetchSubscription();
    }
  };

  const handlePaymentCancel = () => {
    setShowPaymentDialog(false);
    setSelectedPlan(null);
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
      toast({
        title: 'Portal Error',
        description: 'Failed to open billing portal',
        variant: 'destructive',
      });
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
    <PaymentErrorBoundary>
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

        {/* Test Mode Toggle */}
        <TestModeToggle />

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
                <>
                  <div className="flex gap-2 flex-wrap">
                    <Button 
                      onClick={() => handleUpgrade('pro')}
                      disabled={loading}
                    >
                      PRO (£19/mo)
                    </Button>
                    <Button 
                      onClick={() => handleUpgrade('business')}
                      disabled={loading}
                      variant="outline"
                    >
                      Business (£49/mo)
                    </Button>
                    <Button 
                      onClick={() => handleUpgrade('pro_annual')}
                      disabled={loading}
                      variant="default"
                      className="relative"
                    >
                      <Badge className="absolute -top-2 -right-2 bg-green-500 text-xs">
                        Save $30
                      </Badge>
                      Pro Pack ($150/yr)
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    💰 Annual plan saves you $30/year compared to monthly billing
                  </p>
                </>
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

        {/* Credit Packs */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-bold">Buy Credit Packs</h3>
          </div>
          <p className="text-muted-foreground mb-6">
            Purchase credits for advanced OSINT features, premium scans, and AI analysis.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <CreditPackCard
              name="OSINT Starter"
              credits={500}
              price={9}
              onPurchase={async () => {
                setPurchasingPack('starter');
                try {
                  if (!workspace?.id) throw new Error('No workspace found');

                  const { data, error } = await supabase.functions.invoke('purchase-credit-pack', {
                    body: { packType: 'starter', workspaceId: workspace.id },
                  });

                  if (error) throw error;
                  if (data?.url) {
                    window.open(data.url, '_blank');
                  }
                } catch (error) {
                  console.error('Purchase error:', error);
                  toast({
                    title: 'Purchase Failed',
                    description: error.message || 'Failed to initiate purchase',
                    variant: 'destructive',
                  });
                } finally {
                  setPurchasingPack(null);
                }
              }}
              loading={purchasingPack === 'starter'}
            />

            <CreditPackCard
              name="Pro Pack"
              credits={2000}
              price={29}
              popular
              onPurchase={async () => {
                setPurchasingPack('pro');
                try {
                  if (!workspace?.id) throw new Error('No workspace found');

                  const { data, error } = await supabase.functions.invoke('purchase-credit-pack', {
                    body: { packType: 'pro', workspaceId: workspace.id },
                  });

                  if (error) throw error;
                  if (data?.url) {
                    window.open(data.url, '_blank');
                  }
                } catch (error) {
                  console.error('Purchase error:', error);
                  toast({
                    title: 'Purchase Failed',
                    description: error.message || 'Failed to initiate purchase',
                    variant: 'destructive',
                  });
                } finally {
                  setPurchasingPack(null);
                }
              }}
              loading={purchasingPack === 'pro'}
            />
          </div>
        </Card>

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
            <div className="flex gap-3 mt-6">
              <Button 
                onClick={() => handleUpgrade('pro')}
                className="flex-1"
                size="lg"
              >
                Get PRO (£19)
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button 
                onClick={() => handleUpgrade('business')}
                className="flex-1"
                variant="outline"
                size="lg"
              >
                Get Business (£49)
              </Button>
            </div>
          )}
        </Card>

        {/* Pricing Plans Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {selectedPlan && PRICING_TIERS[selectedPlan].name} Plan
              </DialogTitle>
              <DialogDescription>
                {verifyingUpgrade 
                  ? `Verifying upgrade... (${pollingAttempts * 5}s / 30s)`
                  : 'Complete your subscription using secure Stripe payment'
                }
              </DialogDescription>
            </DialogHeader>
            {verifyingUpgrade ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="text-center text-muted-foreground">
                  Processing your upgrade...
                  <br />
                  <span className="text-xs">Please don't close this window</span>
                </p>
              </div>
            ) : selectedPlan && (
              <StripePaymentForm
                priceId={PRICING_TIERS[selectedPlan].priceId}
                planName={PRICING_TIERS[selectedPlan].name}
                amount={PRICING_TIERS[selectedPlan].price}
                onSuccess={handlePaymentSuccess}
                onCancel={handlePaymentCancel}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
      </div>
    </PaymentErrorBoundary>
  );
}
