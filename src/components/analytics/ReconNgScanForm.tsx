import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useActiveScanContext } from '@/contexts/ActiveScanContext';
import { Loader2, Shield, Zap, Crown } from 'lucide-react';
import { useUserPersona } from '@/hooks/useUserPersona';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const MODULE_PRESETS: Record<string, string[]> = {
  username: ['recon/profiles-profiles/twitter_mention', 'recon/profiles-profiles/namechk'],
  email: ['recon/contacts-contacts/pgp_search', 'recon/contacts-contacts/haveibeenpwned'],
  ip: ['recon/hosts-hosts/reverse_resolve', 'recon/hosts-hosts/shodan_ip'],
  domain: ['recon/domains-hosts/google_site_web', 'recon/domains-contacts/whois_pocs'],
};

export function ReconNgScanForm({ workspaceId }: { workspaceId: string }) {
  const [target, setTarget] = useState('');
  const [targetType, setTargetType] = useState<'username' | 'email' | 'ip' | 'domain'>('username');
  const [modules, setModules] = useState<string[]>([]);
  const [scanning, setScanning] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const { toast } = useToast();
  const { startTracking } = useActiveScanContext();
  const { isStandard } = useUserPersona();
  const navigate = useNavigate();

  const handleStartScan = () => {
    if (!target.trim()) {
      toast({
        title: 'Target Required',
        description: 'Please enter a target to scan',
        variant: 'destructive',
      });
      return;
    }
    setShowConsent(true);
  };

  const handleConfirmScan = async () => {
    setShowConsent(false);
    setScanning(true);

    try {
      const { data, error } = await supabase.functions.invoke('recon-ng-scan', {
        body: {
          workspaceId,
          target,
          targetType,
          modules: modules.length > 0 ? modules : MODULE_PRESETS[targetType],
        },
      });

      if (error) throw error;

      const scanId = data.scanId;

      // Start tracking in progress tracker
      startTracking({
        scanId,
        type: 'recon-ng',
        target,
        startedAt: new Date().toISOString(),
      });

      toast({
        title: 'Scan Started',
        description: 'Recon-ng scan initiated successfully',
      });

      // Reset form
      setTarget('');
      setModules([]);
    } catch (error: any) {
      console.error('Scan error:', error);
      toast({
        title: 'Scan Failed',
        description: error.message || 'Failed to start scan',
        variant: 'destructive',
      });
    } finally {
      setScanning(false);
    }
  };

  if (isStandard) {
    return (
      <Card className="p-8 border-2 border-primary/20">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
            <Crown className="h-8 w-8 text-primary" />
          </div>
          
          <div>
            <h3 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Recon-ng Intelligence
              <span className="text-xs bg-gradient-to-r from-primary to-accent text-primary-foreground px-2 py-1 rounded-full">
                Premium
              </span>
            </h3>
            <p className="text-muted-foreground text-lg">
              Upgrade for 100+ module recon!
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-primary mt-1" />
              <div>
                <p className="font-semibold">100+ Recon Modules</p>
                <p className="text-sm text-muted-foreground">Profile, domain, host intelligence</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-1" />
              <div>
                <p className="font-semibold">Correlation Engine</p>
                <p className="text-sm text-muted-foreground">Link discoveries across sources</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-primary mt-1" />
              <div>
                <p className="font-semibold">Passive OSINT</p>
                <p className="text-sm text-muted-foreground">Ethical, non-invasive scanning</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-1" />
              <div>
                <p className="font-semibold">Save to Cases</p>
                <p className="text-sm text-muted-foreground">Track investigations seamlessly</p>
              </div>
            </div>
          </div>

          <Button
            size="lg"
            onClick={() => navigate('/pricing')}
            className="w-full max-w-xs"
          >
            <Crown className="mr-2 h-5 w-5" />
            Upgrade to Premium
          </Button>

          <p className="text-xs text-muted-foreground">
            Start your 14-day free trial • Cancel anytime
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Recon-ng Intelligence Scan</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Execute passive reconnaissance using 100+ Recon-ng modules
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="target">Target</Label>
            <Input
              id="target"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Enter target (username, email, IP, domain)"
              disabled={scanning}
            />
          </div>

          <div>
            <Label htmlFor="targetType">Target Type</Label>
            <Select value={targetType} onValueChange={(v: any) => setTargetType(v)} disabled={scanning}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="username">Username</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="ip">IP Address</SelectItem>
                <SelectItem value="domain">Domain</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Modules (Default: Best for target type)</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Leave empty to use recommended modules
            </p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {MODULE_PRESETS[targetType]?.map((module) => (
                <div key={module} className="flex items-center space-x-2">
                  <Checkbox
                    id={module}
                    checked={modules.includes(module)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setModules([...modules, module]);
                      } else {
                        setModules(modules.filter((m) => m !== module));
                      }
                    }}
                    disabled={scanning}
                  />
                  <Label htmlFor={module} className="text-sm cursor-pointer">
                    {module}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Button
          onClick={handleStartScan}
          disabled={scanning || !target.trim()}
          className="w-full"
        >
          {scanning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Starting Scan...
            </>
          ) : (
            <>
              <Shield className="mr-2 h-4 w-4" />
              Start Recon-ng Scan (10 Credits)
            </>
          )}
        </Button>
      </Card>

      <AlertDialog open={showConsent} onOpenChange={setShowConsent}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Ethical OSINT Consent
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                This scan uses <strong>passive-only</strong> reconnaissance methods through Recon-ng.
              </p>
              <p>
                <strong>Intended for:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>OSINT research purposes</li>
                <li>Privacy awareness and protection</li>
                <li>Authorized security assessments</li>
              </ul>
              <p className="text-xs text-muted-foreground">
                By continuing, you confirm you have proper authorization and will use results ethically.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmScan}>
              I Understand & Accept
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
