import { Card, CardContent } from '@/components/ui/card';
import { Wrench, ShieldCheck, Eye, ExternalLink, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

const pathways = [
  {
    icon: Wrench,
    title: "Remove manually",
    description: "Use our curated opt-out guides to submit removal requests directly to data brokers and platforms.",
    link: "/blog/remove-from-data-brokers-uk",
    linkText: "View removal guides",
  },
  {
    icon: ShieldCheck,
    title: "Use a removal service",
    description: "For hands-off remediation, consider a vetted removal service that handles requests on your behalf.",
    link: null,
    linkText: "Partner referrals coming soon",
  },
  {
    icon: Eye,
    title: "Monitor exposure",
    description: "Track changes to your digital footprint over time with continuous monitoring and alerts.",
    link: "/pricing",
    linkText: "Learn about monitoring",
  },
];

interface StrategicNextStepsProps {
  className?: string;
}

export function StrategicNextSteps({ className }: StrategicNextStepsProps) {
  return (
    <Card className={`overflow-hidden border-border/50 ${className || ''}`}>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Layers className="h-4 w-4 text-primary flex-shrink-0" />
          <h3 className="text-sm font-semibold text-foreground">What to do next</h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          FootprintIQ maps your exposure so remediation is strategic, not blind. Choose the approach that fits your situation.
        </p>

        <div className="space-y-3">
          {pathways.map((p) => (
            <div key={p.title} className="p-3 rounded-lg border border-border/40 bg-muted/20 space-y-1.5">
              <div className="flex items-center gap-2">
                <p.icon className="h-4 w-4 text-primary flex-shrink-0" />
                <p className="text-sm font-medium text-foreground">{p.title}</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed pl-6">{p.description}</p>
              {p.link ? (
                <Link
                  to={p.link}
                  className="flex items-center gap-1 text-xs text-primary hover:underline pl-6"
                >
                  {p.linkText}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              ) : (
                <p className="text-[10px] text-muted-foreground/60 pl-6 italic">{p.linkText}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
