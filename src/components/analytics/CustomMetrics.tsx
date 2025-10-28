import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, AlertTriangle, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface CustomMetric {
  id: string;
  name: string;
  description: string;
  metric_type: string;
  calculation: any;
  threshold_warning: number | null;
  threshold_critical: number | null;
  created_at: string;
}

export function CustomMetrics() {
  const [metrics, setMetrics] = useState<CustomMetric[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newMetric, setNewMetric] = useState({
    name: "",
    description: "",
    metric_type: "count",
    calculation: {},
    threshold_warning: "",
    threshold_critical: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from("custom_metrics")
        .select("*")
        .eq("user_id", user.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setMetrics(data);
    } catch (error: any) {
      console.error("Error loading metrics:", error);
    }
  };

  const createMetric = async () => {
    if (!newMetric.name) {
      toast({ title: "Error", description: "Please enter a metric name", variant: "destructive" });
      return;
    }

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const { error } = await supabase.from("custom_metrics").insert({
        user_id: user.user.id,
        name: newMetric.name,
        description: newMetric.description,
        metric_type: newMetric.metric_type,
        calculation: newMetric.calculation,
        threshold_warning: newMetric.threshold_warning ? parseFloat(newMetric.threshold_warning) : null,
        threshold_critical: newMetric.threshold_critical ? parseFloat(newMetric.threshold_critical) : null
      });

      if (error) throw error;

      toast({ title: "Success", description: "Custom metric created" });
      setIsDialogOpen(false);
      setNewMetric({
        name: "",
        description: "",
        metric_type: "count",
        calculation: {},
        threshold_warning: "",
        threshold_critical: ""
      });
      loadMetrics();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const deleteMetric = async (id: string) => {
    try {
      const { error } = await supabase
        .from("custom_metrics")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({ title: "Success", description: "Metric deleted" });
      loadMetrics();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const metricTypes = [
    { value: 'count', label: 'Count', description: 'Count occurrences' },
    { value: 'sum', label: 'Sum', description: 'Sum values' },
    { value: 'avg', label: 'Average', description: 'Calculate average' },
    { value: 'ratio', label: 'Ratio', description: 'Calculate ratio between two values' },
    { value: 'formula', label: 'Custom Formula', description: 'Define custom calculation' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Custom Metrics</h2>
          <p className="text-muted-foreground">Define your own KPIs and calculations</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Metric
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Custom Metric</DialogTitle>
              <DialogDescription>
                Define a new metric to track in your analytics
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="metricName">Metric Name</Label>
                <Input
                  id="metricName"
                  placeholder="Critical Findings Rate"
                  value={newMetric.name}
                  onChange={(e) => setNewMetric({ ...newMetric, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="metricDescription">Description</Label>
                <Textarea
                  id="metricDescription"
                  placeholder="Percentage of critical findings out of total findings"
                  value={newMetric.description}
                  onChange={(e) => setNewMetric({ ...newMetric, description: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="metricType">Metric Type</Label>
                <Select
                  value={newMetric.metric_type}
                  onValueChange={(value) => setNewMetric({ ...newMetric, metric_type: value })}
                >
                  <SelectTrigger id="metricType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {metricTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <p className="font-medium">{type.label}</p>
                          <p className="text-xs text-muted-foreground">{type.description}</p>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="warning">Warning Threshold</Label>
                  <Input
                    id="warning"
                    type="number"
                    placeholder="50"
                    value={newMetric.threshold_warning}
                    onChange={(e) => setNewMetric({ ...newMetric, threshold_warning: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="critical">Critical Threshold</Label>
                  <Input
                    id="critical"
                    type="number"
                    placeholder="80"
                    value={newMetric.threshold_critical}
                    onChange={(e) => setNewMetric({ ...newMetric, threshold_critical: e.target.value })}
                  />
                </div>
              </div>

              <Button onClick={createMetric} className="w-full">
                Create Metric
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Metrics List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{metric.name}</CardTitle>
                  <CardDescription className="mt-1">{metric.description}</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteMetric(metric.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Type:</span>
                  <Badge variant="outline">
                    {metricTypes.find(t => t.value === metric.metric_type)?.label}
                  </Badge>
                </div>
                {metric.threshold_warning && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Warning at:</span>
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 text-yellow-600" />
                      <span>{metric.threshold_warning}</span>
                    </div>
                  </div>
                )}
                {metric.threshold_critical && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Critical at:</span>
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 text-destructive" />
                      <span>{metric.threshold_critical}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {metrics.length === 0 && (
          <Card className="col-span-2">
            <CardContent className="py-12 text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No custom metrics yet</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Metric
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
