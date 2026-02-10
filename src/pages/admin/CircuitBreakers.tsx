import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle2, MinusCircle, RefreshCcw, Activity } from "lucide-react";
import { toast } from "sonner";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";

export default function CircuitBreakers() {
  const queryClient = useQueryClient();

  const { data: circuitBreakers, isLoading } = useQuery({
    queryKey: ['circuit-breaker-states'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('circuit_breaker_states')
        .select('*')
        .order('provider_id');
      
      if (error) throw error;
      return data;
    },
  });

  const { data: providerHealth } = useQuery({
    queryKey: ['provider-health'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('provider_health')
        .select('*')
        .order('health_score', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: recentEvents } = useQuery({
    queryKey: ['circuit-breaker-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('circuit_breaker_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    },
  });

  const resetMutation = useMutation({
    mutationFn: async (providerId: string) => {
      const { data, error } = await supabase.functions.invoke('circuit-breaker-manager', {
        body: {
          action: 'manual_reset',
          provider_id: providerId,
        },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['circuit-breaker-states'] });
      queryClient.invalidateQueries({ queryKey: ['circuit-breaker-events'] });
      toast.success('Circuit breaker reset successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to reset: ${error.message}`);
    },
  });

  const getStateColor = (state: string) => {
    switch (state) {
      case 'closed':
        return 'default';
      case 'open':
        return 'destructive';
      case 'half_open':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStateIcon = (state: string) => {
    switch (state) {
      case 'closed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'open':
        return <AlertCircle className="w-4 h-4" />;
      case 'half_open':
        return <MinusCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const openCount = circuitBreakers?.filter(cb => cb.state === 'open').length || 0;
  const halfOpenCount = circuitBreakers?.filter(cb => cb.state === 'half_open').length || 0;
  const closedCount = circuitBreakers?.filter(cb => cb.state === 'closed').length || 0;

  return (
    <div className="container mx-auto py-8 space-y-6">
      <AdminBreadcrumb currentPage="Circuit Breakers" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Circuit Breakers</h1>
          <p className="text-muted-foreground">Monitor and manage provider circuit breaker states</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Providers</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{circuitBreakers?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{closedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Half-Open</CardTitle>
            <MinusCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{halfOpenCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{openCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Circuit Breaker States */}
      <Card>
        <CardHeader>
          <CardTitle>Circuit Breaker States</CardTitle>
          <CardDescription>Current state of all provider circuit breakers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {circuitBreakers?.map((cb) => {
              const health = providerHealth?.find(h => h.provider_id === cb.provider_id);
              
              return (
                <div key={cb.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{cb.provider_id}</h3>
                      <Badge variant={getStateColor(cb.state)} className="flex items-center gap-1">
                        {getStateIcon(cb.state)}
                        {cb.state.replace('_', '-')}
                      </Badge>
                      {health && (
                        <span className={`text-sm font-medium ${getHealthColor(health.health_score)}`}>
                          Health: {health.health_score.toFixed(0)}%
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Failures:</span> {cb.failure_count}/{cb.failure_threshold}
                      </div>
                      <div>
                        <span className="font-medium">Successes:</span> {cb.success_count}/{cb.success_threshold}
                      </div>
                      <div>
                        <span className="font-medium">Total Trips:</span> {cb.total_trips}
                      </div>
                      <div>
                        <span className="font-medium">Calls Blocked:</span> {cb.total_calls_blocked}
                      </div>
                    </div>
                    {cb.next_attempt_at && (
                      <div className="text-xs text-muted-foreground">
                        Next attempt: {new Date(cb.next_attempt_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {cb.state !== 'closed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resetMutation.mutate(cb.provider_id)}
                        disabled={resetMutation.isPending}
                      >
                        <RefreshCcw className="w-4 h-4 mr-1" />
                        Reset
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
          <CardDescription>Latest circuit breaker state changes and events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentEvents?.slice(0, 20).map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 border rounded text-sm">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{event.event_type}</Badge>
                  <span className="font-medium">{event.provider_id}</span>
                  {event.previous_state && event.new_state && (
                    <span className="text-muted-foreground">
                      {event.previous_state} → {event.new_state}
                    </span>
                  )}
                </div>
                <span className="text-muted-foreground">
                  {new Date(event.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
