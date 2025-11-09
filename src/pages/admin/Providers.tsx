import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PROVIDER_META } from "@/providers/registry.meta";
import { supabase } from "@/integrations/supabase/client";
import { SpiderFootStatus } from "@/components/admin/SpiderFootStatus";

export default function Providers() {
  const [circuits, setCircuits] = useState<Record<string, { open: boolean; failures: number; cooldownUntil?: number }>>({});
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    loadProviderHealth();
  }, []);

  const loadProviderHealth = async () => {
    try {
      const { data } = await supabase.functions.invoke('health', {
        body: { check: 'all' }
      });
      if (data) {
        setCircuits(data.breakersOpen || {});
        setHealth(data);
      }
    } catch (error) {
      console.error('Failed to load provider health:', error);
    }
  };

  const getStatus = (providerId: string) => {
    const meta = PROVIDER_META.find((p) => p.id === providerId);
    
    if (meta?.policy && !health?.config?.[meta.policy]) {
      return { label: "Gated", variant: "secondary" as const };
    }
    
    if (circuits[providerId]?.open) {
      return { label: "Cooldown", variant: "destructive" as const };
    }
    
    // In production, check key status via health endpoint
    return { label: "Enabled", variant: "default" as const };
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Provider Management</h1>
        <p className="text-muted-foreground">
          Monitor and configure all data enrichment providers
        </p>
      </div>

      {/* SpiderFoot Premium Provider Status */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Premium Providers</h2>
        <SpiderFootStatus />
      </div>

      <div className="mb-4">
        <h2 className="text-2xl font-semibold">Standard Providers</h2>
      </div>
      
      <div className="grid gap-4">
        {PROVIDER_META.map((provider) => {
          const status = getStatus(provider.id);
          
          return (
            <Card key={provider.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {provider.title}
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </CardTitle>
                    <CardDescription>{provider.description}</CardDescription>
                  </div>
                  <Button size="sm" variant="outline">
                    Test
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Supports</p>
                    <p className="font-medium">{provider.supports.join(", ")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Cost Tier</p>
                    <p className="font-medium capitalize">{provider.cost}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Category</p>
                    <p className="font-medium capitalize">{provider.category}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Cache TTL</p>
                    <p className="font-medium">{Math.round(provider.ttlMs / 3600000)}h</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
