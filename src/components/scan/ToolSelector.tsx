import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, Search, Globe, Shield, Zap } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: any;
  tier: 'free' | 'pro' | 'business';
  features: string[];
  scanTypes: string[];
}

const TOOLS: Tool[] = [
  {
    id: 'perplexity_osint',
    name: 'Perplexity Web Intel',
    description: 'Real-time AI-powered web intelligence with live search across news, social media, and forums',
    icon: Globe,
    tier: 'pro',
    features: [
      'Live web search',
      'Real-time intelligence',
      'Source citations',
      'Multi-platform coverage',
      'News & social media',
    ],
    scanTypes: ['username', 'email', 'phone'],
  },
  {
    id: 'maigret',
    name: 'Maigret',
    description: 'Advanced username reconnaissance across 500+ platforms including social media, forums, and gaming sites',
    icon: Search,
    tier: 'pro',
    features: [
      'Social media profiles',
      'Forum accounts',
      'Gaming platforms',
      'Professional networks',
      'Real-time updates',
    ],
    scanTypes: ['username'],
  },
  {
    id: 'sherlock',
    name: 'Sherlock',
    description: 'Username enumeration across 300+ websites with high-accuracy presence detection',
    icon: Search,
    tier: 'pro',
    features: [
      'Username validation',
      'Social network presence',
      'Gaming platforms',
      'Professional sites',
      'Fast scanning',
    ],
    scanTypes: ['username'],
  },
  {
    id: 'gosearch',
    name: 'GoSearch',
    description: 'Digital footprint discovery across 300+ websites with deep OSINT capabilities',
    icon: Globe,
    tier: 'business',
    features: [
      'Deep web scanning',
      'Profile aggregation',
      'Advanced filtering',
      'No false positives',
      'Comprehensive coverage',
    ],
    scanTypes: ['username'],
  },
  {
    id: 'holehe',
    name: 'Holehe',
    description: 'Email presence detection across 120+ services with account recovery validation',
    icon: Shield,
    tier: 'pro',
    features: [
      'Account validation',
      'Recovery email detection',
      'Phone number discovery',
      'Service enumeration',
      'High accuracy',
    ],
    scanTypes: ['email'],
  },
];

interface ToolSelectorProps {
  selectedTool: string;
  onToolChange: (tool: string) => void;
  scanType: string;
  userTier: 'free' | 'pro' | 'business';
  disabled?: boolean;
}

export function ToolSelector({ selectedTool, onToolChange, scanType, userTier, disabled }: ToolSelectorProps) {
  const compatibleTools = TOOLS.filter(tool => tool.scanTypes.includes(scanType));

  const getTierIcon = (tier: string) => {
    if (tier === 'business') return <Zap className="w-3 h-3" />;
    if (tier === 'pro') return <Shield className="w-3 h-3" />;
    return null;
  };

  const canAccessTool = (tool: Tool) => {
    if (userTier === 'business') return true;
    if (userTier === 'pro') return tool.tier !== 'business';
    return tool.tier === 'free';
  };

  const selectedToolData = TOOLS.find(t => t.id === selectedTool);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          OSINT Tool Selection
        </Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-4 h-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <p>Choose the right OSINT tool based on your target type and investigation needs</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Select value={selectedTool} onValueChange={onToolChange} disabled={disabled}>
        <SelectTrigger className="w-full h-auto min-h-[60px] bg-background">
          <SelectValue>
            {selectedToolData && (
              <div className="flex items-center gap-3 py-1">
                <selectedToolData.icon className="w-5 h-5 text-primary shrink-0" />
                <div className="text-left flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{selectedToolData.name}</span>
                    <Badge 
                      variant={selectedToolData.tier === 'business' ? 'default' : selectedToolData.tier === 'pro' ? 'secondary' : 'outline'}
                      className="text-xs"
                    >
                      {getTierIcon(selectedToolData.tier)}
                      <span className="ml-1 capitalize">{selectedToolData.tier}</span>
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {selectedToolData.description}
                  </p>
                </div>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-w-2xl">
          {compatibleTools.map((tool) => {
            const Icon = tool.icon;
            const accessible = canAccessTool(tool);
            
            return (
              <SelectItem 
                key={tool.id} 
                value={tool.id}
                disabled={!accessible}
                className="h-auto p-3 cursor-pointer"
              >
                <div className="flex items-start gap-3 w-full">
                  <Icon className="w-5 h-5 text-primary mt-1 shrink-0" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{tool.name}</span>
                      <Badge 
                        variant={tool.tier === 'business' ? 'default' : tool.tier === 'pro' ? 'secondary' : 'outline'}
                        className="text-xs"
                      >
                        {getTierIcon(tool.tier)}
                        <span className="ml-1 capitalize">{tool.tier}</span>
                      </Badge>
                      {!accessible && (
                        <Badge variant="outline" className="text-xs">
                          🔒 Upgrade Required
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {tool.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {tool.features.slice(0, 3).map((feature, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs px-2 py-0">
                          {feature}
                        </Badge>
                      ))}
                      {tool.features.length > 3 && (
                        <Badge variant="outline" className="text-xs px-2 py-0">
                          +{tool.features.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {/* Tool Details Card (Mobile-friendly) */}
      {selectedToolData && (
        <Card className="p-4 bg-muted/30 md:hidden">
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-semibold mb-1">Key Features:</h4>
              <ul className="space-y-1">
                {selectedToolData.features.map((feature, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-1">Compatible Scan Types:</h4>
              <div className="flex flex-wrap gap-1">
                {selectedToolData.scanTypes.map((type, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
