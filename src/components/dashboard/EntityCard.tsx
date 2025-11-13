import { GlassCard } from './GlassCard';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Linkedin, Twitter, Facebook, Globe, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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
    <GlassCard
      intensity="medium"
      glowColor="purple"
      disableHover={!onClick}
      className={cn(
        "p-6",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        {/* Avatar with gradient border */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent rounded-full blur-sm opacity-75" />
          <Avatar className="relative h-16 w-16 border-2 border-primary/50">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-lg font-semibold">
              {name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-1 min-w-0">
          {/* Name, entity type, and confidence */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="text-lg font-semibold truncate">{name}</h3>
              {entityType && (
                <Badge variant="outline" className="shrink-0 text-xs">
                  {entityType}
                </Badge>
              )}
            </div>
            {confidence !== undefined && (
              <Badge variant="secondary" className="shrink-0">
                {confidence}% match
              </Badge>
            )}
          </div>

          {/* Subtitle and last updated */}
          <div className="space-y-1 mb-3">
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
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
