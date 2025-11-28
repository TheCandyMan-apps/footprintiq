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
  ClipboardCheck
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
}

export function AdminNav() {
  const location = useLocation();

  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      path: '/admin/dashboard',
      icon: BarChart3,
    },
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
      title: 'System Health',
      path: '/admin/system-health',
      icon: Zap,
    },
    {
      title: 'Users',
      path: '/admin/users',
      icon: Users,
    },
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
      title: 'Audit Logs',
      path: '/admin/audit-logs',
      icon: FileText,
    },
    {
      title: 'Observability',
      path: '/admin/observability',
      icon: Eye,
    },
    {
      title: 'Circuit Breakers',
      path: '/admin/circuit-breakers',
      icon: CircuitBoard,
    },
    {
      title: 'Cost Tracking',
      path: '/admin/cost-tracking',
      icon: DollarSign,
    },
    {
      title: 'Payment Errors',
      path: '/admin/payment-errors',
      icon: AlertTriangle,
    },
    {
      title: 'Errors',
      path: '/admin/errors',
      icon: Bug,
    },
    {
      title: 'Performance',
      path: '/admin/performance',
      icon: TrendingUp,
    },
    {
      title: 'System Audit',
      path: '/admin/system-audit',
      icon: ClipboardCheck,
      badge: 'PRE-PROD',
    },
  ];

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4 px-2">
        <Shield className="h-5 w-5 text-primary" />
        <h2 className="font-semibold">Admin</h2>
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => {
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
      </nav>
    </Card>
  );
}
