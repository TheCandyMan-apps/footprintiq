import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { REGISTRY } from "@/providers/registry";
import { getCircuitStatus } from "@/providers/runtime";
import { getSpendSummary } from "@/providers/costs";
import { getPolicyStatus } from "@/providers/policy";

export default function Providers() {
  const [circuits, setCircuits] = useState<Record<string, { open: boolean; failures: number; cooldownUntil?: number }>>({});
  const [spend, setSpend] = useState<Record<string, any>>({});
  const [policy, setPolicy] = useState<Record<string, any>>({});

  useEffect(() => {
    setCircuits(getCircuitStatus());
    setSpend(getSpendSummary());
    setPolicy(getPolicyStatus());
  }, []);

  const getStatus = (providerId: string) => {
    const envKey = `VITE_${providerId.toUpperCase()}_API_KEY`;
    const hasKey = !!import.meta.env[envKey];
    const meta = REGISTRY.find((p) => p.id === providerId);
    
    if (meta?.policy && !policy[meta.policy]?.enabled) {
      return { label: "Gated", variant: "secondary" as const };
    }
    
    if (circuits[providerId]?.open) {
      return { label: "Cooldown", variant: "destructive" as const };
    }
    
    if (!hasKey) {
      return { label: "Missing Key", variant: "outline" as const };
    }
    
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
      
      <div className="grid gap-4">
        {REGISTRY.map((provider) => {
          const status = getStatus(provider.id);
          const metrics = spend[provider.id]?.daily;
          
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
                    <p className="text-muted-foreground">Calls Today</p>
                    <p className="font-medium">{metrics?.calls || 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Success Rate</p>
                    <p className="font-medium">
                      {metrics?.calls ? `${Math.round((metrics.success / metrics.calls) * 100)}%` : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">P95 Latency</p>
                    <p className="font-medium">
                      {metrics?.p95 ? `${metrics.p95}ms` : "—"}
                    </p>
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
