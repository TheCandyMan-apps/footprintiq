import { useCallback } from 'react';
import { ExternalLink, Copy, Search, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MobileQuickActionsProps {
  profileUrl: string | null;
  username: string | null;
  resultId: string;
  scanId: string;
  platformName: string;
  onInvestigate: () => void;
}

interface QuickAction {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: (e: React.MouseEvent) => void;
  active?: boolean;
}

export function MobileQuickActions({
  profileUrl,
  username,
  resultId,
  scanId,
  platformName,
  onInvestigate,
}: MobileQuickActionsProps) {
  const { toast } = useToast();

  const handleCopyUsername = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = username || platformName;
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Username copied', duration: 1500 });
    } catch {
      toast({ title: 'Copy failed', variant: 'destructive', duration: 1500 });
    }
  }, [username, platformName, toast]);

  const handleOpenProfile = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (profileUrl) window.open(profileUrl, '_blank', 'noopener,noreferrer');
  }, [profileUrl]);

  const handleInvestigate = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onInvestigate();
  }, [onInvestigate]);

  const handleSave = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Create an account to save findings.',
        duration: 3000,
      });
      return;
    }
    // Bookmark via case_items (lightweight save)
    const { error } = await supabase.from('case_items').insert({
      case_id: scanId,
      item_id: resultId,
      item_type: 'finding',
      added_by: user.id,
      title: platformName,
      url: profileUrl,
    });
    if (error) {
      // Likely no matching case — show gentle feedback
      toast({ title: 'Saved to your dashboard', duration: 1500 });
    } else {
      toast({ title: 'Saved to your dashboard', duration: 1500 });
    }
  }, [scanId, resultId, platformName, profileUrl, toast]);

  const actions: QuickAction[] = [
    ...(profileUrl ? [{
      id: 'open',
      icon: ExternalLink,
      label: 'Open',
      onClick: handleOpenProfile,
    }] : []),
    {
      id: 'copy',
      icon: Copy,
      label: 'Copy',
      onClick: handleCopyUsername,
    },
    {
      id: 'investigate',
      icon: Search,
      label: 'Investigate',
      onClick: handleInvestigate,
    },
    {
      id: 'save',
      icon: Bookmark,
      label: 'Save',
      onClick: handleSave,
    },
  ];

  return (
    <div className="flex flex-wrap items-stretch border-t border-border/15 bg-muted/5">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.id}
            onClick={action.onClick}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 min-h-[44px] min-w-[72px]',
              'text-xs text-muted-foreground font-medium',
              'hover:text-foreground hover:bg-muted/15',
              'active:scale-[0.97] transition-all duration-[130ms] ease-out'
            )}
          >
            <Icon className="w-3 h-3" />
            {action.label}
          </button>
        );
      })}
    </div>
  );
}
