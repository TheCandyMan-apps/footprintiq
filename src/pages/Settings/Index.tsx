import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CreditCard, 
  Key, 
  Shield, 
  Package, 
  Receipt,
  ChevronRight,
  Settings as SettingsIcon,
  Zap,
  Brain,
  TrendingUp,
  User,
  FileText
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { Badge } from '@/components/ui/badge';

interface SettingsCategory {
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export default function SettingsIndex() {
  const { subscriptionTier, isLoading } = useSubscription();

  const categories: SettingsCategory[] = [
    {
      title: 'Profile',
      description: 'Manage your profile information and interface experience',
      icon: User,
      path: '/settings/profile',
    },
    {
      title: 'Subscription Management',
      description: 'View your current plan, billing history, upcoming invoices, and payment methods',
      icon: Receipt,
      path: '/settings/subscription-management',
      badge: subscriptionTier && subscriptionTier !== 'free' ? subscriptionTier : undefined,
      badgeVariant: 'default',
    },
    {
      title: 'Billing',
      description: 'Manage your subscription plan, payment methods, and billing details',
      icon: CreditCard,
      path: '/settings/billing',
    },
    {
      title: 'Subscription',
      description: 'View subscription status, plan details, and usage quotas',
      icon: Package,
      path: '/settings/subscription',
    },
    {
      title: 'Credits',
      description: 'Purchase additional credits and view your current balance',
      icon: Zap,
      path: '/settings/credits',
    },
    {
      title: 'AI Models',
      description: 'Choose your preferred AI model for threat analysis and insights',
      icon: Brain,
      path: '/settings/ai',
    },
    {
      title: 'AI Analytics',
      description: 'View AI usage statistics, trends, and model performance metrics',
      icon: TrendingUp,
      path: '/analytics/ai',
    },
    {
      title: 'API Keys',
      description: 'Generate and manage API keys for programmatic access',
      icon: Key,
      path: '/settings/api-keys',
    },
    {
      title: 'Privacy',
      description: 'Control your privacy settings, data sharing preferences, and consent management',
      icon: Shield,
      path: '/settings/privacy',
    },
    {
      title: 'Report Branding',
      description: 'Customize PDF reports with your company logo, colors, and contact information',
      icon: FileText,
      path: '/settings/branding',
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link to="/dashboard" className="hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">Settings</span>
        </nav>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <SettingsIcon className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
        <p className="text-muted-foreground">
          Manage your account settings, subscriptions, and preferences
        </p>
      </div>

      {/* Settings Categories Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Link key={category.path} to={category.path} className="group">
              <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50 cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    {category.badge && !isLoading && (
                      <Badge variant={category.badgeVariant} className="capitalize">
                        {category.badge}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="flex items-center justify-between">
                    <span>{category.title}</span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {category.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" asChild>
            <Link to="/settings/subscription-management">
              <Receipt className="h-4 w-4 mr-2" />
              View Billing History
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/settings/api-keys">
              <Key className="h-4 w-4 mr-2" />
              Generate API Key
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/settings/credits">
              <Zap className="h-4 w-4 mr-2" />
              Buy Credits
            </Link>
          </Button>
        </div>
      </div>

      {/* Help Section */}
      <Card className="mt-12 border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <SettingsIcon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Need Help?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                If you need assistance with any settings or have questions about your account,
                our support team is here to help.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link to="/support">
                  Contact Support
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
