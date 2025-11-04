import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { X, Cookie, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ConsentPreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

const CONSENT_STORAGE_KEY = 'footprintiq_consent';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    necessary: true, // Always true, cannot be disabled
    functional: false,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const storedConsent = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!storedConsent) {
      setIsVisible(true);
    }
  }, []);

  const saveConsent = async (prefs: ConsentPreferences) => {
    const consentData = {
      ...prefs,
      timestamp: new Date().toISOString(),
    };
    
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consentData));
    
    // Save to database if user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      try {
      const { error } = await supabase.functions.invoke('gdpr-consent', {
        body: { consents: prefs }
      });
      } catch (error) {
        console.error('Failed to save consent to database:', error);
      }
    }
    
    setIsVisible(false);
  };

  const acceptAll = () => {
    const allAccepted: ConsentPreferences = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    setPreferences(allAccepted);
    saveConsent(allAccepted);
  };

  const acceptNecessary = () => {
    const necessaryOnly: ConsentPreferences = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    };
    setPreferences(necessaryOnly);
    saveConsent(necessaryOnly);
  };

  const saveCustom = () => {
    saveConsent(preferences);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6">
        <Card className="max-w-4xl mx-auto p-6 shadow-2xl border-primary/20">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <Cookie className="w-8 h-8 text-primary" />
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Your Privacy Matters
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    We use cookies to enhance your experience. You can customize your preferences below.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={acceptNecessary}
                  className="flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {showDetails && (
                <div className="space-y-3 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="font-medium">Necessary Cookies</Label>
                      <p className="text-xs text-muted-foreground">
                        Required for the website to function properly
                      </p>
                    </div>
                    <Switch checked disabled />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="font-medium">Functional Cookies</Label>
                      <p className="text-xs text-muted-foreground">
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
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="font-medium">Analytics Cookies</Label>
                      <p className="text-xs text-muted-foreground">
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
                      <Label className="font-medium">Marketing Cookies</Label>
                      <p className="text-xs text-muted-foreground">
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
              )}

              <div className="flex flex-wrap gap-2">
                <Button onClick={acceptAll} size="sm">
                  Accept All
                </Button>
                <Button onClick={acceptNecessary} variant="outline" size="sm">
                  Necessary Only
                </Button>
                {showDetails && (
                  <Button onClick={saveCustom} variant="outline" size="sm">
                    Save Preferences
                  </Button>
                )}
                <Button
                  onClick={() => setShowDetails(!showDetails)}
                  variant="ghost"
                  size="sm"
                >
                  {showDetails ? 'Hide' : 'Customize'}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
