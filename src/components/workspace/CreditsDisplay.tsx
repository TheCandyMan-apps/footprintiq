import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, Plus, TrendingUp, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

interface CreditsDisplayProps {
  workspaceId: string;
}

export function CreditsDisplay({ workspaceId }: CreditsDisplayProps) {
  const { toast } = useToast();
  const [showHistory, setShowHistory] = useState(false);

  const { data: balance, isLoading } = useQuery({
    queryKey: ['credits-balance', workspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_credits_balance', { _workspace_id: workspaceId });
      
      if (error) throw error;
      return data || 0;
    },
  });

  const { data: history } = useQuery({
    queryKey: ['credits-history', workspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('credits_ledger')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
    enabled: showHistory,
  });

  const handleBuyCredits = () => {
    toast({
      title: "Buy Credits",
      description: "Redirecting to payment page...",
    });
    // TODO: Integrate with Stripe checkout
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-primary/10">
            <Coins className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Available Credits</p>
            <p className="text-3xl font-bold">
              {isLoading ? '...' : balance?.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Dialog open={showHistory} onOpenChange={setShowHistory}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <History className="h-4 w-4 mr-2" />
                History
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Credits History</DialogTitle>
                <DialogDescription>
                  Your recent credit transactions
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {history?.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex justify-between items-center p-3 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">{transaction.reason}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${transaction.delta > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.delta > 0 ? '+' : ''}{transaction.delta}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          <Button onClick={handleBuyCredits} size="sm">
            <Plus className="h-4 w-4 mr-2" />
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
