import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, 
  Eye, 
  ShieldAlert, 
  Ban, 
  Bot, 
  CheckCircle,
  Loader2 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface UserFlagsListProps {
  userId: string;
  onUpdate?: () => void;
}

interface FlagRecord {
  id: string;
  flag_type: string;
  reason: string;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  resolved_at: string | null;
  resolution_notes: string | null;
}

const FLAG_ICONS = {
  suspicious: AlertTriangle,
  watching: Eye,
  high_risk: ShieldAlert,
  abuse: Ban,
  spam: Bot,
};

const FLAG_COLORS = {
  suspicious: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  watching: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  high_risk: 'bg-red-500/10 text-red-500 border-red-500/20',
  abuse: 'bg-red-600/10 text-red-600 border-red-600/20',
  spam: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
};

export function UserFlagsList({ userId, onUpdate }: UserFlagsListProps) {
  const [flags, setFlags] = useState<FlagRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<string | null>(null);

  useEffect(() => {
    fetchFlags();
  }, [userId]);

  const fetchFlags = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('flagged_users')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFlags(data || []);
    } catch (error) {
      console.error('Error fetching flags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveFlag = async (flagId: string) => {
    setResolving(flagId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('flagged_users')
        .update({
          is_active: false,
          resolved_at: new Date().toISOString(),
          resolved_by: user.id,
          resolution_notes: 'Resolved by admin',
        })
        .eq('id', flagId);

      if (error) throw error;

      toast.success('Flag resolved');
      fetchFlags();
      onUpdate?.();
    } catch (error: any) {
      console.error('Error resolving flag:', error);
      toast.error(error.message || 'Failed to resolve flag');
    } finally {
      setResolving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const activeFlags = flags.filter(f => f.is_active);
  const resolvedFlags = flags.filter(f => !f.is_active);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">User Flags</h4>
        {activeFlags.length > 0 && (
          <Badge variant="destructive">{activeFlags.length} active</Badge>
        )}
      </div>

      {flags.length === 0 ? (
        <div className="text-center text-muted-foreground py-4 text-sm">
          No flags on this account
        </div>
      ) : (
        <ScrollArea className="h-[200px]">
          <div className="space-y-2">
            {/* Active flags first */}
            {activeFlags.map((flag) => {
              const Icon = FLAG_ICONS[flag.flag_type as keyof typeof FLAG_ICONS] || AlertTriangle;
              const colorClass = FLAG_COLORS[flag.flag_type as keyof typeof FLAG_COLORS] || '';
              
              return (
                <div
                  key={flag.id}
                  className="p-3 bg-muted/30 rounded-lg border space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={colorClass}>
                      <Icon className="h-3 w-3 mr-1" />
                      {flag.flag_type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(flag.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm">{flag.reason}</p>
                  {flag.notes && (
                    <p className="text-xs text-muted-foreground">{flag.notes}</p>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResolveFlag(flag.id)}
                    disabled={resolving === flag.id}
                    className="w-full"
                  >
                    {resolving === flag.id ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    )}
                    Resolve Flag
                  </Button>
                </div>
              );
            })}

            {/* Resolved flags */}
            {resolvedFlags.length > 0 && (
              <>
                <div className="text-xs text-muted-foreground pt-2">Resolved Flags</div>
                {resolvedFlags.map((flag) => {
                  const Icon = FLAG_ICONS[flag.flag_type as keyof typeof FLAG_ICONS] || AlertTriangle;
                  
                  return (
                    <div
                      key={flag.id}
                      className="p-3 bg-muted/20 rounded-lg border border-dashed opacity-60"
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="bg-muted">
                          <Icon className="h-3 w-3 mr-1" />
                          {flag.flag_type}
                        </Badge>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                      <p className="text-sm mt-1 line-through">{flag.reason}</p>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}