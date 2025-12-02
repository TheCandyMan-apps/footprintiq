import { Link, useLocation } from 'react-router-dom';
import { 
  Shield,
  Activity,
  Users,
  Database,
  AlertTriangle,
  BarChart3,
  Settings,
  Eye,
  FileText,
  Lock,
  TrendingUp,
  Zap,
  CircuitBoard,
  DollarSign,
  Search,
  Bug,
  ClipboardCheck,
  Wrench,
  Package,
  UserCog,
  FlaskConical,
  Terminal,
  Gauge,
  ScrollText,
  Building2,
  Download
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface NavItem {
  title: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function AdminNav() {
  const location = useLocation();

  const navSections: NavSection[] = [
    {
      title: 'Overview',
      items: [
        {
          title: 'Dashboard',
          path: '/admin/dashboard',
          icon: BarChart3,
        },
        {
          title: 'System Audit',
          path: '/admin/system-audit',
          icon: ClipboardCheck,
          badge: 'PRE-PROD',
        },
      ],
    },
    {
      title: 'Scans & Providers',
      items: [
        {
          title: 'Scan Management',
          path: '/admin/scan-management',
          icon: Search,
        },
        {
          title: 'Provider Health',
          path: '/admin/provider-health',
          icon: Activity,
        },
        {
          title: 'Providers',
          path: '/admin/providers',
          icon: Database,
        },
        {
          title: 'Circuit Breakers',
          path: '/admin/circuit-breakers',
          icon: CircuitBoard,
        },
      ],
    },
    {
      title: 'System',
      items: [
        {
          title: 'System Health',
          path: '/admin/system-health',
          icon: Zap,
        },
        {
          title: 'Performance',
          path: '/admin/performance',
          icon: TrendingUp,
        },
        {
          title: 'Observability',
          path: '/admin/observability',
          icon: Eye,
        },
        {
          title: 'Ops Console',
          path: '/admin/ops',
          icon: Terminal,
        },
        {
          title: 'Database Export',
          path: '/admin/database-export',
          icon: Download,
        },
      ],
    },
    {
      title: 'Users & Access',
      items: [
        {
          title: 'Users',
          path: '/admin/users',
          icon: Users,
        },
        {
          title: 'Role Management',
          path: '/admin/roles',
          icon: UserCog,
        },
        {
          title: 'Workspace Audit',
          path: '/admin/workspace-audit',
          icon: Building2,
        },
      ],
    },
    {
      title: 'Security',
      items: [
        {
          title: 'Security Report',
          path: '/admin/security-report',
          icon: Lock,
        },
        {
          title: 'RLS Check',
          path: '/admin/rls-check',
          icon: Shield,
        },
        {
          title: 'Policies',
          path: '/admin/policies',
          icon: ScrollText,
        },
      ],
    },
    {
      title: 'Logs & Errors',
      items: [
        {
          title: 'Audit Logs',
          path: '/admin/audit-logs',
          icon: FileText,
        },
        {
          title: 'Errors',
          path: '/admin/errors',
          icon: Bug,
        },
        {
          title: 'Glitches',
          path: '/admin/glitches',
          icon: AlertTriangle,
        },
        {
          title: 'Payment Errors',
          path: '/admin/payment-errors',
          icon: DollarSign,
        },
      ],
    },
    {
      title: 'Marketplace & Quality',
      items: [
        {
          title: 'Marketplace Review',
          path: '/admin/marketplace/review',
          icon: Package,
        },
        {
          title: 'Quality Lab',
          path: '/admin/quality-lab',
          icon: FlaskConical,
        },
        {
          title: 'Cost Tracking',
          path: '/admin/cost-tracking',
          icon: Gauge,
        },
      ],
    },
  ];

  return (
    <Card className="p-4 h-fit sticky top-4">
      <div className="flex items-center gap-2 mb-4 px-2">
        <Shield className="h-5 w-5 text-primary" />
        <h2 className="font-semibold">Admin</h2>
      </div>
      <nav className="space-y-4">
        {navSections.map((section, sectionIndex) => (
          <div key={section.title}>
            {sectionIndex > 0 && <Separator className="mb-3" />}
            <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              {section.title}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground font-medium"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </div>
                    {item.badge && (
                      <Badge 
                        variant={isActive ? "secondary" : "outline"} 
                        className="capitalize text-xs"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </Card>
  );
}
