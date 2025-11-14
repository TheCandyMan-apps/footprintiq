import { GlassCard } from './GlassCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Linkedin, Twitter, Facebook, Instagram, Github, Globe, Scan, Eye, Unplug } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface SocialPlatform {
  name: string;
  icon: LucideIcon;
  connected: boolean;
  findings?: number;
  lastScan?: Date;
  color: string;
}

const platforms: SocialPlatform[] = [
  {
    name: 'LinkedIn',
    icon: Linkedin,
    connected: true,
    findings: 12,
    lastScan: new Date(Date.now() - 2 * 60 * 60 * 1000),
    color: 'hsl(201 100% 35%)',
  },
  {
    name: 'Twitter',
    icon: Twitter,
    connected: true,
    findings: 8,
    lastScan: new Date(Date.now() - 5 * 60 * 60 * 1000),
    color: 'hsl(203 89% 53%)',
  },
  {
    name: 'Facebook',
    icon: Facebook,
    connected: true,
    findings: 15,
    lastScan: new Date(Date.now() - 1 * 60 * 60 * 1000),
    color: 'hsl(221 44% 41%)',
  },
  {
    name: 'Instagram',
    icon: Instagram,
    connected: false,
    color: 'hsl(326 79% 54%)',
  },
  {
    name: 'GitHub',
    icon: Github,
    connected: true,
    findings: 3,
    lastScan: new Date(Date.now() - 24 * 60 * 60 * 1000),
    color: 'hsl(210 12% 16%)',
  },
  {
    name: 'Personal Website',
    icon: Globe,
    connected: false,
    color: 'hsl(263 70% 60%)',
  },
];

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function SocialIntegrations() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleConnect = (platformName: string) => {
    toast({
      title: "Connecting...",
      description: `Initiating connection to ${platformName}`,
    });
  };

  const handleScan = (platformName: string) => {
    toast({
      title: "Scan Started",
      description: `Scanning ${platformName} for new findings...`,
    });
  };

  const handleView = (platformName: string) => {
    toast({
      title: "View Findings",
      description: `Opening ${platformName} findings...`,
    });
    // Navigate to a findings page or open a modal
  };

  const handleAddPlatform = () => {
    toast({
      title: "Add Platform",
      description: "Platform connection dialog coming soon...",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Social Integrations</h2>
        <Button variant="outline" size="sm" onClick={handleAddPlatform}>
          <Globe className="w-4 h-4 mr-2" />
          Add Platform
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {platforms.map((platform, index) => {
          const Icon = platform.icon;
          return (
            <GlassCard
              key={platform.name}
              delay={index * 0.1}
              intensity="medium"
              glowColor={platform.connected ? 'purple' : 'none'}
              className={cn(
                "p-5",
                !platform.connected && "opacity-60"
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-full"
                    style={{
                      backgroundColor: `${platform.color}20`,
                    }}
                  >
                    <Icon
                      className="w-5 h-5"
                      style={{ color: platform.color }}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">{platform.name}</h3>
                    {platform.connected && platform.lastScan && (
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(platform.lastScan)}
                      </p>
                    )}
                  </div>
                </div>
                <Badge
                  variant={platform.connected ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {platform.connected ? 'Connected' : 'Not Connected'}
                </Badge>
              </div>

              {platform.connected && platform.findings !== undefined && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Findings</span>
                    <span className="font-semibold text-primary">{platform.findings}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                {platform.connected ? (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleScan(platform.name)}
                    >
                      <Scan className="w-4 h-4 mr-1" />
                      Scan
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleView(platform.name)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </>
                ) : (
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleConnect(platform.name)}
                  >
                    Connect
                  </Button>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
