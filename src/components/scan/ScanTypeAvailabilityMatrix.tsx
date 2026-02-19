import { Check, X, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PlanId } from "@/lib/billing/tiers";

interface ScanTypeAvailability {
  type: string;
  label: string;
  description: string;
  tiers: Record<PlanId, { available: boolean; note?: string }>;
}

const SCAN_TYPES: ScanTypeAvailability[] = [
  {
    type: 'username',
    label: 'Username',
    description: 'Social media & platform presence',
    tiers: {
      free: { available: true, note: 'Maigret' },
      pro: { available: true, note: 'Maigret + Sherlock' },
      pro_annual: { available: true, note: 'Maigret + Sherlock' },
      business: { available: true, note: 'Full suite + GoSearch' },
    },
  },
  {
    type: 'email',
    label: 'Email',
    description: 'Breach checks & account detection',
    tiers: {
      free: { available: true, note: 'Holehe only' },
      pro: { available: true, note: 'IPQS + Holehe' },
      pro_annual: { available: true, note: 'IPQS + Holehe' },
      business: { available: true, note: 'Full enrichment' },
    },
  },
  {
    type: 'phone',
    label: 'Phone',
    description: 'Carrier & registration lookup',
    tiers: {
      free: { available: false },
      pro: { available: true, note: 'IPQS Phone' },
      pro_annual: { available: true, note: 'IPQS Phone' },
      business: { available: true, note: 'Full intel' },
    },
  },
  {
    type: 'domain',
    label: 'Domain',
    description: 'DNS, WHOIS & infrastructure',
    tiers: {
      free: { available: false },
      pro: { available: true, note: 'Basic lookup' },
      pro_annual: { available: true, note: 'Basic lookup' },
      business: { available: true, note: 'Deep analysis' },
    },
  },
];

const TIER_CONFIG: Record<PlanId, { label: string; color: string }> = {
  free: { label: 'Free', color: 'text-muted-foreground' },
  pro: { label: 'Pro', color: 'text-primary' },
  pro_annual: { label: 'Pro Annual', color: 'text-primary' },
  business: { label: 'Business', color: 'text-amber-600' },
};

interface ScanTypeAvailabilityMatrixProps {
  currentTier?: PlanId;
  compact?: boolean;
}

export function ScanTypeAvailabilityMatrix({ 
  currentTier = 'free',
  compact = false 
}: ScanTypeAvailabilityMatrixProps) {
  const tiers: PlanId[] = ['free', 'pro', 'business'];

  if (compact) {
    return (
      <div className="grid grid-cols-4 gap-2 text-xs">
        <div className="font-medium text-muted-foreground">Scan Type</div>
        {tiers.map((tier) => (
          <div 
            key={tier} 
            className={cn(
              "font-medium text-center",
              TIER_CONFIG[tier].color,
              currentTier === tier && "underline underline-offset-2"
            )}
          >
            {TIER_CONFIG[tier].label}
          </div>
        ))}
        {SCAN_TYPES.map((scanType) => (
          <>
            <div key={scanType.type} className="text-muted-foreground">
              {scanType.label}
            </div>
            {tiers.map((tier) => {
              const availability = scanType.tiers[tier];
              return (
                <div key={`${scanType.type}-${tier}`} className="flex justify-center">
                  {availability.available ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <X className="w-4 h-4 text-muted-foreground/50" />
                  )}
                </div>
              );
            })}
          </>
        ))}
      </div>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          Scan Type Availability
          {currentTier && (
            <Badge variant="outline" className="text-xs font-normal">
              Your plan: {TIER_CONFIG[currentTier].label}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-2 pr-4 font-medium text-muted-foreground">
                  Scan Type
                </th>
                {tiers.map((tier) => (
                  <th 
                    key={tier} 
                    className={cn(
                      "text-center py-2 px-3 font-medium",
                      TIER_CONFIG[tier].color,
                      currentTier === tier && "bg-primary/5 rounded-t-md"
                    )}
                  >
                    {TIER_CONFIG[tier].label}
                    {currentTier === tier && (
                      <span className="block text-[10px] text-muted-foreground font-normal">
                        (current)
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SCAN_TYPES.map((scanType, idx) => (
                <tr 
                  key={scanType.type}
                  className={cn(
                    "border-b border-border/30 last:border-0",
                    idx % 2 === 0 && "bg-muted/20"
                  )}
                >
                  <td className="py-3 pr-4">
                    <div className="font-medium">{scanType.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {scanType.description}
                    </div>
                  </td>
                  {tiers.map((tier) => {
                    const availability = scanType.tiers[tier];
                    const isCurrentTier = currentTier === tier;
                    const isLocked = !availability.available && tier !== 'free';
                    
                    return (
                      <td 
                        key={`${scanType.type}-${tier}`}
                        className={cn(
                          "text-center py-3 px-3",
                          isCurrentTier && "bg-primary/5"
                        )}
                      >
                        {availability.available ? (
                          <div className="flex flex-col items-center gap-1">
                            <Check className="w-5 h-5 text-green-600" />
                            {availability.note && (
                              <span className="text-[10px] text-muted-foreground">
                                {availability.note}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            {isLocked ? (
                              <Lock className="w-4 h-4 text-muted-foreground/40" />
                            ) : (
                              <X className="w-5 h-5 text-muted-foreground/40" />
                            )}
                            <span className="text-[10px] text-muted-foreground/60">
                              —
                            </span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
