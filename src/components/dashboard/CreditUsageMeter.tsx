import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Coins, TrendingDown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '@/hooks/useWorkspace';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { subDays, format } from 'date-fns';
import { HelpIcon } from '@/components/ui/help-icon';

export function CreditUsageMeter() {
  const [balance, setBalance] = useState<number>(0);
  const [monthlySpend, setMonthlySpend] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [trendData, setTrendData] = useState<Array<{ date: string; balance: number }>>([]);
  const navigate = useNavigate();
  const { workspace } = useWorkspace();

  useEffect(() => {
    if (workspace?.id) {
      fetchCreditData();
    }
  }, [workspace?.id]);

  const fetchCreditData = async () => {
    try {
      if (!workspace?.id) {
        console.log('[CreditUsageMeter] No workspace ID');
        return;
      }

      console.log('[CreditUsageMeter] Fetching credit data for workspace:', workspace.id);

      // Get current balance
      const { data: balanceData, error: balanceError } = await supabase.rpc('get_credits_balance', {
        _workspace_id: workspace.id,
      });
      
      if (balanceError) {
        console.error('[CreditUsageMeter] Error fetching balance:', balanceError);
        throw balanceError;
      }
      
      console.log('[CreditUsageMeter] Current balance:', balanceData);
      setBalance(balanceData || 0);

      // Get monthly spend
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const { data: ledgerData, error: ledgerError } = await supabase
        .from('credits_ledger')
        .select('delta')
        .eq('workspace_id', workspace.id)
        .gte('created_at', monthStart.toISOString())
        .lt('delta', 0); // Only negative deltas (spending)

      if (ledgerError) {
        console.error('[CreditUsageMeter] Error fetching ledger:', ledgerError);
      }

      const totalSpend = Math.abs(
        ledgerData?.reduce((sum, entry) => sum + entry.delta, 0) || 0
      );
      console.log('[CreditUsageMeter] Monthly spend:', totalSpend);
      setMonthlySpend(totalSpend);

      // Fetch historical trend (last 30 days)
      const thirtyDaysAgo = subDays(new Date(), 30);
      const { data: historicalData } = await supabase
        .from('credits_ledger')
        .select('created_at, delta')
        .eq('workspace_id', workspace.id)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      // Calculate cumulative balance over time
      if (historicalData) {
        let runningBalance = balanceData || 0;
        const trend = historicalData.map(entry => {
          runningBalance -= entry.delta;
          return {
            date: format(new Date(entry.created_at), 'MM/dd'),
            balance: runningBalance,
          };
        }).reverse();
        
        setTrendData(trend.slice(-7)); // Last 7 days
      }
    } catch (error) {
      console.error('[CreditUsageMeter] Error fetching credit data:', error);
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
          <HelpIcon helpKey="credit_usage" />
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
                    aria-label="Navigate to buy credits page"
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
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingDown className="h-4 w-4" />
                  <span>Monthly Spend</span>
                </div>
                <span className="text-lg font-bold text-foreground">{monthlySpend}</span>
              </div>
              
              {/* Historical Trend Chart */}
              {trendData.length > 0 && (
                <div className="mt-4 h-[80px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 10 }}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis 
                        tick={{ fontSize: 10 }}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px',
                          fontSize: '12px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="balance" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))', r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
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
