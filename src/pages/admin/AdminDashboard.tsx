import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { SEO } from '@/components/SEO';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Users, 
  Coins, 
  Activity, 
  Database,
  Shield,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Search,
  DollarSign
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ActivityLogs } from '@/components/admin/ActivityLogs';

interface User {
  id: string;
  email: string;
  role: string;
  subscription_tier: string;
  subscription_expires_at: string | null;
  credits_balance: number;
}

interface SystemHealth {
  maigretWorker: 'healthy' | 'unhealthy' | 'unknown';
  database: 'healthy' | 'unhealthy';
  totalScans: number;
  activeScans: number;
  failedScans: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    maigretWorker: 'unknown',
    database: 'healthy',
    totalScans: 0,
    activeScans: 0,
    failedScans: 0,
  });
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [creditAmount, setCreditAmount] = useState<number>(500);
  const [isGranting, setIsGranting] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  // Check admin access
  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to access admin dashboard');
        navigate('/auth');
        return;
      }

      const { data: roleData, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error || !roleData || roleData.role !== 'admin') {
        toast.error('Access denied - Admin privileges required');
        navigate('/dashboard');
        return;
      }

      setIsCheckingAccess(false);
      fetchUsers();
      fetchSystemHealth();
    } catch (error) {
      console.error('Admin access check failed:', error);
      toast.error('Failed to verify admin access');
      navigate('/dashboard');
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_users_with_credits' as any, {});

      if (error) {
        // Fallback query if RPC doesn't exist
        const { data: usersData, error: usersError } = await supabase
          .from('user_roles')
          .select(`
            user_id,
            role,
            subscription_tier,
            subscription_expires_at
          `);

        if (usersError) throw usersError;

        // Get emails from auth.users via edge function or separate query
        const usersWithEmails = await Promise.all(
          (usersData || []).map(async (userData: any) => {
            // Get credits for each user's workspace
            const { data: workspace } = await supabase
              .from('workspace_members')
              .select('workspace_id')
              .eq('user_id', userData.user_id)
              .maybeSingle();

            let credits = 0;
            if (workspace?.workspace_id) {
              const { data: creditsData } = await supabase.rpc('get_credits_balance', {
                _workspace_id: workspace.workspace_id,
              });
              credits = creditsData || 0;
            }

            return {
              id: userData.user_id,
              email: 'user@example.com', // Placeholder - would need auth access
              role: userData.role,
              subscription_tier: userData.subscription_tier,
              subscription_expires_at: userData.subscription_expires_at,
              credits_balance: credits,
            };
          })
        );

        setUsers(usersWithEmails);
      } else {
        setUsers(data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemHealth = async () => {
    try {
      // Check Maigret worker health
      const { data: workerHealth } = await supabase.functions.invoke('maigret-health-check');
      
      // Get scan stats
      const { data: scansData } = await supabase
        .from('scan_jobs')
        .select('status', { count: 'exact' });

      const totalScans = scansData?.length || 0;
      const activeScans = scansData?.filter(s => s.status === 'running').length || 0;
      const failedScans = scansData?.filter(s => s.status === 'error').length || 0;

      setSystemHealth({
        maigretWorker: workerHealth?.status === 'healthy' ? 'healthy' : 'unhealthy',
        database: 'healthy',
        totalScans,
        activeScans,
        failedScans,
      });
    } catch (error) {
      console.error('Error fetching system health:', error);
      setSystemHealth(prev => ({ ...prev, maigretWorker: 'unhealthy' }));
    }
  };

  const handleGrantCredits = async () => {
    if (!selectedUser || creditAmount <= 0) {
      toast.error('Please select a user and enter a valid credit amount');
      return;
    }

    setIsGranting(true);
    try {
      // Get user's workspace
      const { data: workspace } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', selectedUser)
        .maybeSingle();

      if (!workspace?.workspace_id) {
        throw new Error('User workspace not found');
      }

      // Grant credits
      const { error } = await supabase
        .from('credits_ledger')
        .insert({
          workspace_id: workspace.workspace_id,
          delta: creditAmount,
          reason: 'purchase',
          meta: {
            granted_by: 'admin',
            granted_at: new Date().toISOString(),
            note: 'Admin credit grant',
          },
        });

      if (error) throw error;

      toast.success(`Granted ${creditAmount} credits successfully`);
      setCreditAmount(500);
      setSelectedUser(null);
      fetchUsers(); // Refresh user list
    } catch (error) {
      console.error('Error granting credits:', error);
      toast.error('Failed to grant credits');
    } finally {
      setIsGranting(false);
    }
  };

  const handleUpdateTier = async (userId: string, newTier: 'free' | 'premium' | 'family') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({
          subscription_tier: newTier,
          subscription_expires_at: newTier === 'premium' ? null : undefined,
        })
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('Subscription tier updated successfully');
      fetchUsers(); // Refresh user list
    } catch (error) {
      console.error('Error updating tier:', error);
      toast.error('Failed to update subscription tier');
    }
  };

  const handleUpdateRole = async (userId: string, newRole: 'admin' | 'premium' | 'free') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('User role updated successfully');
      fetchUsers(); // Refresh user list
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update user role');
    }
  };

  const handleResetPassword = async (userEmail: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-auth-email', {
        body: {
          type: 'password_reset',
          email: userEmail,
          redirectUrl: window.location.origin,
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to send email');

      toast.success('Password reset email sent via Resend');
    } catch (error) {
      console.error('Error sending password reset:', error);
      toast.error('Failed to send password reset email');
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: 'healthy' | 'unhealthy' | 'unknown') => {
    switch (status) {
      case 'healthy':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Healthy</Badge>;
      case 'unhealthy':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Unhealthy</Badge>;
      case 'unknown':
        return <Badge variant="outline"><AlertCircle className="h-3 w-3 mr-1" />Unknown</Badge>;
    }
  };

  if (isCheckingAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Admin Dashboard | FootprintIQ"
        description="System administration and management dashboard"
      />
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Manage users, credits, and monitor system health
              </p>
            </div>
            <Button onClick={() => { fetchUsers(); fetchSystemHealth(); }}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh All
            </Button>
          </div>

          {/* System Health Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Maigret Worker</p>
                  <div className="mt-2">
                    {getStatusBadge(systemHealth.maigretWorker)}
                  </div>
                </div>
                <Activity className="h-8 w-8 text-muted-foreground" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Database</p>
                  <div className="mt-2">
                    {getStatusBadge(systemHealth.database)}
                  </div>
                </div>
                <Database className="h-8 w-8 text-muted-foreground" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Scans</p>
                  <p className="text-2xl font-bold mt-1">{systemHealth.totalScans}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Scans</p>
                  <p className="text-2xl font-bold mt-1">{systemHealth.activeScans}</p>
                  {systemHealth.failedScans > 0 && (
                    <p className="text-xs text-destructive mt-1">
                      {systemHealth.failedScans} failed
                    </p>
                  )}
                </div>
                <Shield className="h-8 w-8 text-muted-foreground" />
              </div>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 max-w-2xl">
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="credits">Credit Allocation</TabsTrigger>
              <TabsTrigger value="activity">Activity Logs</TabsTrigger>
            </TabsList>

            {/* User Management Tab */}
            <TabsContent value="users" className="space-y-4">
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold flex items-center gap-2">
                      <Users className="h-6 w-6" />
                      User Management
                    </h2>
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <ScrollArea className="h-[500px] w-full rounded-md border">
                    <div className="p-4">
                      {loading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No users found
                        </div>
                      ) : (
                        <div className="space-y-3">
                           {filteredUsers.map((user) => (
                            <Card key={user.id} className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{user.email}</p>
                                    <p className="text-xs text-muted-foreground font-mono mt-1">
                                      ID: {user.id.substring(0, 8)}...
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                      <Badge variant="outline" className="text-xs">
                                        {user.role}
                                      </Badge>
                                      <Badge variant="secondary" className="text-xs">
                                        {user.subscription_tier}
                                      </Badge>
                                      <Badge variant="default" className="text-xs">
                                        <Coins className="h-3 w-3 mr-1" />
                                        {user.credits_balance} credits
                                      </Badge>
                                    </div>
                                    {user.subscription_expires_at && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        Expires: {new Date(user.subscription_expires_at).toLocaleDateString()}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2 pt-2 border-t">
                                  <div className="flex-1">
                                    <Label className="text-xs text-muted-foreground mb-1">Role</Label>
                                    <Select
                                      defaultValue={user.role}
                                      onValueChange={(value: 'admin' | 'premium' | 'free') => handleUpdateRole(user.id, value)}
                                    >
                                      <SelectTrigger className="h-8 text-xs">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="premium">Premium</SelectItem>
                                        <SelectItem value="free">Free</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="flex-1">
                                    <Label className="text-xs text-muted-foreground mb-1">Tier</Label>
                                    <Select
                                      defaultValue={user.subscription_tier}
                                      onValueChange={(value: 'free' | 'premium' | 'family') => handleUpdateTier(user.id, value)}
                                    >
                                      <SelectTrigger className="h-8 text-xs">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="free">Free</SelectItem>
                                        <SelectItem value="premium">Premium</SelectItem>
                                        <SelectItem value="family">Family</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="flex items-end">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleResetPassword(user.email)}
                                      className="h-8 text-xs"
                                    >
                                      Reset Password
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </Card>
            </TabsContent>

            {/* Credit Allocation Tab */}
            <TabsContent value="credits" className="space-y-4">
              <Card className="p-6">
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <DollarSign className="h-6 w-6" />
                    Credit Allocation
                  </h2>

                  <div className="grid gap-4 max-w-md">
                    <div className="space-y-2">
                      <Label htmlFor="user-select">Select User</Label>
                      <Select value={selectedUser || ''} onValueChange={setSelectedUser}>
                        <SelectTrigger id="user-select">
                          <SelectValue placeholder="Choose a user..." />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.email} ({user.credits_balance} credits)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="credit-amount">Credit Amount</Label>
                      <Input
                        id="credit-amount"
                        type="number"
                        min="1"
                        value={creditAmount}
                        onChange={(e) => setCreditAmount(parseInt(e.target.value) || 0)}
                        placeholder="Enter amount..."
                      />
                    </div>

                    <Button
                      onClick={handleGrantCredits}
                      disabled={!selectedUser || creditAmount <= 0 || isGranting}
                      className="w-full"
                    >
                      {isGranting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Granting...
                        </>
                      ) : (
                        <>
                          <Coins className="h-4 w-4 mr-2" />
                          Grant {creditAmount} Credits
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-semibold mb-3">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setCreditAmount(500)}
                      >
                        500 Credits
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setCreditAmount(1000)}
                      >
                        1,000 Credits
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setCreditAmount(5000)}
                      >
                        5,000 Credits
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setCreditAmount(10000)}
                      >
                        10,000 Credits
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Activity Logs Tab */}
            <TabsContent value="activity" className="space-y-4">
              <ActivityLogs />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
