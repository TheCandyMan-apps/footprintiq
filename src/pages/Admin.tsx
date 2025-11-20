import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AdminAnalytics } from '@/components/admin/AdminAnalytics';
import { UserManagementTable } from '@/components/admin/UserManagementTable';
import { ActivityLogs } from '@/components/admin/ActivityLogs';
import { SupportTickets } from '@/components/admin/SupportTickets';
import { SystemHealth } from '@/components/admin/SystemHealth';
import { ErrorLogs } from '@/components/admin/ErrorLogs';
import { DataVerificationPanel } from '@/components/admin/DataVerificationPanel';
import { Shield } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function Admin() {
  const navigate = useNavigate();

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
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-lg bg-red-500/10">
            <Shield className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage users, monitor system activity, and configure settings
            </p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="errors">Errors</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <AdminAnalytics />
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
      </div>
    </div>
  );
}
