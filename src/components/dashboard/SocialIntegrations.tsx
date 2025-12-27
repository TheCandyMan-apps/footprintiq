import { GlassCard } from './GlassCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Linkedin, Twitter, Facebook, Instagram, Github, Globe, Scan, Eye, Unplug } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

import { useLinkedInAuth } from '@/hooks/useLinkedInAuth';
import { useFacebookAuth } from '@/hooks/useFacebookAuth';
import { useSocialIntegrations } from '@/hooks/useSocialIntegrations';
import { useSocialMediaFindings } from '@/hooks/useSocialMediaFindings';
import { SocialMediaFindings } from './SocialMediaFindings';

interface SocialPlatform {
  name: string;
  icon: LucideIcon;
  color: string;
}

const platformConfigs: SocialPlatform[] = [
  {
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'hsl(201 100% 35%)',
  },
  {
    name: 'Twitter',
    icon: Twitter,
    color: 'hsl(203 89% 53%)',
  },
  {
    name: 'Facebook',
    icon: Facebook,
    color: 'hsl(221 44% 41%)',
  },
  {
    name: 'Instagram',
    icon: Instagram,
    color: 'hsl(326 79% 54%)',
  },
  {
    name: 'GitHub',
    icon: Github,
    color: 'hsl(210 12% 16%)',
  },
  {
    name: 'Personal Website',
    icon: Globe,
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
  
  const { signInWithLinkedIn, isLoading: linkedinLoading } = useLinkedInAuth();
  const { signInWithFacebook, isLoading: facebookLoading } = useFacebookAuth();
  const { integrations, isLoading, isConnected, getIntegration, disconnect } = useSocialIntegrations();
  const { scanPlatform, isScanning } = useSocialMediaFindings();

  const handleConnect = async (platformName: string) => {
    switch (platformName) {
      case 'LinkedIn':
        await signInWithLinkedIn();
        break;
      case 'Facebook':
        await signInWithFacebook();
        break;
      case 'Twitter':
        toast({
          title: "Coming Soon",
          description: "Twitter/X integration is temporarily unavailable. Check back soon!",
        });
        break;
      default:
        toast({
          title: "Coming Soon",
          description: `${platformName} integration will be available soon.`,
        });
    }
  };

  const handleDisconnect = async (platformName: string) => {
    try {
      await disconnect(platformName.toLowerCase());
      toast({
        title: "Disconnected",
        description: `Successfully disconnected from ${platformName}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disconnect. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleScan = (platformName: string) => {
    scanPlatform(platformName.toLowerCase());
  };

  const handleView = (platformName: string) => {
    toast({
      title: "View Findings",
      description: `Opening ${platformName} findings...`,
    });
  };

  const handleAddPlatform = () => {
    toast({
      title: "Add Platform",
      description: "More platforms coming soon...",
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
        {platformConfigs.map((platformConfig, index) => {
          const Icon = platformConfig.icon;
          const connected = isConnected(platformConfig.name);
          const integration = getIntegration(platformConfig.name);
          const lastScan = integration?.last_scan_at ? new Date(integration.last_scan_at) : null;
          
          return (
            <GlassCard
              key={platformConfig.name}
              delay={index * 0.1}
              intensity="medium"
              glowColor={connected ? 'purple' : 'none'}
              className={cn(
                "p-5",
                !connected && "opacity-60"
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-full"
                    style={{
                      backgroundColor: `${platformConfig.color}20`,
                    }}
                  >
                    <Icon
                      className="w-5 h-5"
                      style={{ color: platformConfig.color }}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">{platformConfig.name}</h3>
                    {connected && integration?.platform_username && (
                      <p className="text-xs text-muted-foreground">
                        @{integration.platform_username}
                      </p>
                    )}
                    {connected && lastScan && (
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(lastScan)}
                      </p>
                    )}
                  </div>
                </div>
                <Badge
                  variant={connected ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {connected ? 'Connected' : 'Not Connected'}
                </Badge>
              </div>

              <div className="flex gap-2">
                {connected ? (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleScan(platformConfig.name)}
                      disabled={isScanning}
                    >
                      <Scan className={cn("w-4 h-4 mr-1", isScanning && "animate-spin")} />
                      {isScanning ? 'Scanning...' : 'Scan'}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleView(platformConfig.name)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleDisconnect(platformConfig.name)}
                    >
                      <Unplug className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleConnect(platformConfig.name)}
                    disabled={
                      (linkedinLoading && platformConfig.name === 'LinkedIn') ||
                      (facebookLoading && platformConfig.name === 'Facebook')
                    }
                  >
                    {((linkedinLoading && platformConfig.name === 'LinkedIn') ||
                      (facebookLoading && platformConfig.name === 'Facebook'))
                      ? 'Connecting...'
                      : 'Connect'}
                  </Button>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>
      
      {/* Findings Display */}
      <SocialMediaFindings />
    </div>
  );
}
