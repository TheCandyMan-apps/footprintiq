import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SovereigntyRequest } from '@/hooks/useSovereignty';
import { supabase } from '@/integrations/supabase/client';
import { Eye, Briefcase, ShieldAlert, Heart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type PersonaType = 'recruiter' | 'insurer' | 'threat_actor' | 'partner';

interface PersonaSimulationProps {
  requests: SovereigntyRequest[];
  exposureCount: number;
  score: number;
}

const personas: { id: PersonaType; label: string; icon: React.ReactNode }[] = [
  { id: 'recruiter', label: 'Recruiter', icon: <Briefcase className="h-4 w-4" /> },
  { id: 'insurer', label: 'Insurer', icon: <Heart className="h-4 w-4" /> },
  { id: 'threat_actor', label: 'Threat Actor', icon: <ShieldAlert className="h-4 w-4" /> },
  { id: 'partner', label: 'Partner', icon: <Eye className="h-4 w-4" /> },
];

export function PersonaSimulation({ requests, exposureCount, score }: PersonaSimulationProps) {
  const [activePersona, setActivePersona] = useState<PersonaType>('recruiter');
  const [narratives, setNarratives] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<string | null>(null);

  const stats = useMemo(() => ({
    pending: requests.filter(r => ['submitted', 'acknowledged', 'processing'].includes(r.status)).length,
    completed: requests.filter(r => r.status === 'completed').length,
    successRate: requests.length > 0
      ? Math.round((requests.filter(r => r.status === 'completed').length / requests.length) * 100)
      : 0,
  }), [requests]);

  const generateNarrative = useCallback(async (persona: PersonaType) => {
    if (narratives[persona]) return; // already cached

    setLoading(persona);
    try {
      const { data, error } = await supabase.functions.invoke('persona-simulation', {
        body: {
          persona,
          score,
          exposureCount,
          completedRemovals: stats.completed,
          pendingRemovals: stats.pending,
          successRate: stats.successRate,
        },
      });

      if (error) throw error;

      setNarratives(prev => ({ ...prev, [persona]: data.narrative }));
    } catch (err: any) {
      console.error('Persona simulation error:', err);
      toast.error('Failed to generate persona assessment');
    } finally {
      setLoading(null);
    }
  }, [narratives, score, exposureCount, stats]);

  const handleSelect = useCallback((persona: PersonaType) => {
    setActivePersona(persona);
    generateNarrative(persona);
  }, [generateNarrative]);

  const currentNarrative = narratives[activePersona];
  const isLoading = loading === activePersona;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Eye className="h-4 w-4 text-primary" />
          AI Persona Simulation
          <Badge variant="outline" className="ml-auto text-[10px]">AI-Powered</Badge>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          See how your digital identity appears to different audiences
        </p>
      </CardHeader>
      <CardContent>
        {/* Persona selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {personas.map(p => (
            <Button
              key={p.id}
              variant={activePersona === p.id ? 'default' : 'outline'}
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => handleSelect(p.id)}
              disabled={isLoading}
            >
              {p.icon}
              {p.label}
            </Button>
          ))}
        </div>

        {/* Narrative output */}
        <div className="rounded-lg border bg-muted/30 p-4 min-h-[120px]">
          {isLoading ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating {activePersona} perspective…
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          ) : currentNarrative ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium capitalize">{activePersona.replace('_', ' ')} Assessment</span>
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">{currentNarrative}</p>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[80px]">
              <Button variant="ghost" size="sm" className="gap-2" onClick={() => generateNarrative(activePersona)}>
                <Eye className="h-4 w-4" />
                Generate {activePersona.replace('_', ' ')} assessment
              </Button>
            </div>
          )}
        </div>

        {currentNarrative && !isLoading && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 text-xs text-muted-foreground"
            onClick={() => {
              setNarratives(prev => {
                const next = { ...prev };
                delete next[activePersona];
                return next;
              });
              generateNarrative(activePersona);
            }}
          >
            Regenerate
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
