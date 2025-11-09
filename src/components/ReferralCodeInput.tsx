import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Check, Loader2 } from 'lucide-react';

interface ReferralCodeInputProps {
  onSuccess?: () => void;
}

export function ReferralCodeInput({ onSuccess }: ReferralCodeInputProps) {
  const { toast } = useToast();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(false);

  // Check URL for referral code
  useState(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
      setCode(refCode);
    }
  });

  const applyCode = async () => {
    if (!code.trim()) return;

    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('referral-manage', {
        body: { 
          action: 'apply_code',
          code: code.toUpperCase() 
        },
      });

      if (error) throw error;

      setApplied(true);
      toast({
        title: 'Referral code applied!',
        description: data.message || 'Complete your first scan to earn bonus credits',
      });

      if (onSuccess) {
        onSuccess();
      }

      // Clear URL parameter
      const url = new URL(window.location.href);
      url.searchParams.delete('ref');
      window.history.replaceState({}, '', url.toString());

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to apply referral code',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (applied) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <Check className="h-4 w-4" />
        <span>Referral code applied successfully!</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="referral-code" className="text-sm">
        Have a referral code? (Optional)
      </Label>
      <div className="flex gap-2">
        <Input
          id="referral-code"
          placeholder="Enter code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          disabled={loading}
          className="font-mono"
          maxLength={20}
        />
        <Button
          onClick={applyCode}
          disabled={loading || !code.trim()}
          size="sm"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Applying...
            </>
          ) : (
            'Apply'
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Get 50 bonus credits when you complete your first scan
      </p>
    </div>
  );
}
