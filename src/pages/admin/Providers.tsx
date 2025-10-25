import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { REGISTRY } from "@/providers/registry";
import { getCircuitStatus } from "@/providers/runtime";
import { getSpendSummary } from "@/providers/costs";
import { getPolicyStatus } from "@/providers/policy";

export default function Providers() {
  const [circuits, setCircuits] = useState<any>({});
  const [spend, setSpend] = useState<any>({});
  const [policy, setPolicy] = useState<any>({});

  useEffect(() => {
    setCircuits(getCircuitStatus());
    setSpend(getSpendSummary());
    setPolicy(getPolicyStatus());
  }, []);

  const getStatus = (providerId: string) => {
    const hasKey = !!import.meta.env[`VITE_${providerId.toUpperCase()}_API_KEY`];
    const isOpen = circuits[providerId]?.open;
    const meta = REGISTRY.find((p) => p.id === providerId);
    
    if (!hasKey) return { label: "Missing Key", variant: "secondary" as const };
    if (meta?.policy && !policy[meta.policy]?.enabled) return { label: "Gated", variant: "outline" as const };
    if (isOpen) return { label: "Cooldown", variant: "destructive" as const };
    return { label: "Enabled", variant: "default" as const };
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Provider Management</h1>
      
      <div className="grid gap-4">
        {REGISTRY.map((provider) => {
          const status = getStatus(provider.id);
          const providerSpend = spend[provider.id]?.daily?.[new Date().toISOString().split("T")[0]];
          
          return (
            <Card key={provider.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{provider.title}</h3>
                  <p className="text-sm text-muted-foreground">{provider.description}</p>
                  <div className="flex gap-2 mt-2">
                    {provider.supports.map((type) => (
                      <Badge key={type} variant="outline">{type}</Badge>
                    ))}
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <Badge variant={status.variant}>{status.label}</Badge>
                  {providerSpend && (
                    <div className="text-sm">
                      <div>Calls: {providerSpend.calls}</div>
                      <div>Success: {providerSpend.successRate}</div>
                      <div>Latency: {providerSpend.avgLatencyMs}ms</div>
                    </div>
                  )}
                  <Button size="sm" variant="outline">Test</Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
