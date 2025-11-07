import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Zap, Building2, Check } from "lucide-react";

export type Persona = 'standard' | 'advanced' | 'enterprise';

interface PersonaSelectorModalProps {
  open: boolean;
  onSelect: (persona: Persona) => void;
  loading?: boolean;
}

export function PersonaSelectorModal({ open, onSelect, loading }: PersonaSelectorModalProps) {
  const personas = [
    {
      id: 'standard' as Persona,
      icon: User,
      title: 'Standard User',
      description: 'Perfect for personal privacy protection',
      features: [
        'Quick scan interface',
        'Essential providers',
        'Basic reports',
        'Email support'
      ]
    },
    {
      id: 'advanced' as Persona,
      icon: Zap,
      title: 'Advanced User',
      description: 'Full control with all features',
      features: [
        'All scan providers',
        'Advanced customization',
        'Detailed analytics',
        'Priority support'
      ]
    },
    {
      id: 'enterprise' as Persona,
      icon: Building2,
      title: 'Enterprise',
      description: 'For teams and organizations',
      features: [
        'API access',
        'Bulk scanning',
        'Team collaboration',
        'Dedicated support'
      ]
    }
  ];

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Choose Your Experience</DialogTitle>
          <DialogDescription>
            Select the interface that best fits your needs. You can change this later in settings.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid md:grid-cols-3 gap-4 mt-4">
          {personas.map((persona) => {
            const Icon = persona.icon;
            return (
              <Card
                key={persona.id}
                className="relative cursor-pointer hover:border-primary transition-all hover:shadow-lg"
                onClick={() => !loading && onSelect(persona.id)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-lg">{persona.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {persona.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {persona.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full mt-4"
                    variant={persona.id === 'standard' ? 'default' : 'outline'}
                    disabled={loading}
                    onClick={(e) => {
                      e.stopPropagation();
                      !loading && onSelect(persona.id);
                    }}
                  >
                    {loading ? 'Setting up...' : 'Select'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <p className="text-xs text-muted-foreground text-center mt-4">
          💡 Tip: Standard mode simplifies the interface by hiding advanced provider options
        </p>
      </DialogContent>
    </Dialog>
  );
}
