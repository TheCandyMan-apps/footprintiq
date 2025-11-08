import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import confetti from 'canvas-confetti';

interface CreditsDisplayProps {
  workspaceId: string;
}

export function CreditsDisplay({ workspaceId }: CreditsDisplayProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [balance, setBalance] = useState(0);
  const [lastBalance, setLastBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCredits = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("get_credits_balance", {
        _workspace_id: workspaceId,
      });

      if (error) throw error;

      const newBalance = data || 0;
      
      // Check if credits increased (purchase detected)
      if (newBalance > balance && balance > 0) {
        const creditsAdded = newBalance - balance;
        
        // Trigger confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        
        // Show celebration toast
        toast.success(`${creditsAdded} credits added! 🎉`, {
          description: `Your new balance: ${newBalance} credits`,
          duration: 5000,
        });
        
        // Invalidate queries to refresh navbar
        queryClient.invalidateQueries({ queryKey: ['credits-balance'] });
      }

      setBalance(newBalance);
      setLastBalance(newBalance);
    } catch (err) {
      console.error("Error fetching credits:", err);
      toast.error("Failed to fetch credits");
    } finally {
      setLoading(false);
    }
  }, [workspaceId, balance, queryClient]);

  useEffect(() => {
    fetchCredits();

    // Set up Realtime listener for credit changes
    console.log('[Credits] Setting up Realtime listener for workspace:', workspaceId);
    
    const channel = supabase
      .channel(`credits-${workspaceId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'credits_ledger',
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload) => {
          console.log('[Credits] Realtime INSERT event:', payload);
          const newRecord = payload.new as any;
          
          if (newRecord.transaction_type === 'purchase' && newRecord.amount > 0) {
            toast.success(`${newRecord.amount} credits added! 🎉`, {
              description: "Your credits are ready to use",
              duration: 5000,
            });
            
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            });
          }
          
          setTimeout(() => {
            fetchCredits();
          }, 100);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'credits_ledger',
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload) => {
          console.log('[Credits] Realtime UPDATE event:', payload);
          
          setTimeout(() => {
            fetchCredits();
          }, 100);
        }
      )
      .subscribe((status) => {
        console.log('[Credits] Realtime subscription status:', status);
      });

    return () => {
      console.log('[Credits] Cleaning up Realtime listener');
      supabase.removeChannel(channel);
    };
  }, [workspaceId, fetchCredits]);

  const handleBuyCredits = () => {
    navigate("/settings/credits");
  };

  const calculateTrend = () => {
    if (lastBalance === 0) return null;
    const change = balance - lastBalance;
    const percentChange = (change / lastBalance) * 100;
    return { change, percentChange };
  };

  const trend = calculateTrend();

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-primary/10">
            <Coins className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Available Credits</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold">
                {loading ? "..." : balance.toLocaleString()}
              </p>
              {trend && trend.change !== 0 && (
                <div className={`flex items-center gap-1 text-sm ${
                  trend.change > 0 ? "text-green-600" : "text-red-600"
                }`}>
                  {trend.change > 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span>{Math.abs(trend.percentChange).toFixed(0)}%</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={fetchCredits} 
            size="sm" 
            variant="outline"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={handleBuyCredits} size="sm">
            Buy Credits
          </Button>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="h-4 w-4" />
          <span>
            Basic scans: 1 credit • Advanced: 5 credits • Dark web: 10 credits
          </span>
        </div>
      </div>
    </Card>
  );
}
