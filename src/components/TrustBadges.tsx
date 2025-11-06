import { Shield, Lock, FileCheck, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TrustBadge {
  icon: React.ElementType;
  label: string;
}

const badges: TrustBadge[] = [
  { icon: FileCheck, label: 'GDPR Compliant' },
  { icon: Shield, label: 'No Logs' },
  { icon: Lock, label: 'AES-256 Encryption' },
  { icon: Award, label: 'SOC 2 Ready' },
];

interface TrustBadgesProps {
  variant?: 'default' | 'compact' | 'scroll';
}

export const TrustBadges = ({ variant = 'default' }: TrustBadgesProps) => {
  if (variant === 'compact') {
    return (
      <Link 
        to="/trust" 
        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Shield className="w-3 h-3" />
        <span>Secured & Compliant</span>
      </Link>
    );
  }

  if (variant === 'scroll') {
    return (
      <div className="relative overflow-hidden">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory">
          {badges.map((badge, index) => (
            <Link
              key={index}
              to="/trust"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card/50 border border-accent/20 hover:border-accent/40 hover:bg-card/80 transition-all shrink-0 snap-start group ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              <badge.icon className="w-5 h-5 text-accent group-hover:text-primary transition-colors" />
              <span className="text-sm font-medium text-foreground whitespace-nowrap">
                {badge.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      {badges.map((badge, index) => (
        <Link
          key={index}
          to="/trust"
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50 hover:bg-muted transition-colors group"
        >
          <badge.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
            {badge.label}
          </span>
        </Link>
      ))}
    </div>
  );
};
