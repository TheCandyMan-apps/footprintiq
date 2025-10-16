import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { enableMonitoring } from "@/lib/monitoring";

interface MonitoringToggleProps {
  scanId: string;
  userId: string;
}

export const MonitoringToggle = ({ scanId, userId }: MonitoringToggleProps) => {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleToggle = async (checked: boolean) => {
    setLoading(true);
    try {
      if (checked) {
        const { error } = await enableMonitoring(scanId, userId);
        if (error) throw error;
        
        toast({
          title: "Monitoring Enabled",
          description: "We'll alert you when new data exposures are detected.",
        });
      } else {
        toast({
          title: "Monitoring Disabled",
          description: "You won't receive alerts for this scan anymore.",
        });
      }
      setEnabled(checked);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Continuous Monitoring
        </CardTitle>
        <CardDescription>
          Get notified when new data exposures are detected (Pro feature)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <Label htmlFor="monitoring" className="cursor-pointer">
              Enable Alerts
            </Label>
          </div>
          <Switch
            id="monitoring"
            checked={enabled}
            onCheckedChange={handleToggle}
            disabled={loading}
          />
        </div>
      </CardContent>
    </Card>
  );
};