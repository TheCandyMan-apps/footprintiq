import { Link, useLocation } from 'react-router-dom';
import { 
  CreditCard, 
  Key, 
  Shield, 
  Package, 
  Receipt,
  Zap,
  Brain,
  TrendingUp,
  User,
  Settings
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
}

export function SettingsNav() {
  const location = useLocation();
  const { subscriptionTier } = useSubscription();

  const navItems: NavItem[] = [
    {
      title: 'Profile',
      path: '/settings/profile',
      icon: User,
    },
    {
      title: 'Subscription Management',
      path: '/settings/subscription-management',
      icon: Receipt,
      badge: subscriptionTier && subscriptionTier !== 'free' ? subscriptionTier : undefined,
    },
    {
      title: 'Billing',
      path: '/settings/billing',
      icon: CreditCard,
    },
    {
      title: 'Subscription',
      path: '/settings/subscription',
      icon: Package,
    },
    {
      title: 'Credits',
      path: '/settings/credits',
      icon: Zap,
    },
    {
      title: 'AI Models',
      path: '/settings/ai',
      icon: Brain,
    },
    {
      title: 'AI Analytics',
      path: '/analytics/ai',
      icon: TrendingUp,
    },
    {
      title: 'API Keys',
      path: '/settings/api-keys',
      icon: Key,
    },
    {
      title: 'Privacy',
      path: '/settings/privacy',
      icon: Shield,
    },
  ];

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4 px-2">
        <Settings className="h-5 w-5 text-primary" />
        <h2 className="font-semibold">Settings</h2>
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
