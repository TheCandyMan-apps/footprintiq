import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skull, Bell, Shield, AlertTriangle } from 'lucide-react';
import { useDarkWebMonitor } from '@/hooks/useDarkWebMonitor';

export const DarkWebMonitorSettings = () => {
  const { enabled, toggleMonitoring, newFindingsCount } = useDarkWebMonitor();

  return (
    <Card className="border-destructive/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Skull className="w-5 h-5 text-destructive" />
              <div className="absolute inset-0 bg-destructive/20 rounded-full blur-md animate-pulse" />
            </div>
            <CardTitle>Dark Web Monitoring</CardTitle>
          </div>
          {enabled && newFindingsCount > 0 && (
            <Badge className="bg-destructive text-white animate-pulse">
              {newFindingsCount} new alerts
            </Badge>
          )}
        </div>
        <CardDescription>
          Get instant alerts when your information appears on dark web sources
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="darkweb-monitor" className="text-base">
              Enable Dark Web Monitoring
            </Label>
            <div className="text-sm text-muted-foreground">
              Receive real-time notifications about dark web findings
            </div>
          </div>
          <Switch
            id="darkweb-monitor"
            checked={enabled}
            onCheckedChange={toggleMonitoring}
          />
        </div>

        {enabled && (
          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
              <Bell className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">Real-time Alerts</p>
                <p className="text-xs text-muted-foreground">
                  You'll receive browser notifications and in-app alerts when new findings are detected
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
              <Shield className="w-5 h-5 text-accent mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">Continuous Protection</p>
                <p className="text-xs text-muted-foreground">
                  We monitor dark web sources 24/7 to detect any mentions of your data
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-destructive">Privacy Notice</p>
                <p className="text-xs text-muted-foreground">
                  Dark web monitoring searches publicly available breach databases and forums. 
                  We never access illegal marketplaces or engage in any unlawful activities.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
