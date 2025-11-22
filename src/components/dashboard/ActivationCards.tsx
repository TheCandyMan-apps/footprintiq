import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Rocket, Shield, CreditCard, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivationCardsProps {
  hasScan: boolean;
  hasMonitoring: boolean;
  creditBalance: number;
  className?: string;
}

export function ActivationCards({ hasScan, hasMonitoring, creditBalance, className }: ActivationCardsProps) {
  const navigate = useNavigate();

  // Don't show anything if user is fully activated
  if (hasScan && hasMonitoring && creditBalance > 20) {
    return null;
  }

  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-3", className)}>
      {!hasScan && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-primary" />
              <CardTitle>Run Your First Scan</CardTitle>
            </div>
            <CardDescription>
              Discover your digital footprint in minutes. Start with a simple username or email scan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/scan')} 
              className="w-full"
              size="lg"
            >
              Start First Scan
            </Button>
          </CardContent>
        </Card>
      )}

      {hasScan && !hasMonitoring && (
        <Card className="border-secondary/20 bg-gradient-to-br from-secondary/5 to-transparent">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-secondary" />
              <CardTitle>Set Up Monitoring</CardTitle>
            </div>
            <CardDescription>
              Get alerts when new data appears. Protect your identity 24/7 with continuous monitoring.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/monitoring')} 
              variant="secondary"
              className="w-full"
              size="lg"
            >
              Enable Monitoring
            </Button>
          </CardContent>
        </Card>
      )}

      {creditBalance <= 20 && (
        <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-accent" />
              <CardTitle>{creditBalance === 0 ? 'Credits Depleted' : 'Low Credit Balance'}</CardTitle>
            </div>
            <CardDescription>
              {creditBalance === 0 
                ? 'Top up to continue scanning and monitoring your digital footprint.'
                : `You have ${creditBalance} credits remaining. Top up to avoid interruptions.`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button 
                onClick={() => navigate('/settings/credits')} 
                variant="outline"
                className="flex-1"
              >
                Buy Credits
              </Button>
              <Button 
                onClick={() => navigate('/pricing')} 
                className="flex-1"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Upgrade
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
