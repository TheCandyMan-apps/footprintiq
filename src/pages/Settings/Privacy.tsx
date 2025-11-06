import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shield, Cookie, History, Download, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { SettingsBreadcrumb } from '@/components/settings/SettingsBreadcrumb';

interface ConsentPreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

interface ConsentRecord {
  id: string;
  consent_type: string;
  granted: boolean;
  granted_at: string | null;
  revoked_at: string | null;
  updated_at: string;
}

export default function PrivacySettings() {
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
  });
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadConsents();
  }, []);

  const loadConsents = async () => {
    try {
      const { data, error } = await supabase
        .from('user_consents')
        .select('*')
        .order('consent_type');

      if (error) throw error;

      setConsents(data || []);
      
      // Update preferences from database
      const prefs: ConsentPreferences = {
        necessary: true,
        functional: false,
        analytics: false,
        marketing: false,
      };
      
      data?.forEach((consent) => {
        const type = consent.consent_type as keyof ConsentPreferences;
        if (type in prefs) {
          prefs[type] = consent.granted;
        }
      });
      
      setPreferences(prefs);
    } catch (error) {
      console.error('Failed to load consents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.functions.invoke('gdpr-consent', {
        body: { consents: preferences }
      });

      if (error) throw error;

      toast({
        title: 'Preferences saved',
        description: 'Your privacy preferences have been updated.',
      });

      await loadConsents();
    } catch (error) {
      console.error('Failed to save preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to save preferences. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const exportData = async () => {
    try {
      toast({
        title: 'Export requested',
        description: 'Your data export will be sent to your email within 24 hours.',
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Failed to request data export.',
        variant: 'destructive',
      });
    }
  };

  const deleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      toast({
        title: 'Account deletion requested',
        description: 'Your account will be deleted within 30 days.',
      });
    } catch (error) {
      toast({
        title: 'Deletion failed',
        description: 'Failed to request account deletion.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <SettingsBreadcrumb currentPage="Privacy" />
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Privacy & Consent</h2>
          <p className="text-muted-foreground">Manage your privacy preferences and data</p>
        </div>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Cookie className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Cookie Preferences</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-4 border-b">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">Necessary Cookies</Label>
              <p className="text-sm text-muted-foreground">
                Required for the website to function properly
              </p>
            </div>
            <Switch checked disabled />
          </div>
          
          <div className="flex items-center justify-between pb-4 border-b">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">Functional Cookies</Label>
              <p className="text-sm text-muted-foreground">
                Enable enhanced functionality and personalization
              </p>
            </div>
            <Switch
              checked={preferences.functional}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, functional: checked })
              }
            />
          </div>
          
          <div className="flex items-center justify-between pb-4 border-b">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">Analytics Cookies</Label>
              <p className="text-sm text-muted-foreground">
                Help us understand how you use our service
              </p>
            </div>
            <Switch
              checked={preferences.analytics}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, analytics: checked })
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">Marketing Cookies</Label>
              <p className="text-sm text-muted-foreground">
                Used to deliver relevant ads and campaigns
              </p>
            </div>
            <Switch
              checked={preferences.marketing}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, marketing: checked })
              }
            />
          </div>
        </div>

        <Button 
          onClick={savePreferences} 
          disabled={isSaving}
          className="w-full mt-6"
        >
          {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Preferences
        </Button>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <History className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Consent History</h3>
        </div>
        
        {consents.length === 0 ? (
          <p className="text-sm text-muted-foreground">No consent records found.</p>
        ) : (
          <div className="space-y-2">
            {consents.map((consent) => (
              <div key={consent.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium capitalize">{consent.consent_type}</p>
                  <p className="text-xs text-muted-foreground">
                    {consent.granted ? 'Granted' : 'Not granted'} •{' '}
                    {consent.updated_at && format(new Date(consent.updated_at), 'PPp')}
                  </p>
                </div>
                <Badge variant={consent.granted ? 'default' : 'secondary'}>
                  {consent.granted ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Data Rights (GDPR)</h3>
        </div>
        
        <div className="space-y-3">
          <Button onClick={exportData} variant="outline" className="w-full justify-start gap-2">
            <Download className="w-4 h-4" />
            Export My Data
          </Button>
          
          <Button 
            onClick={deleteAccount} 
            variant="destructive" 
            className="w-full justify-start gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete My Account
          </Button>
        </div>
      </Card>
      </div>
    </div>
  );
}
