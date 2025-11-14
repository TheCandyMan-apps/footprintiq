import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Eye, Globe, Lock, Mail, MapPin, MessageSquare, User, ExternalLink } from 'lucide-react';
import { useSocialMediaFindings } from '@/hooks/useSocialMediaFindings';

const riskColors = {
  low: 'bg-green-500/10 text-green-500 border-green-500/20',
  medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  critical: 'bg-red-500/10 text-red-500 border-red-500/20',
};

const visibilityIcons = {
  public: Globe,
  friends: User,
  connections: User,
  private: Lock,
};

const findingTypeIcons = {
  profile: User,
  email: Mail,
  location: MapPin,
  posts: MessageSquare,
  default: Eye,
};

export function SocialMediaFindings() {
  const { findings, isLoading } = useSocialMediaFindings() as any;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">Loading findings...</div>
        </CardContent>
      </Card>
    );
  }

  if (!findings || findings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Digital Footprint Findings</CardTitle>
          <CardDescription>
            No findings yet. Connect and scan your social media platforms to see your digital footprint.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const groupedFindings = (findings as any[]).reduce((acc: any, finding: any) => {
    if (!acc[finding.platform]) {
      acc[finding.platform] = [];
    }
    acc[finding.platform].push(finding);
    return acc;
  }, {} as Record<string, any[]>);

  const stats = {
    total: (findings as any[]).length,
    high_risk: (findings as any[]).filter((f: any) => f.risk_level === 'high' || f.risk_level === 'critical').length,
    public: (findings as any[]).filter((f: any) => f.visibility === 'public').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Findings</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-500">{stats.high_risk}</div>
            <div className="text-sm text-muted-foreground">High Risk Items</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-500">{stats.public}</div>
            <div className="text-sm text-muted-foreground">Public Information</div>
          </CardContent>
        </Card>
      </div>

      {/* Findings by Platform */}
      {Object.entries(groupedFindings).map(([platform, platformFindings]) => (
        <Card key={platform}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="capitalize">{platform} Findings</CardTitle>
                <CardDescription>
                  {(platformFindings as any[]).length} items discovered
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(platformFindings as any[]).map((finding: any) => {
                const VisibilityIcon = visibilityIcons[finding.visibility as keyof typeof visibilityIcons] || Eye;
                const TypeIcon = findingTypeIcons[finding.finding_type as keyof typeof findingTypeIcons] || findingTypeIcons.default;
                
                return (
                  <div
                    key={finding.id}
                    className="flex items-start gap-4 p-4 rounded-lg border bg-card"
                  >
                    <div className="p-2 rounded-lg bg-primary/10">
                      <TypeIcon className="w-5 h-5 text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-semibold">{finding.title}</h4>
                        <Badge 
                          variant="outline" 
                          className={riskColors[finding.risk_level as keyof typeof riskColors]}
                        >
                          {finding.risk_level}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {finding.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <VisibilityIcon className="w-3 h-3" />
                          <span className="capitalize">{finding.visibility}</span>
                        </div>
                        
                        {finding.url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-xs"
                            onClick={() => window.open(finding.url!, '_blank')}
                          >
                            View Source <ExternalLink className="w-3 h-3 ml-1" />
                          </Button>
                        )}
                      </div>

                      {/* Additional content details */}
                      {finding.content && (
                        <div className="mt-3 p-3 rounded bg-muted/50 text-xs">
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(finding.content, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
