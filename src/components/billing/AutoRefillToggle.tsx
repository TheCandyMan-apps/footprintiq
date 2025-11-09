import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Zap, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/hooks/useWorkspace';

interface AutoRefillToggleProps {
  isPro?: boolean;
}

export function AutoRefillToggle({ isPro = false }: AutoRefillToggleProps) {
  const { workspace } = useWorkspace();
  const [enabled, setEnabled] = useState(false);
  const [threshold, setThreshold] = useState(50);
  const [packageId, setPackageId] = useState('osint-pro');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!workspace?.id) return;
    
    // Load saved settings
    const loadSettings = async () => {
      const { data } = await supabase
        .from('workspace_settings')
        .select('auto_refill_enabled, auto_refill_threshold, auto_refill_package')
        .eq('workspace_id', workspace.id)
        .maybeSingle();
      
      if (data) {
        setEnabled(data.auto_refill_enabled || false);
        setThreshold(data.auto_refill_threshold || 50);
        setPackageId(data.auto_refill_package || 'osint-pro');
      }
    };
    
    loadSettings();
  }, [workspace?.id]);

  const handleSave = async () => {
    if (!workspace?.id) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('workspace_settings')
        .upsert({
          workspace_id: workspace.id,
          auto_refill_enabled: enabled,
          auto_refill_threshold: threshold,
          auto_refill_package: packageId,
        });
      
      if (error) throw error;
      
      toast.success('Auto-refill settings saved');
    } catch (error) {
      console.error('Error saving auto-refill settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  if (!isPro) {
    return (
      <Card className="p-6 bg-muted/50">
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 text-muted-foreground mt-0.5" />
          <div>
            <h3 className="font-semibold mb-1">Auto-Refill Credits</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Automatically purchase credits when your balance runs low
            </p>
            <Badge variant="secondary">Pro Feature</Badge>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">Auto-Refill Credits</h3>
              <p className="text-sm text-muted-foreground">
                Never run out of credits during important investigations
              </p>
            </div>
          </div>
          <Switch 
            checked={enabled} 
            onCheckedChange={setEnabled}
          />
        </div>

        {enabled && (
          <div className="pl-8 space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="threshold">Refill when balance drops below</Label>
              <Input
                id="threshold"
                type="number"
                min="10"
                max="500"
                value={threshold}
                onChange={(e) => setThreshold(parseInt(e.target.value) || 50)}
                className="max-w-xs"
              />
              <p className="text-xs text-muted-foreground">
                We'll automatically purchase more credits when you reach this threshold
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="package">Credit Package</Label>
              <Select value={packageId} onValueChange={setPackageId}>
                <SelectTrigger id="package" className="max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="osint-pro">OSINT Pro - 500 credits ($350)</SelectItem>
                  <SelectItem value="investigator">Investigator - 100 credits ($75)</SelectItem>
                  <SelectItem value="enterprise">Enterprise - 1000 credits ($600)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
              <Info className="w-4 h-4 text-muted-foreground mt-0.5" />
              <p className="text-xs text-muted-foreground">
                Payment will be processed automatically using your saved payment method. 
                You'll receive an email notification before each purchase.
              </p>
            </div>

            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Auto-Refill Settings'}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
