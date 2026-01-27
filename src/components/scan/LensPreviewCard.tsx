import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Shield, 
  Lock, 
  ArrowRight, 
  Loader2,
  CheckCircle,
  HelpCircle,
  XCircle
} from 'lucide-react';
import { useLensPreview, LensConfidenceLevel, LensPreviewResult } from '@/hooks/useLensPreview';
import { AggregatedProfile } from '@/lib/results/resultsAggregator';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface LensPreviewCardProps {
  profiles: AggregatedProfile[];
  scanId: string;
}

const CONFIDENCE_CONFIG: Record<LensConfidenceLevel, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  className: string;
  description: string;
}> = {
  likely: {
    label: 'Likely Connected',
    icon: CheckCircle,
    className: 'text-green-600 dark:text-green-400',
    description: 'Strong indicators suggest this profile belongs to the same person.',
  },
  unclear: {
    label: 'Unclear',
    icon: HelpCircle,
    className: 'text-amber-600 dark:text-amber-400',
    description: 'Insufficient evidence to confirm or rule out a connection.',
  },
  unlikely: {
    label: 'Unlikely Connected',
    icon: XCircle,
    className: 'text-muted-foreground',
    description: 'Available signals suggest this may be a different individual.',
  },
};

export function LensPreviewCard({ profiles, scanId }: LensPreviewCardProps) {
  const navigate = useNavigate();
  const { 
    hasUsedPreview, 
    isLoading, 
    isVerifying, 
    previewResult, 
    verifyProfile 
  } = useLensPreview();
  
  const [selectedProfile, setSelectedProfile] = useState<AggregatedProfile | null>(null);
  const [showProfileSelector, setShowProfileSelector] = useState(false);

  const handleStartVerification = () => {
    if (profiles.length === 1) {
      // If only one profile, verify it directly
      handleVerifyProfile(profiles[0]);
    } else {
      // Show profile selector
      setShowProfileSelector(true);
    }
  };

  const handleVerifyProfile = async (profile: AggregatedProfile) => {
    setSelectedProfile(profile);
    setShowProfileSelector(false);
    
    await verifyProfile({
      id: profile.id,
      platform: profile.platform,
      username: profile.username,
      url: profile.url,
      scanId,
    });
  };

  const handleUpgradeClick = () => {
    navigate('/pricing');
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-5 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Already used preview - show locked state with result or upgrade prompt
  if (hasUsedPreview) {
    return (
      <Card className="overflow-hidden border-border/50">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">LENS Verification</h3>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
              Preview used
            </Badge>
          </div>

          {/* Show the result if we have one */}
          {previewResult && (
            <LensResultDisplay result={previewResult} />
          )}

          {/* Upgrade prompt */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-dashed border-border/50">
            <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                Upgrade to Pro to verify all findings with LENS.
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="shrink-0 gap-1.5"
              onClick={handleUpgradeClick}
            >
              Upgrade
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Profile selector modal-like state
  if (showProfileSelector) {
    return (
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Select a profile to verify</h3>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Choose one profile to verify with LENS. This is your one-time free preview.
          </p>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {profiles.slice(0, 5).map((profile) => (
              <button
                key={profile.id}
                onClick={() => handleVerifyProfile(profile)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg border transition-colors",
                  "hover:bg-primary/5 hover:border-primary/30",
                  "bg-muted/20 border-border/30"
                )}
              >
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {profile.platform.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="text-sm font-medium truncate">{profile.platform}</div>
                  <div className="text-xs text-muted-foreground truncate">{profile.username}</div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </button>
            ))}
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full"
            onClick={() => setShowProfileSelector(false)}
          >
            Cancel
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Verifying state
  if (isVerifying) {
    return (
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">LENS Verification</h3>
          </div>

          <div className="flex flex-col items-center py-6 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center">
              <p className="text-sm font-medium">Analyzing profile...</p>
              {selectedProfile && (
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedProfile.platform} • {selectedProfile.username}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default state - show verification preview offer
  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">LENS Verification (preview)</h3>
        </div>

        <p className="text-sm text-muted-foreground">
          Not all findings are equally relevant. LENS helps assess whether a profile is likely connected.
        </p>

        <div className="flex items-center gap-2 text-[10px] text-muted-foreground/70">
          <Shield className="h-2.5 w-2.5" />
          <span>One-time free preview</span>
        </div>

        <Button 
          className="w-full gap-2" 
          size="sm"
          onClick={handleStartVerification}
          disabled={profiles.length === 0}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Verify one profile (free preview)
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Display the LENS verification result
 */
function LensResultDisplay({ result }: { result: LensPreviewResult }) {
  const config = CONFIDENCE_CONFIG[result.confidenceLevel];
  const Icon = config.icon;

  return (
    <div className="rounded-lg border border-border/50 bg-muted/20 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Icon className={cn("h-5 w-5", config.className)} />
        <span className={cn("text-sm font-semibold", config.className)}>
          {config.label}
        </span>
      </div>

      <p className="text-sm text-foreground leading-relaxed">
        {result.explanation}
      </p>

      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
        <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4">
          {result.platform}
        </Badge>
        <span>•</span>
        <span>Verified {new Date(result.verifiedAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
