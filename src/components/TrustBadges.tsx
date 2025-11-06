import { Shield, Lock, FileCheck, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TrustBadge {
  icon: React.ElementType;
  label: string;
}

const badges: TrustBadge[] = [
  { icon: Lock, label: 'AES-256 Encryption' },
  { icon: Shield, label: 'No Logs' },
  { icon: FileCheck, label: 'GDPR Compliant' },
  { icon: Award, label: 'SOC 2 Ready' },
];

interface TrustBadgesProps {
  variant?: 'default' | 'compact';
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
