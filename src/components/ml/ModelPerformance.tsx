import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export function ModelPerformance() {
  const { data: models, isLoading } = useQuery({
    queryKey: ["ml-models"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ml_models" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "success";
      case "training": return "warning";
      case "failed": return "destructive";
      default: return "secondary";
    }
  };

  if (isLoading) {
    return <div>Loading models...</div>;
  }

  return (
    <div className="space-y-4">
      {models?.map((model: any) => (
        <Card key={model.id} className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{model.name}</h3>
                  <Badge variant={getStatusColor(model.status) as any}>
                    {model.status}
                  </Badge>
                  <Badge variant="outline">v{model.version}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{model.description}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">Model Type</p>
                <p className="font-medium">{model.model_type}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Algorithm</p>
                <p className="font-medium">{model.algorithm}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Trained</p>
                <p className="font-medium">
                  {model.trained_at ? format(new Date(model.trained_at), "PPp") : "Not yet"}
                </p>
              </div>
            </div>

            {model.performance_metrics && Object.keys(model.performance_metrics).length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Performance Metrics</p>
                <div className="grid gap-2 md:grid-cols-4">
                  {Object.entries(model.performance_metrics).map(([key, value]) => (
                    <div key={key} className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground capitalize">{key}</p>
                      <p className="font-semibold">{typeof value === 'number' ? value.toFixed(3) : String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
