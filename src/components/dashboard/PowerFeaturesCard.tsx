import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronDown, 
  ChevronUp, 
  Settings, 
  Key, 
  Gift, 
  Bot, 
  BarChart3, 
  Link as LinkIcon, 
  Workflow, 
  Eye, 
  Users, 
  Target,
  Sparkles,
  Globe
} from "lucide-react";

const POWER_FEATURES = [
  {
    icon: Settings,
    title: "Settings Hub",
    description: "Manage account, billing, and preferences",
    href: "/settings",
    badge: "Essential",
    color: "text-primary"
  },
  {
    icon: Key,
    title: "API Keys",
    description: "Programmatic access to FootprintIQ",
    href: "/api-keys",
    badge: "Automation",
    color: "text-accent"
  },
  {
    icon: Gift,
    title: "Referrals",
    description: "Earn credits by inviting others",
    href: "/referrals",
    badge: "Credits",
    color: "text-success"
  },
  {
    icon: Bot,
    title: "AI Analyst",
    description: "Advanced threat analysis",
    href: "/ai-analyst",
    badge: "AI",
    color: "text-purple-500"
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Detailed scan insights",
    href: "/analytics/ai",
    badge: "Insights",
    color: "text-cyan-500"
  },
  {
    icon: LinkIcon,
    title: "Integrations",
    description: "Connect with other tools",
    href: "/integrations",
    badge: "Connect",
    color: "text-pink-500"
  },
  {
    icon: Workflow,
    title: "Workflows",
    description: "Automate your investigations",
    href: "/workflows",
    badge: "Automation",
    color: "text-orange-500"
  },
  {
    icon: Eye,
    title: "Watchlists",
    description: "Monitor specific entities",
    href: "/watchlists",
    badge: "Monitoring",
    color: "text-blue-500"
  },
  {
    icon: Users,
    title: "Persona Resolver",
    description: "Identity correlation tool",
    href: "/persona-resolver",
    badge: "Analysis",
    color: "text-indigo-500"
  },
  {
    icon: Target,
    title: "Threat Forecast",
    description: "Predictive risk analysis",
    href: "/threat-forecast",
    badge: "Prediction",
    color: "text-red-500"
  },
  {
    icon: Globe,
    title: "Context Enrichment",
    description: "Extract intelligence from any URL",
    href: "/context-enrichment",
    badge: "Pro",
    color: "text-emerald-500"
  }
];

export function PowerFeaturesCard() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-card via-card/95 to-primary/5 shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-glow)] transition-all duration-500">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      
      <CardHeader className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                Explore Power Features
                <Badge variant="secondary" className="text-xs">New</Badge>
              </CardTitle>
              <CardDescription className="mt-1">
                Discover hidden tools to supercharge your investigations
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="shrink-0"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {POWER_FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.href}
                  to={feature.href}
                  className="group relative p-4 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card hover:border-primary/30 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-md bg-background/80 group-hover:bg-primary/10 transition-colors">
                      <Icon className={`w-5 h-5 ${feature.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                          {feature.title}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {feature.badge}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border/50">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium mb-1">💡 Pro Tip</p>
                <p className="text-xs text-muted-foreground">
                  Press <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-background rounded border">Ctrl</kbd> + <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-background rounded border">,</kbd> to quickly access Settings from anywhere
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
