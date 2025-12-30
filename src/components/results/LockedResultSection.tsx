import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, TrendingUp, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ProUpgradeModal } from "./ProUpgradeModal";
import { ViralSharePrompt } from "@/components/growth/ViralSharePrompt";
import { useEmailVerification } from "@/hooks/useEmailVerification";
import { EmailVerificationBanner } from "@/components/auth/EmailVerificationBanner";

export type LockedSectionType = 
  | 'context'
  | 'evidence'
  | 'confidence'
  | 'correlation'
  | 'darkweb'
  | 'ai_analysis';

interface SectionConfig {
  title: string;
  description: string;
  valueProposition: string;
  microcopy: string;
}

const SECTION_CONFIG: Record<LockedSectionType, SectionConfig> = {
  context: {
    title: 'Context Enrichment',
    description: 'Understand the significance of each exposure with enriched context.',
    valueProposition: 'See where your data appears and why it matters',
    microcopy: 'Context helps distinguish real matches from noise.',
  },
  evidence: {
    title: 'Evidence & Source Detail',
    description: 'View full source URLs and evidence supporting each finding.',
    valueProposition: 'Verify findings with direct source access',
    microcopy: 'Most people don\'t realise this information is publicly accessible.',
  },
  confidence: {
    title: 'Confidence Scoring',
    description: 'Reduce false positives with advanced match confidence analysis.',
    valueProposition: 'Know which findings need attention first',
    microcopy: 'False positives happen — validation matters.',
  },
  correlation: {
    title: 'Correlation Analysis',
    description: 'See how your data points connect across sources.',
    valueProposition: 'Understand your combined exposure risk',
    microcopy: 'Attackers rely on correlation, not hacking.',
  },
  darkweb: {
    title: 'Dark Web Indicators',
    description: 'Monitor for mentions of your data on dark web forums and markets.',
    valueProposition: 'Get alerted to underground exposure',
    microcopy: 'Public data becomes risky when it reaches the dark web.',
  },
  ai_analysis: {
    title: 'AI Interpretation',
    description: 'Get AI-powered analysis of your exposure and recommended actions.',
    valueProposition: 'Receive investigator-grade clarity',
    microcopy: 'AI helps prioritise what matters most.',
  },
};

interface LockedResultSectionProps {
  type: LockedSectionType;
  icon?: LucideIcon;
  className?: string;
  /** Content to show blurred behind the lock */
  children?: React.ReactNode;
  /** Compact mode for inline sections */
  compact?: boolean;
  /** Scan ID for analytics tracking */
  scanId?: string;
}

/**
 * LockedResultSection - Shows blurred/collapsed content with Pro upgrade CTA.
 * Used for gating advanced result sections for free users.
 */
export function LockedResultSection({
  type,
  icon: IconComponent,
  className,
  children,
  compact = false,
  scanId,
}: LockedResultSectionProps) {
  const [showModal, setShowModal] = useState(false);
  const { isVerified, isLoading: verificationLoading } = useEmailVerification();
  const config = SECTION_CONFIG[type];

  // Show verification banner instead of Pro upgrade if not verified
  const shouldShowVerification = !verificationLoading && !isVerified;

  const handleUpgrade = () => {
    setShowModal(true);
  };

  if (compact) {
    return (
      <div className={cn(
        "relative rounded-lg border border-border/50 overflow-hidden",
        className
      )}>
        {/* Blurred content preview */}
        {children && (
          <div className="blur-sm opacity-40 pointer-events-none select-none p-4">
            {children}
          </div>
        )}
        
        {/* Overlay */}
        <div className={cn(
          "flex items-center gap-3 p-3 bg-muted/50",
          children && "absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-[1px]"
        )}>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4 text-primary/70" />
            <span className="font-medium">{config.title}</span>
            <span className="text-muted-foreground/70">· Available in Pro</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUpgrade}
            className="ml-auto text-primary hover:text-primary/80"
          >
            Unlock Full Analysis
          </Button>
        </div>
        <ProUpgradeModal open={showModal} onOpenChange={setShowModal} />
      </div>
    );
  }

  return (
    <Card className={cn(
      "relative overflow-hidden",
      className
    )}>
      {/* Blurred content preview */}
      {children ? (
        <div className="blur-sm opacity-40 pointer-events-none select-none">
          {children}
        </div>
      ) : (
        <div className="blur-sm opacity-40 pointer-events-none select-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              {IconComponent && <IconComponent className="h-5 w-5" />}
              {config.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="h-6 bg-gradient-to-r from-muted/40 to-muted/20 rounded animate-pulse" />
              <div className="h-16 bg-gradient-to-r from-muted/30 to-muted/10 rounded" />
              <div className="h-4 w-2/3 bg-gradient-to-r from-muted/20 to-muted/5 rounded" />
            </div>
          </CardContent>
        </div>
      )}
      
      {/* Overlay with upgrade CTA or verification banner */}
      <div className="absolute inset-0 flex items-center justify-center bg-background/75 backdrop-blur-[2px]">
        {shouldShowVerification ? (
          <div className="p-4 max-w-[320px]">
            <EmailVerificationBanner placement="locked_section" />
          </div>
        ) : (
          <div className="text-center p-6 max-w-[280px]">
            {/* Lock icon */}
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            
            {/* Section title */}
            <p className="font-semibold text-base mb-1">{config.title}</p>
            
            {/* Value proposition */}
            <p className="text-sm text-muted-foreground mb-2">
              {config.valueProposition}
            </p>
            
            {/* Description */}
            <p className="text-xs text-muted-foreground/80 mb-4">
              {config.description}
            </p>
            
            {/* CTA Button */}
            <Button 
              onClick={handleUpgrade}
              className="w-full"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Unlock Full Analysis
            </Button>
            
            {/* Viral share prompt - compact variant inside locked overlay */}
            <ViralSharePrompt 
              compact 
              placement="locked_overlay" 
              scanId={scanId}
            />
            
            {/* Educational microcopy */}
            <p className="text-[10px] text-muted-foreground/60 mt-4 italic">
              {config.microcopy}
            </p>
          </div>
        )}
      </div>
      <ProUpgradeModal open={showModal} onOpenChange={setShowModal} />
    </Card>
  );
}

/**
 * Grid of all locked sections - for showing what free users are missing
 */
export function LockedSectionsGrid({ className }: { className?: string }) {
  const sections: LockedSectionType[] = [
    'context',
    'evidence', 
    'confidence',
    'correlation',
    'darkweb',
    'ai_analysis',
  ];

  return (
    <div className={cn("grid md:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
      {sections.map((type) => (
        <LockedResultSection key={type} type={type} />
      ))}
    </div>
  );
}
