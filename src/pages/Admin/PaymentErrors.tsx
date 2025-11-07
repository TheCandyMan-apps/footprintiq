import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  AlertCircle, 
  CreditCard, 
  RefreshCw, 
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

interface PaymentError {
  id: string;
  error_type: string;
  error_code: string;
  error_message: string;
  payment_intent_id?: string;
  customer_id?: string;
  amount?: number;
  price_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
  resolved: boolean;
}

export default function PaymentErrors() {
  const [selectedError, setSelectedError] = useState<PaymentError | null>(null);

  const { data: errors, isLoading, refetch } = useQuery({
    queryKey: ['payment-errors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_errors')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as PaymentError[];
    },
  });

  const getErrorTypeBadge = (type: string) => {
    const types: Record<string, { variant: 'default' | 'destructive' | 'secondary' | 'outline', icon: any }> = {
      'card_error': { variant: 'destructive', icon: CreditCard },
      'validation_error': { variant: 'secondary', icon: AlertCircle },
      'api_error': { variant: 'outline', icon: AlertTriangle },
      'stripe.checkout.failed': { variant: 'destructive', icon: AlertCircle },
    };

    const config = types[type] || { variant: 'outline' as const, icon: AlertCircle };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1.5">
        <Icon className="w-3 h-3" />
        {type}
      </Badge>
    );
  };

  const getErrorCodeColor = (code: string) => {
    const criticalCodes = ['card_declined', 'insufficient_funds', 'expired_card'];
    return criticalCodes.includes(code) ? 'text-destructive' : 'text-muted-foreground';
  };

  const markResolved = async (errorId: string) => {
    const { error } = await supabase
      .from('payment_errors')
      .update({ resolved: true })
      .eq('id', errorId);

    if (!error) {
      refetch();
      setSelectedError(null);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const unresolvedCount = errors?.filter(e => !e.resolved).length || 0;
  const totalErrors = errors?.length || 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Payment Error Monitoring</h1>
          <p className="text-muted-foreground">
            Track and resolve payment issues captured by Sentry
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Errors</p>
              <p className="text-3xl font-bold">{totalErrors}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Unresolved</p>
              <p className="text-3xl font-bold text-destructive">{unresolvedCount}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Resolved</p>
              <p className="text-3xl font-bold text-green-500">{totalErrors - unresolvedCount}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Error List */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Recent Errors</h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {errors && errors.length > 0 ? (
              errors.map((error) => (
                <div
                  key={error.id}
                  onClick={() => setSelectedError(error)}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedError?.id === error.id
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-muted/50'
                  } ${error.resolved ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    {getErrorTypeBadge(error.error_type)}
                    {error.resolved && (
                      <Badge variant="outline" className="gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Resolved
                      </Badge>
                    )}
                  </div>
                  
                  <p className="font-semibold mb-1 line-clamp-2">{error.error_message}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                    <span className={getErrorCodeColor(error.error_code)}>
                      {error.error_code}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(error.created_at), 'MMM d, h:mm a')}
                    </span>
                    {error.amount && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        ${(error.amount / 100).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-muted-foreground">No payment errors recorded</p>
              </div>
            )}
          </div>
        </Card>

        {/* Error Details */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Error Details</h2>
          {selectedError ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Error Type</p>
                {getErrorTypeBadge(selectedError.error_type)}
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-1">Error Code</p>
                <p className={`font-semibold ${getErrorCodeColor(selectedError.error_code)}`}>
                  {selectedError.error_code}
                </p>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-1">Message</p>
                <p className="text-sm">{selectedError.error_message}</p>
              </div>

              <Separator />

              {selectedError.payment_intent_id && (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Payment Intent ID</p>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {selectedError.payment_intent_id}
                    </code>
                  </div>
                  <Separator />
                </>
              )}

              {selectedError.customer_id && (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Customer ID</p>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {selectedError.customer_id}
                    </code>
                  </div>
                  <Separator />
                </>
              )}

              {selectedError.amount && (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Amount</p>
                    <p className="text-2xl font-bold">
                      ${(selectedError.amount / 100).toFixed(2)}
                    </p>
                  </div>
                  <Separator />
                </>
              )}

              <div>
                <p className="text-sm text-muted-foreground mb-1">Timestamp</p>
                <p className="text-sm">
                  {format(new Date(selectedError.created_at), 'PPpp')}
                </p>
              </div>

              {selectedError.metadata && Object.keys(selectedError.metadata).length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Metadata</p>
                    <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                      {JSON.stringify(selectedError.metadata, null, 2)}
                    </pre>
                  </div>
                </>
              )}

              {!selectedError.resolved && (
                <Button
                  onClick={() => markResolved(selectedError.id)}
                  className="w-full mt-4"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Resolved
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-96 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Select an error to view details
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
