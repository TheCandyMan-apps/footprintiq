import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Search, 
  Edit, 
  Shield, 
  Crown, 
  User as UserIcon, 
  Coins, 
  Loader2, 
  Plus,
  Flag,
  Ban,
  AlertTriangle,
  Eye,
  ShieldAlert,
  Bot
} from 'lucide-react';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { EditUserDialog } from './EditUserDialog';
import { UserFlagDialog } from './UserFlagDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const roleColors = {
  admin: 'bg-red-500/10 text-red-500 border-red-500/20',
  free: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  premium: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
};

const roleIcons = {
  admin: Shield,
  free: UserIcon,
  premium: Crown,
};

const statusColors = {
  active: 'bg-green-500/10 text-green-500 border-green-500/20',
  disabled: 'bg-red-500/10 text-red-500 border-red-500/20',
  deleted: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

const flagIcons = {
  suspicious: AlertTriangle,
  watching: Eye,
  high_risk: ShieldAlert,
  abuse: Ban,
  spam: Bot,
};

const CREDIT_PRESETS = [50, 100, 500];

interface QuickCreditButtonsProps {
  userId: string;
  userEmail: string;
}

function QuickCreditButtons({ userId, userEmail }: QuickCreditButtonsProps) {
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [granting, setGranting] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');

  useEffect(() => {
    // Fetch user's primary workspace
    const fetchWorkspace = async () => {
      const { data } = await supabase
        .from('workspaces')
        .select('id')
        .eq('owner_id', userId)
        .limit(1)
        .single();
      
      if (data) {
        setWorkspaceId(data.id);
      }
    };
    fetchWorkspace();
  }, [userId]);

  const handleGrantCredits = async (amount: number) => {
    if (!workspaceId) {
      toast.error('No workspace found for this user');
      return;
    }

    setGranting(amount);
    try {
      const { error } = await supabase.rpc('admin_grant_credits', {
        _workspace_id: workspaceId,
        _amount: amount,
        _description: `Quick grant for ${userEmail}`
      });

      if (error) throw error;
      toast.success(`+${amount} credits granted to ${userEmail}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to grant credits');
    } finally {
      setGranting(null);
    }
  };

  const handleCustomGrant = async () => {
    const amount = parseInt(customAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Enter a valid positive number');
      return;
    }
    await handleGrantCredits(amount);
    setCustomAmount('');
  };

  if (!workspaceId) {
    return <span className="text-xs text-muted-foreground">No workspace</span>;
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        {CREDIT_PRESETS.map((amount) => (
          <Tooltip key={amount}>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => handleGrantCredits(amount)}
                disabled={granting !== null}
              >
                {granting === amount ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  `+${amount}`
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Grant {amount} credits</p>
            </TooltipContent>
          </Tooltip>
        ))}
        
        {/* Custom amount input */}
        <div className="flex items-center gap-1 ml-1">
          <Input
            type="number"
            placeholder="Custom"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            className="h-7 w-16 text-xs px-2"
            min="1"
            onKeyDown={(e) => e.key === 'Enter' && handleCustomGrant()}
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={handleCustomGrant}
                disabled={granting !== null || !customAmount}
              >
                {granting !== null && !CREDIT_PRESETS.includes(granting) ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Plus className="h-3 w-3" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Grant custom credits</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}

interface FlaggedUser {
  user_id: string;
  flag_type: string;
}

export function UserManagementTable() {
  const { users, isLoading, refetch } = useAdminUsers();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [flagFilter, setFlagFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [flagUser, setFlagUser] = useState<any>(null);
  const [flaggedUsers, setFlaggedUsers] = useState<FlaggedUser[]>([]);

  // Fetch flagged users
  useEffect(() => {
    fetchFlaggedUsers();
  }, []);

  const fetchFlaggedUsers = async () => {
    const { data } = await supabase
      .from('flagged_users')
      .select('user_id, flag_type')
      .eq('is_active', true);
    setFlaggedUsers(data || []);
  };

  const getUserFlags = (userId: string) => {
    return flaggedUsers.filter(f => f.user_id === userId);
  };

  const filteredUsers = users?.filter(user => {
    const matchesSearch = 
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || (user.status || 'active') === statusFilter;
    
    const userFlags = getUserFlags(user.user_id);
    const matchesFlag = flagFilter === 'all' || 
      (flagFilter === 'flagged' && userFlags.length > 0) ||
      (flagFilter === 'not_flagged' && userFlags.length === 0) ||
      userFlags.some(f => f.flag_type === flagFilter);
    
    return matchesSearch && matchesRole && matchesStatus && matchesFlag;
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">Loading users...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage user accounts, roles, flags, and subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={flagFilter} onValueChange={setFlagFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Flags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="flagged">Flagged Only</SelectItem>
                <SelectItem value="not_flagged">Not Flagged</SelectItem>
                <SelectItem value="suspicious">Suspicious</SelectItem>
                <SelectItem value="high_risk">High Risk</SelectItem>
                <SelectItem value="abuse">Abuse</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Quick Credits</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers?.map((user) => {
                    const RoleIcon = roleIcons[user.role as keyof typeof roleIcons] || UserIcon;
                    const userFlags = getUserFlags(user.user_id);
                    const userStatus = user.status || 'active';
                    
                    return (
                      <TableRow key={user.user_id} className={userStatus === 'disabled' ? 'opacity-60' : ''}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {user.full_name || 'No name'}
                                {userFlags.map((flag, idx) => {
                                  const FlagIcon = flagIcons[flag.flag_type as keyof typeof flagIcons] || Flag;
                                  return (
                                    <TooltipProvider key={idx}>
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <FlagIcon className="h-4 w-4 text-destructive" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Flagged: {flag.flag_type}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  );
                                })}
                              </div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusColors[userStatus as keyof typeof statusColors]}>
                            {userStatus === 'disabled' && <Ban className="w-3 h-3 mr-1" />}
                            {userStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={roleColors[user.role as keyof typeof roleColors]}>
                            <RoleIcon className="w-3 h-3 mr-1" />
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {user.subscription_tier}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <QuickCreditButtons userId={user.user_id} userEmail={user.email} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setFlagUser(user)}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Flag className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Flag user</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedUser(user)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedUser && (
        <EditUserDialog
          user={selectedUser}
          open={!!selectedUser}
          onClose={() => {
            setSelectedUser(null);
            refetch?.();
            fetchFlaggedUsers();
          }}
        />
      )}

      {flagUser && (
        <UserFlagDialog
          userId={flagUser.user_id}
          userEmail={flagUser.email}
          open={!!flagUser}
          onClose={() => setFlagUser(null)}
          onFlagged={() => {
            fetchFlaggedUsers();
            refetch?.();
          }}
        />
      )}
    </>
  );
}