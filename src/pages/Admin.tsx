import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AdminAnalytics } from '@/components/admin/AdminAnalytics';
import { UserManagementTable } from '@/components/admin/UserManagementTable';
import { ActivityLogs } from '@/components/admin/ActivityLogs';
import { SupportTickets } from '@/components/admin/SupportTickets';
import { SystemHealth } from '@/components/admin/SystemHealth';
import { ErrorLogs } from '@/components/admin/ErrorLogs';
import { DataVerificationPanel } from '@/components/admin/DataVerificationPanel';
import { GrowthAnalyticsTabs } from '@/components/admin/GrowthAnalyticsTabs';
import { BillingSyncPanel } from '@/components/admin/BillingSyncPanel';
import { AdminNav } from '@/components/admin/AdminNav';
import { Header } from '@/components/Header';
import { Shield, Crown, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';

export default function Admin() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error('Please sign in to access the admin dashboard');
      navigate('/');
      return;
    }

    setUserEmail(user.email || '');

    // Check if user has admin role
    const { data: userRole, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (error || userRole?.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      navigate('/dashboard');
      return;
    }

    setIsAdmin(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex w-full">
        {/* Sidebar Navigation */}
        <aside className="hidden lg:block w-64 shrink-0 border-r border-border min-h-[calc(100vh-4rem)]">
          <AdminNav />
        </aside>

        {/* Main Content */}
        <main className="flex-1 py-8 px-4 lg:px-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-lg bg-red-500/10">
              <Shield className="w-6 h-6 text-red-500" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Manage users, monitor system activity, and configure settings
              </p>
            </div>
          </div>

          {/* Admin Status Badge */}
          {isAdmin && (
            <Alert className="mb-6 border-purple-500 bg-purple-500/5">
              <Crown className="h-4 w-4 text-purple-500" />
              <AlertTitle className="text-purple-500">Admin Mode Active</AlertTitle>
              <AlertDescription>
                Logged in as <span className="font-mono font-semibold">{userEmail}</span>. 
                Full system access granted - all providers, unlimited scans, no credit restrictions.
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="growth" className="flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" />
                Growth
              </TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="support">Support</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
              <TabsTrigger value="errors">Errors</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <AdminAnalytics />
            </TabsContent>

            <TabsContent value="growth">
              <GrowthAnalyticsTabs />
            </TabsContent>
            
            <TabsContent value="users">
              <UserManagementTable />
            </TabsContent>
            
            <TabsContent value="support">
              <SupportTickets />
            </TabsContent>
            
            <TabsContent value="system">
              <div className="space-y-6">
                <SystemHealth />
                <BillingSyncPanel />
                <DataVerificationPanel />
              </div>
            </TabsContent>
            
            <TabsContent value="errors">
              <ErrorLogs />
            </TabsContent>
            
            <TabsContent value="activity">
              <ActivityLogs />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
