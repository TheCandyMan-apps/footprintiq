import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/hooks/useWorkspace';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  Loader2, 
  AlertTriangle, 
  Download, 
  ArrowRight,
  Mail,
  RefreshCw
} from 'lucide-react';

interface PurchaseVerificationProps {
  sessionId: string;
  expectedPlan: string;
  onComplete: () => void;
  onClose: () => void;
}

type VerificationState = 'verifying' | 'success' | 'timeout';

interface VerificationResult {
  plan: string;
  renewalDate: string | null;
  amountPaid: number | null;
  currency: string;
  receiptUrl: string | null;
}

const MAX_ATTEMPTS = 12; // 60 seconds with 5s intervals
const POLL_INTERVAL = 5000;

export function PurchaseVerification({
  sessionId,
  expectedPlan,
  onComplete,
  onClose,
}: PurchaseVerificationProps) {
  const { workspace, refreshWorkspace } = useWorkspace();
  const [state, setState] = useState<VerificationState>('verifying');
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const getPlanLabel = (plan: string): string => {
    const labels: Record<string, string> = {
      pro: 'Pro',
      pro_annual: 'Pro Annual',
      business: 'Business',
      enterprise: 'Enterprise',
    };
    return labels[plan] || plan.charAt(0).toUpperCase() + plan.slice(1);
  };

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number | null, currency: string): string => {
    if (amount === null) return '';
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const checkSubscription = useCallback(async (): Promise<boolean> => {
    if (!workspace?.id) return false;

    try {
      const { data, error } = await supabase.functions.invoke('billing-sync', {
        body: { workspaceId: workspace.id },
      });

      if (error) {
        console.error('[PurchaseVerification] billing-sync error:', error);
        return false;
      }

      console.log('[PurchaseVerification] billing-sync response:', data);

      // Check if plan matches expected (handle variations like pro/pro_annual)
      const currentPlan = data?.plan?.toLowerCase() || 'free';
      const expected = expectedPlan.toLowerCase().replace('_annual', '');
      
      if (currentPlan !== 'free' && currentPlan.includes(expected)) {
        // Fetch billing history to get receipt
        const { data: historyData } = await supabase.functions.invoke('billing-history');
        const latestInvoice = historyData?.invoices?.[0];

        setResult({
          plan: currentPlan,
          renewalDate: data?.period_end || null,
          amountPaid: latestInvoice?.amount || null,
          currency: latestInvoice?.currency || 'gbp',
          receiptUrl: latestInvoice?.invoice_pdf || null,
        });

        return true;
      }

      return false;
    } catch (err) {
      console.error('[PurchaseVerification] Error:', err);
      return false;
    }
  }, [workspace?.id, expectedPlan]);

  const startPolling = useCallback(async () => {
    setState('verifying');
    setAttempts(0);

    // Immediate first check
    const immediateSuccess = await checkSubscription();
    if (immediateSuccess) {
      setState('success');
      await refreshWorkspace();
      return;
    }

    let attemptCount = 1;
    setAttempts(1);

    const interval = setInterval(async () => {
      attemptCount++;
      setAttempts(attemptCount);

      const success = await checkSubscription();

      if (success) {
        clearInterval(interval);
        setState('success');
        await refreshWorkspace();
      } else if (attemptCount >= MAX_ATTEMPTS) {
        clearInterval(interval);
        setState('timeout');
      }
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [checkSubscription, refreshWorkspace]);

  useEffect(() => {
    startPolling();
  }, [startPolling]);

  const progress = (attempts / MAX_ATTEMPTS) * 100;
  const elapsedSeconds = attempts * 5;

  if (state === 'verifying') {
    return (
      <div className="flex flex-col items-center py-8 px-4 space-y-6">
        <div className="relative">
          <Loader2 className="w-16 h-16 animate-spin text-primary" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-primary">{elapsedSeconds}s</span>
          </div>
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold">Verifying your purchase...</h3>
          <p className="text-muted-foreground text-sm">
            This usually takes just a moment
          </p>
        </div>

        <div className="w-full max-w-xs space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            Checking payment status ({elapsedSeconds}s / 60s)
          </p>
        </div>

        <p className="text-xs text-muted-foreground text-center max-w-sm">
          Please don't close this window. We're confirming your payment with our payment provider.
        </p>
      </div>
    );
  }

  if (state === 'success' && result) {
    return (
      <div className="flex flex-col items-center py-8 px-4 space-y-6">
        <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold">Welcome to {getPlanLabel(result.plan)}!</h3>
          <p className="text-muted-foreground">
            Your subscription is now active
          </p>
        </div>

        <div className="w-full max-w-sm space-y-4 bg-muted/50 rounded-lg p-4">
          {result.renewalDate && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Next billing</span>
              <span className="font-semibold">{formatDate(result.renewalDate)}</span>
            </div>
          )}
          {result.amountPaid !== null && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Amount paid</span>
              <span className="font-semibold">
                {formatCurrency(result.amountPaid, result.currency)}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
          {result.receiptUrl && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => window.open(result.receiptUrl!, '_blank')}
            >
              <Download className="w-4 h-4 mr-2" />
              View Receipt
            </Button>
          )}
          <Button className="flex-1" onClick={onComplete}>
            Go to Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  // Timeout state
  return (
    <div className="flex flex-col items-center py-8 px-4 space-y-6">
      <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center">
        <AlertTriangle className="w-12 h-12 text-amber-500" />
      </div>

      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Verification Taking Longer</h3>
        <p className="text-muted-foreground text-sm max-w-sm">
          Your payment may still be processing. Don't worry — you won't be charged twice.
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        <Button onClick={() => startPolling()} variant="default">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
        <Button
          variant="outline"
          onClick={() => window.open('mailto:support@footprintiq.app?subject=Purchase%20Verification%20Issue&body=Session%20ID:%20' + sessionId, '_blank')}
        >
          <Mail className="w-4 h-4 mr-2" />
          Contact Support
        </Button>
        <Button variant="ghost" onClick={onClose}>
          Return to Billing
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Reference: {sessionId.substring(0, 20)}...
      </p>
    </div>
  );
}
