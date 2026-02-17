import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SovereigntyRequest } from '@/hooks/useSovereignty';
import { Eye, Briefcase, ShieldAlert, Heart, ChevronRight } from 'lucide-react';

type PersonaType = 'recruiter' | 'insurer' | 'threat_actor' | 'partner';

interface PersonaSimulationProps {
  requests: SovereigntyRequest[];
  exposureCount: number;
  score: number;
}

const personas: { id: PersonaType; label: string; icon: React.ReactNode; description: string }[] = [
  { id: 'recruiter', label: 'Recruiter', icon: <Briefcase className="h-4 w-4" />, description: 'How an employer or recruiter sees your digital presence' },
  { id: 'insurer', label: 'Insurer', icon: <Heart className="h-4 w-4" />, description: 'Risk profile as seen by insurance or financial institutions' },
  { id: 'threat_actor', label: 'Threat Actor', icon: <ShieldAlert className="h-4 w-4" />, description: 'What a malicious actor could exploit from your exposure' },
  { id: 'partner', label: 'Partner / Client', icon: <Eye className="h-4 w-4" />, description: 'How a potential business partner evaluates your credibility' },
];

function simulateView(persona: PersonaType, score: number, exposureCount: number, pendingRequests: number, completedRequests: number) {
  const risk = exposureCount > 10 ? 'High' : exposureCount > 3 ? 'Medium' : 'Low';
  
  const insights: Record<PersonaType, { riskLabel: string; riskColor: string; bullets: string[] }> = {
    recruiter: {
      riskLabel: risk,
      riskColor: risk === 'High' ? 'text-destructive' : risk === 'Medium' ? 'text-yellow-500' : 'text-green-500',
      bullets: [
        `${exposureCount} public accounts discoverable via OSINT`,
        score >= 70 ? 'Active digital hygiene signals professionalism' : 'Unmanaged presence may raise questions',
        completedRequests > 0 ? `${completedRequests} data removals completed — shows privacy awareness` : 'No removal history yet',
        pendingRequests > 0 ? `${pendingRequests} pending removals in progress` : 'No active removal requests',
      ],
    },
    insurer: {
      riskLabel: risk,
      riskColor: risk === 'High' ? 'text-destructive' : risk === 'Medium' ? 'text-yellow-500' : 'text-green-500',
      bullets: [
        `Exposure surface: ${exposureCount} platforms`,
        risk === 'High' ? 'High data broker exposure increases identity theft risk' : 'Moderate or low exposure footprint',
        score >= 60 ? 'Proactive sovereignty posture lowers risk profile' : 'Sovereignty score below threshold — elevated risk tier',
        `Removal success rate affects insurability scoring`,
      ],
    },
    threat_actor: {
      riskLabel: exposureCount > 5 ? 'Exploitable' : 'Limited',
      riskColor: exposureCount > 5 ? 'text-destructive' : 'text-green-500',
      bullets: [
        `${exposureCount} potential pivot points for social engineering`,
        exposureCount > 5 ? 'Cross-platform correlation yields a rich target profile' : 'Limited public information reduces attack surface',
        pendingRequests > 0 ? 'Active removals suggest target is aware and hardening' : 'No defensive posture detected',
        score < 40 ? 'Low sovereignty score — high-value target for phishing' : 'Decent sovereignty posture — moderate difficulty target',
      ],
    },
    partner: {
      riskLabel: score >= 60 ? 'Trustworthy' : 'Uncertain',
      riskColor: score >= 60 ? 'text-green-500' : 'text-yellow-500',
      bullets: [
        score >= 70 ? 'Strong privacy posture signals responsible data handling' : 'Room for improvement in digital hygiene',
        completedRequests > 0 ? `${completedRequests} successful removals demonstrate compliance awareness` : 'No evidence of proactive data management',
        `Sovereignty score: ${score}/100`,
        exposureCount > 8 ? 'Broad digital footprint may concern privacy-conscious partners' : 'Manageable digital footprint',
      ],
    },
  };

  return insights[persona];
}

export function PersonaSimulation({ requests, exposureCount, score }: PersonaSimulationProps) {
  const [activePersona, setActivePersona] = useState<PersonaType>('recruiter');

  const stats = useMemo(() => ({
    pending: requests.filter(r => ['submitted', 'acknowledged', 'processing'].includes(r.status)).length,
    completed: requests.filter(r => r.status === 'completed').length,
  }), [requests]);

  const simulation = simulateView(activePersona, score, exposureCount, stats.pending, stats.completed);
  const activePersonaInfo = personas.find(p => p.id === activePersona)!;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Eye className="h-4 w-4 text-primary" />
          AI Persona Simulation
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
              onClick={() => setActivePersona(p.id)}
            >
              {p.icon}
              {p.label}
            </Button>
          ))}
        </div>

        {/* Simulation results */}
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{activePersonaInfo.label} View</span>
            <Badge variant="outline" className={`text-xs font-semibold ${simulation.riskColor}`}>
              {simulation.riskLabel}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{activePersonaInfo.description}</p>
          <ul className="space-y-2">
            {simulation.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <ChevronRight className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
