import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Linkedin, Twitter, Facebook, Globe, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SocialLink {
  platform: 'linkedin' | 'twitter' | 'facebook' | 'web' | 'email';
  url: string;
}

interface EntityCardProps {
  name: string;
  subtitle?: string;
  avatar?: string;
  tags?: string[];
  socialLinks?: SocialLink[];
  confidence?: number;
  entityType?: string;
  lastUpdated?: string;
  onClick?: () => void;
  className?: string;
}

const socialIcons = {
  linkedin: Linkedin,
  twitter: Twitter,
  facebook: Facebook,
  web: Globe,
  email: Mail,
};

export function EntityCard({
  name,
  subtitle,
  avatar,
  tags = [],
  socialLinks = [],
  confidence,
  entityType,
  lastUpdated,
  onClick,
  className,
}: EntityCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/60 bg-white shadow-sm p-6 transition-shadow duration-200",
        onClick && "cursor-pointer hover:shadow-md",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <Avatar className="h-14 w-14 border border-border/40">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback className="bg-secondary text-base font-semibold">
            {name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* Name, entity type, and confidence */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="text-base font-semibold text-foreground truncate">{name}</h3>
              {entityType && (
                <Badge variant="outline" className="shrink-0 text-xs">
                  {entityType}
                </Badge>
              )}
            </div>
            {confidence !== undefined && (
              <Badge variant="secondary" className="shrink-0 text-xs">
                {confidence}% match
              </Badge>
            )}
          </div>

          {/* Subtitle and last updated */}
          <div className="space-y-0.5 mb-3">
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
            {lastUpdated && (
              <p className="text-xs text-muted-foreground/70">
                Last updated: {lastUpdated}
              </p>
            )}
          </div>

          {/* Social links */}
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              {socialLinks.map((link, index) => {
                const Icon = socialIcons[link.platform];
                return (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-7 h-7 rounded-full bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </a>
                );
              })}
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs font-normal">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
