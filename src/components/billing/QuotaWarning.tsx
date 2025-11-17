import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { canRunScan } from '@/lib/billing/quotas';
import { getPlan } from '@/lib/billing/tiers';

interface QuotaWarningProps {
  workspace: any;
  onUpgrade?: () => void;
}

export function QuotaWarning({ workspace, onUpgrade }: QuotaWarningProps) {
  const navigate = useNavigate();
  const quotaCheck = canRunScan(workspace);
  const currentPlan = getPlan(workspace?.plan);

  if (quotaCheck.allowed) return null;

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      navigate('/settings/billing');
    }
  };

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>{quotaCheck.message}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleUpgrade}
          className="ml-4"
        >
          <TrendingUp className="h-4 w-4 mr-1" />
          Upgrade Now
        </Button>
      </AlertDescription>
    </Alert>
  );
}

interface QuotaUsageProps {
  workspace: any;
  compact?: boolean;
}

export function QuotaUsage({ workspace, compact = false }: QuotaUsageProps) {
  const quotaCheck = canRunScan(workspace);
  const currentPlan = getPlan(workspace?.plan);
  
  const scansUsed = quotaCheck.scansUsed || 0;
  const scansLimit = quotaCheck.scansLimit;
  const usagePercent = scansLimit 
    ? Math.min((scansUsed / scansLimit) * 100, 100)
    : 0;
  const isHighUsage = usagePercent >= 80;

  if (scansLimit === null) {
    return compact ? (
      <span className="text-sm text-muted-foreground">
        {scansUsed} scans (unlimited)
      </span>
    ) : (
      <div className="text-sm text-muted-foreground">
        <div className="font-medium">Unlimited Scans</div>
        <div className="text-xs">{scansUsed} scans this month</div>
      </div>
    );
  }

  return compact ? (
    <span className={`text-sm ${isHighUsage ? 'text-destructive' : 'text-muted-foreground'}`}>
      {scansUsed} / {scansLimit} scans
    </span>
  ) : (
    <div className="text-sm">
      <div className={`font-medium ${isHighUsage ? 'text-destructive' : ''}`}>
        {scansUsed} of {scansLimit} scans used
      </div>
      <div className="text-xs text-muted-foreground">
        {100 - Math.round(usagePercent)}% remaining this month
      </div>
    </div>
  );
}
