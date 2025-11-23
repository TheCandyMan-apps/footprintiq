import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Network,
  Shield,
  BarChart,
  FileText,
  Users,
  Settings,
  Zap,
  Database,
  Bell,
  GitBranch,
  Code,
  ArrowRight,
} from "lucide-react";

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: any;
  route: string;
  tier?: string;
  category: "Core" | "Analysis" | "Monitoring" | "Admin";
}

const FEATURES: Feature[] = [
  {
    id: "advanced-scan",
    title: "Advanced Scan",
    description: "Multi-provider OSINT scanning with 20+ sources",
    icon: Search,
    route: "/scan/advanced",
    category: "Core",
  },
  {
    id: "graph",
    title: "Knowledge Graph",
    description: "Visualize entity relationships and connections",
    icon: Network,
    route: "/graph",
    category: "Analysis",
  },
  {
    id: "monitoring",
    title: "Continuous Monitoring",
    description: "Schedule recurring scans and get alerts",
    icon: Bell,
    route: "/monitoring",
    tier: "Pro",
    category: "Monitoring",
  },
  {
    id: "analytics",
    title: "Analytics Dashboard",
    description: "Aggregate insights and trends",
    icon: BarChart,
    route: "/analytics",
    category: "Analysis",
  },
  {
    id: "cases",
    title: "Case Management",
    description: "Organize investigations with evidence",
    icon: FileText,
    route: "/cases",
    category: "Core",
  },
  {
    id: "workflows",
    title: "Automated Workflows",
    description: "Build custom investigation pipelines",
    icon: GitBranch,
    route: "/workflows",
    tier: "Pro",
    category: "Analysis",
  },
  {
    id: "api-keys",
    title: "API Access",
    description: "Programmatic access via REST API",
    icon: Code,
    route: "/api-keys",
    tier: "Pro",
    category: "Admin",
  },
  {
    id: "security",
    title: "Security Dashboard",
    description: "System health and threat detection",
    icon: Shield,
    route: "/admin/security",
    tier: "Admin",
    category: "Admin",
  },
  {
    id: "providers",
    title: "Provider Health",
    description: "Monitor scan provider performance",
    icon: Database,
    route: "/admin/providers",
    tier: "Admin",
    category: "Admin",
  },
  {
    id: "referrals",
    title: "Referral Program",
    description: "Earn credits by referring others",
    icon: Users,
    route: "/referrals",
    category: "Core",
  },
  {
    id: "batch-scan",
    title: "Batch Scanning",
    description: "Process multiple targets at once",
    icon: Zap,
    route: "/scan/batch",
    tier: "Pro",
    category: "Core",
  },
  {
    id: "organization",
    title: "Organization Settings",
    description: "Manage team, billing, and workspace",
    icon: Settings,
    route: "/organization",
    category: "Admin",
  },
];

export function InteractiveFeatureMap() {
  const navigate = useNavigate();

  const groupedFeatures = FEATURES.reduce((acc, feature) => {
    if (!acc[feature.category]) acc[feature.category] = [];
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, Feature[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedFeatures).map(([category, features]) => (
        <div key={category}>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            {category === "Core" && <Zap className="h-5 w-5 text-primary" />}
            {category === "Analysis" && <BarChart className="h-5 w-5 text-primary" />}
            {category === "Monitoring" && <Bell className="h-5 w-5 text-primary" />}
            {category === "Admin" && <Settings className="h-5 w-5 text-primary" />}
            {category}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.id}
                  className="p-4 hover:border-primary/50 transition-all hover:shadow-md cursor-pointer group"
                  onClick={() => navigate(feature.route)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    {feature.tier && (
                      <Badge variant="secondary" className="text-xs">
                        {feature.tier}
                      </Badge>
                    )}
                  </div>
                  <h4 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {feature.description}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full group-hover:bg-primary/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(feature.route);
                    }}
                  >
                    <span>Explore</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
