import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Coins, TrendingDown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '@/hooks/useWorkspace';

export function CreditUsageMeter() {
  const [balance, setBalance] = useState<number>(0);
  const [monthlySpend, setMonthlySpend] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { workspace } = useWorkspace();

  useEffect(() => {
    if (workspace?.id) {
      fetchCreditData();
    }
  }, [workspace?.id]);

  const fetchCreditData = async () => {
    try {
      if (!workspace?.id) return;

      // Get current balance
      const { data: balanceData } = await supabase.rpc('get_credits_balance', {
        _workspace_id: workspace.id,
      });
      setBalance(balanceData || 0);

      // Get monthly spend
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const { data: ledgerData } = await supabase
        .from('credits_ledger')
        .select('delta')
        .eq('workspace_id', workspace.id)
        .gte('created_at', monthStart.toISOString())
        .lt('delta', 0); // Only negative deltas (spending)

      const totalSpend = Math.abs(
        ledgerData?.reduce((sum, entry) => sum + entry.delta, 0) || 0
      );
      setMonthlySpend(totalSpend);
    } catch (error) {
      console.error('Error fetching credit data:', error);
    } finally {
      setLoading(false);
    }
  };

  const isPremium = ['pro', 'enterprise'].includes(
    workspace?.subscription_tier?.toLowerCase() || ''
  );

  const getBalanceColor = (bal: number) => {
    if (isPremium) return 'text-green-500';
    if (bal > 20) return 'text-green-500';
    if (bal > 5) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <Card className="shadow-card hover:shadow-glow transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-primary" />
          Credit Usage
        </CardTitle>
        <CardDescription>Current balance and monthly spend</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="h-[120px] flex items-center justify-center text-muted-foreground">
            Loading...
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className={`text-3xl font-bold ${getBalanceColor(balance)}`}>
                  {isPremium ? '∞' : balance}
                </p>
              </div>
              {!isPremium && balance < 20 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate('/buy-credits')}
                >
                  Buy Credits
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>

            {!isPremium && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Usage Level</span>
                  <span className={getBalanceColor(balance)}>
                    {balance > 20 ? 'Healthy' : balance > 5 ? 'Low' : 'Critical'}
                  </span>
                </div>
                <Progress value={Math.min(100, (balance / 50) * 100)} className="h-2" />
              </div>
            )}

            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingDown className="h-4 w-4" />
                  <span>Monthly Spend</span>
                </div>
                <span className="text-lg font-bold text-foreground">{monthlySpend}</span>
              </div>
            </div>

            {isPremium && (
              <div className="text-xs text-muted-foreground text-center pt-2">
                Unlimited credits included in your plan
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
