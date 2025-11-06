import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  ExternalLink, 
  CreditCard, 
  Download,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  Receipt
} from 'lucide-react';
import { format } from 'date-fns';
import { SettingsBreadcrumb } from '@/components/settings/SettingsBreadcrumb';

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  invoice_pdf?: string;
  hosted_invoice_url?: string;
  description: string;
}

interface Charge {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  receipt_url?: string;
  description: string;
}

interface PaymentMethod {
  id: string;
  brand?: string;
  last4?: string;
  exp_month?: number;
  exp_year?: number;
}

interface UpcomingInvoice {
  amount: number;
  currency: string;
  period_start: number;
  period_end: number;
  next_payment_attempt: number;
  lines: Array<{
    description: string;
    amount: number;
    period: { start: number; end: number };
  }>;
}

export default function SubscriptionManagement() {
  const { subscriptionTier, subscriptionEnd, isLoading: subLoading } = useSubscription();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [charges, setCharges] = useState<Charge[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingInvoice | null>(null);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      
      const [historyRes, upcomingRes] = await Promise.all([
        supabase.functions.invoke('billing/history'),
        supabase.functions.invoke('billing/upcoming-invoice'),
      ]);

      if (historyRes.data) {
        setInvoices(historyRes.data.invoices || []);
        setCharges(historyRes.data.charges || []);
        setPaymentMethods(historyRes.data.paymentMethods || []);
      }

      if (upcomingRes.data?.upcoming) {
        setUpcoming(upcomingRes.data.upcoming);
      }
    } catch (error) {
      console.error('Error loading billing data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load billing information',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('billing/create-portal', {
        body: { workspace_id: 'default' }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Portal error:', error);
      toast({
        title: 'Error',
        description: 'Failed to open billing portal',
        variant: 'destructive',
      });
    }
  };

  if (subLoading || loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const allTransactions = [
    ...invoices.map(inv => ({ ...inv, type: 'invoice' as const })),
    ...charges.map(charge => ({ ...charge, type: 'charge' as const }))
  ].sort((a, b) => b.created - a.created);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <SettingsBreadcrumb currentPage="Subscription Management" />
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Subscription Management</h2>
          <p className="text-muted-foreground">Manage your subscription, billing, and payment methods</p>
        </div>

      {/* Current Plan */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold capitalize flex items-center gap-2">
              {subscriptionTier} Plan
              <Badge variant={subscriptionTier !== 'free' ? 'default' : 'secondary'}>
                {subscriptionTier !== 'free' ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Active
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 mr-1" />
                    Free Tier
                  </>
                )}
              </Badge>
            </h3>
            {subscriptionEnd && (
              <p className="text-sm text-muted-foreground mt-1">
                Renews on {format(new Date(subscriptionEnd), 'PPP')}
              </p>
            )}
          </div>
          <Button onClick={handleManageSubscription} variant="outline" className="gap-2">
            <CreditCard className="w-4 h-4" />
            Manage Billing
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>

        {/* Payment Methods */}
        {paymentMethods.length > 0 && (
          <>
            <Separator className="my-4" />
            <div>
              <h4 className="text-sm font-medium mb-3">Payment Method</h4>
              <div className="flex items-center gap-3 text-sm">
                <CreditCard className="w-4 h-4" />
                <span className="capitalize">{paymentMethods[0].brand}</span>
                <span>•••• {paymentMethods[0].last4}</span>
                <span className="text-muted-foreground">
                  Expires {paymentMethods[0].exp_month}/{paymentMethods[0].exp_year}
                </span>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Upcoming Invoice */}
      {upcoming && (
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Next Invoice
              </h3>
              <p className="text-sm text-muted-foreground">
                Due {format(new Date(upcoming.next_payment_attempt * 1000), 'PPP')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">
                {formatAmount(upcoming.amount, upcoming.currency)}
              </p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(upcoming.period_start * 1000), 'MMM d')} -{' '}
                {format(new Date(upcoming.period_end * 1000), 'MMM d, yyyy')}
              </p>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-2">
            {upcoming.lines.map((line, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{line.description}</span>
                <span className="font-medium">
                  {formatAmount(line.amount, upcoming.currency)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Billing History */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Billing History
          </h3>
          <Button variant="ghost" size="sm" onClick={loadBillingData}>
            <Clock className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {allTransactions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No billing history yet</p>
        ) : (
          <div className="space-y-3">
            {allTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <DollarSign className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(transaction.created * 1000), 'PPP')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatAmount(transaction.amount, transaction.currency)}
                    </p>
                    <Badge
                      variant={
                        transaction.status === 'paid' || transaction.status === 'succeeded'
                          ? 'default'
                          : transaction.status === 'open'
                          ? 'secondary'
                          : 'destructive'
                      }
                      className="text-xs"
                    >
                      {transaction.status}
                    </Badge>
                  </div>

                  {(transaction.type === 'invoice' && transaction.invoice_pdf) ||
                  (transaction.type === 'charge' && transaction.receipt_url) ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const url =
                          transaction.type === 'invoice'
                            ? transaction.invoice_pdf
                            : transaction.receipt_url;
                        if (url) window.open(url, '_blank');
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      </div>
    </div>
  );
}
