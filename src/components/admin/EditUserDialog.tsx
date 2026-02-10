import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { supabase } from '@/integrations/supabase/client';
import { Coins, Loader2, User, Activity, Flag, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { UserActivityPanel } from './UserActivityPanel';
import { UserStatusControls } from './UserStatusControls';
import { UserFlagsList } from './UserFlagsList';
import { UserFlagDialog } from './UserFlagDialog';

interface EditUserDialogProps {
  user: any;
  open: boolean;
  onClose: () => void;
}

interface WorkspaceInfo {
  id: string;
  name: string;
  credits_balance: number;
}

export function EditUserDialog({ user, open, onClose }: EditUserDialogProps) {
  const { updateUserRole, updateUserSubscription, isUpdating, refetch } = useAdminUsers();
  const [role, setRole] = useState(user.role);
  const [subscriptionTier, setSubscriptionTier] = useState(user.subscription_tier);
  const [showFlagDialog, setShowFlagDialog] = useState(false);
  
  // Credit grant state
  const [workspaces, setWorkspaces] = useState<WorkspaceInfo[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('');
  const [creditAmount, setCreditAmount] = useState<string>('');
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(false);
  const [grantingCredits, setGrantingCredits] = useState(false);

  // Fetch user's workspaces when dialog opens
  useEffect(() => {
    if (open && user?.user_id) {
      fetchUserWorkspaces();
    }
  }, [open, user?.user_id]);

  const fetchUserWorkspaces = async () => {
    setLoadingWorkspaces(true);
    try {
      // Get workspaces owned by this user
      const { data: workspacesData, error } = await supabase
        .from('workspaces')
        .select('id, name')
        .eq('owner_id', user.user_id);

      if (error) throw error;

      // Fetch credit balance for each workspace
      const workspacesWithBalances: WorkspaceInfo[] = [];
      for (const ws of workspacesData || []) {
        const { data: balance } = await supabase.rpc('get_credits_balance', {
          _workspace_id: ws.id
        });
        workspacesWithBalances.push({
          id: ws.id,
          name: ws.name,
          credits_balance: balance || 0
        });
      }

      setWorkspaces(workspacesWithBalances);
      if (workspacesWithBalances.length > 0) {
        setSelectedWorkspace(workspacesWithBalances[0].id);
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error);
    } finally {
      setLoadingWorkspaces(false);
    }
  };

  const handleGrantCredits = async () => {
    if (!selectedWorkspace || !creditAmount) {
      toast.error('Please select a workspace and enter credit amount');
      return;
    }

    const amount = parseInt(creditAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid positive number');
      return;
    }

    setGrantingCredits(true);
    try {
      const { data, error } = await supabase.rpc('admin_grant_credits', {
        _workspace_id: selectedWorkspace,
        _amount: amount,
        _description: `Admin credit grant for ${user.email}`
      });

      if (error) throw error;

      toast.success(`Successfully granted ${amount} credits`);
      setCreditAmount('');
      
      // Refresh workspace data to show new balance
      await fetchUserWorkspaces();
    } catch (error: any) {
      console.error('Error granting credits:', error);
      toast.error(error.message || 'Failed to grant credits');
    } finally {
      setGrantingCredits(false);
    }
  };

  const handleSave = () => {
    if (role !== user.role) {
      updateUserRole({ userId: user.user_id, role });
    }
    
    if (subscriptionTier !== user.subscription_tier) {
      updateUserSubscription({ userId: user.user_id, tier: subscriptionTier });
    }
    
    onClose();
  };

  const handleStatusChanged = () => {
    refetch?.();
    onClose();
  };

  const currentWorkspace = workspaces.find(w => w.id === selectedWorkspace);

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage User</DialogTitle>
            <DialogDescription>
              View activity, update settings, and manage account status
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile" className="flex items-center gap-1">
                <User className="h-3 w-3" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-1">
                <Activity className="h-3 w-3" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="flags" className="flex items-center gap-1">
                <Flag className="h-3 w-3" />
                Flags
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-1">
                <Settings className="h-3 w-3" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="text-sm text-muted-foreground p-2 bg-muted/30 rounded">
                    {user.email}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <div className="text-sm text-muted-foreground p-2 bg-muted/30 rounded">
                    {user.full_name || 'Not set'}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free User</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subscription">Subscription Tier</Label>
                  <Select value={subscriptionTier} onValueChange={setSubscriptionTier}>
                    <SelectTrigger id="subscription">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Member Since</Label>
                <div className="text-sm text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString()}
                </div>
              </div>

              {/* Credit Grant Section */}
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Coins className="h-4 w-4 text-primary" />
                  <Label className="text-base font-medium">Credit Management</Label>
                </div>

                {loadingWorkspaces ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading workspaces...
                  </div>
                ) : workspaces.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    No workspaces found for this user
                  </div>
                ) : (
                  <div className="space-y-3">
                    {workspaces.length > 1 && (
                      <div className="space-y-2">
                        <Label htmlFor="workspace">Workspace</Label>
                        <Select value={selectedWorkspace} onValueChange={setSelectedWorkspace}>
                          <SelectTrigger id="workspace">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {workspaces.map((ws) => (
                              <SelectItem key={ws.id} value={ws.id}>
                                {ws.name} ({ws.credits_balance} credits)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm">Current Balance:</span>
                      <span className="font-semibold text-primary">
                        {currentWorkspace?.credits_balance ?? 0} credits
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Amount to grant"
                        value={creditAmount}
                        onChange={(e) => setCreditAmount(e.target.value)}
                        min="1"
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleGrantCredits} 
                        disabled={grantingCredits || !creditAmount}
                        variant="secondary"
                      >
                        {grantingCredits ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Grant Credits'
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="activity" className="mt-4">
              <UserActivityPanel userId={user.user_id} />
            </TabsContent>

            <TabsContent value="flags" className="mt-4 space-y-4">
              <Button 
                variant="destructive" 
                onClick={() => setShowFlagDialog(true)}
                className="w-full"
              >
                <Flag className="h-4 w-4 mr-2" />
                Add New Flag
              </Button>
              <UserFlagsList userId={user.user_id} onUpdate={() => refetch?.()} />
            </TabsContent>

            <TabsContent value="settings" className="mt-4">
              <UserStatusControls
                userId={user.user_id}
                userEmail={user.email}
                currentStatus={user.status || 'active'}
                onStatusChanged={handleStatusChanged}
              />
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isUpdating}>
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UserFlagDialog
        userId={user.user_id}
        userEmail={user.email}
        open={showFlagDialog}
        onClose={() => setShowFlagDialog(false)}
        onFlagged={() => refetch?.()}
      />
    </>
  );
}