import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { AlertCircle, TestTube } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const TestModeToggle = () => {
  const [testMode, setTestMode] = useState(
    localStorage.getItem('stripe_test_mode') === 'true'
  );

  const handleToggle = (enabled: boolean) => {
    setTestMode(enabled);
    localStorage.setItem('stripe_test_mode', enabled.toString());
    
    if (enabled) {
      // In test mode, we'd typically use different Stripe keys
      console.log('Test mode enabled - using test Stripe keys');
    }
  };

  return (
    <Card className="p-4 border-dashed">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TestTube className="w-5 h-5 text-muted-foreground" />
          <Label htmlFor="test-mode" className="cursor-pointer">
            Test Mode
          </Label>
        </div>
        <Switch
          id="test-mode"
          checked={testMode}
          onCheckedChange={handleToggle}
        />
      </div>
      
      {testMode && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Test mode enabled. Use test card: 4242 4242 4242 4242
          </AlertDescription>
        </Alert>
      )}
      
      <p className="text-xs text-muted-foreground mt-2">
        Enable to test payments without real charges. Use Stripe test cards.
      </p>
    </Card>
  );
};
