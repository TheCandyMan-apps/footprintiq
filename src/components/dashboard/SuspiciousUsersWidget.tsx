import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, Shield, Clock, Mail, UserX, ChevronRight, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface FlaggedUser {
  id: string;
  user_id: string;
  flag_type: string;
  reason: string;
  notes: string | null;
  created_at: string;
  is_active: boolean;
  profiles?: {
    email: string | null;
    full_name: string | null;
  };
}

interface ActivitySummary {
  totalScans: number;
  recentScans: number;
  lastActivity: string | null;
}

export function SuspiciousUsersWidget() {
  const navigate = useNavigate();
  const [flaggedUsers, setFlaggedUsers] = useState<FlaggedUser[]>([]);
  const [activityMap, setActivityMap] = useState<Record<string, ActivitySummary>>({});
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminAndFetch();
  }, []);

  const checkAdminAndFetch = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check if user is admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleData?.role === 'admin') {
      setIsAdmin(true);
      fetchFlaggedUsers();
    } else {
      setLoading(false);
    }
  };

  const fetchFlaggedUsers = async () => {
    setLoading(true);
    try {
      // Fetch recently flagged users
      const { data, error } = await supabase
        .from('flagged_users')
        .select('*, profiles!flagged_users_user_id_fkey(email, full_name)')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      const users = (data || []) as FlaggedUser[];
      setFlaggedUsers(users);

      // Fetch activity summary for each flagged user
      if (users.length > 0) {
        const userIds = users.map(u => u.user_id);
        const activityData: Record<string, ActivitySummary> = {};

        // Get scan counts per user via workspaces
        for (const userId of userIds) {
          // Get workspaces owned by this user
          const { data: workspaces } = await supabase
            .from('workspaces')
            .select('id')
            .eq('owner_id', userId);

          const workspaceIds = workspaces?.map(w => w.id) || [];

          if (workspaceIds.length > 0) {
            // Total scans
            const { count: totalScans } = await supabase
              .from('scans')
              .select('*', { count: 'exact', head: true })
              .in('workspace_id', workspaceIds);

            // Recent scans (last 24h)
            const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            const { count: recentScans } = await supabase
              .from('scans')
              .select('*', { count: 'exact', head: true })
              .in('workspace_id', workspaceIds)
              .gte('created_at', dayAgo);

            // Last activity
            const { data: lastScan } = await supabase
              .from('scans')
              .select('created_at')
              .in('workspace_id', workspaceIds)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            activityData[userId] = {
              totalScans: totalScans || 0,
              recentScans: recentScans || 0,
              lastActivity: lastScan?.created_at || null
            };
          } else {
            activityData[userId] = {
              totalScans: 0,
              recentScans: 0,
              lastActivity: null
            };
          }
        }

        setActivityMap(activityData);
      }
    } catch (error) {
      console.error('Error fetching flagged users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFlagTypeIcon = (flagType: string) => {
    switch (flagType) {
      case 'suspicious':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'abuse':
        return <UserX className="h-4 w-4 text-red-500" />;
      case 'spam':
        return <Mail className="h-4 w-4 text-orange-500" />;
      default:
        return <Shield className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getFlagTypeBadge = (flagType: string) => {
    const variants: Record<string, string> = {
      suspicious: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      abuse: 'bg-red-500/20 text-red-400 border-red-500/30',
      spam: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      review: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    };
    
    return (
      <Badge 
        variant="outline" 
        className={`text-xs ${variants[flagType] || 'bg-muted text-muted-foreground'}`}
      >
        {flagType}
      </Badge>
    );
  };

  // Don't render for non-admins
  if (!isAdmin && !loading) {
    return null;
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <CardTitle className="text-lg">Suspicious Accounts</CardTitle>
            {flaggedUsers.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {flaggedUsers.length}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={fetchFlaggedUsers}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/admin/security-settings')}
              className="text-xs"
            >
              View All
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : flaggedUsers.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Shield className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No suspicious accounts detected</p>
            <p className="text-xs mt-1 opacity-70">System is monitoring for threats</p>
          </div>
        ) : (
          <ScrollArea className="h-[280px] pr-4">
            <div className="space-y-3">
              {flaggedUsers.map((user) => {
                const activity = activityMap[user.user_id];
                return (
                  <div 
                    key={user.id}
                    className="p-3 rounded-lg border border-border/50 bg-background/50 hover:bg-background/80 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getFlagTypeIcon(user.flag_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm truncate">
                            {user.profiles?.email || 'Unknown user'}
                          </span>
                          {getFlagTypeBadge(user.flag_type)}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {user.reason}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                          </div>
                          {activity && (
                            <>
                              <div className="flex items-center gap-1">
                                <span className="font-medium text-foreground">{activity.totalScans}</span>
                                <span>scans</span>
                              </div>
                              {activity.recentScans > 0 && (
                                <Badge variant="outline" className="text-xs py-0 px-1.5 bg-red-500/10 text-red-400 border-red-500/30">
                                  {activity.recentScans} today
                                </Badge>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
