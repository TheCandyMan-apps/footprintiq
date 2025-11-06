import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Clock, Plus, Trash2, Calendar, Bell, Play, Pause } from 'lucide-react';
import { format } from 'date-fns';

interface ScheduledScan {
  id: string;
  scan_type: string;
  target_value: string;
  frequency: string;
  next_run_at: string;
  last_run_at: string | null;
  is_active: boolean;
  notify_on_new_findings: boolean;
  created_at: string;
}

interface ScheduledScansManagerProps {
  workspaceId: string;
}

export const ScheduledScansManager = ({ workspaceId }: ScheduledScansManagerProps) => {
  const [scheduledScans, setScheduledScans] = useState<ScheduledScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  // Form state
  const [scanType, setScanType] = useState('email');
  const [targetValue, setTargetValue] = useState('');
  const [frequency, setFrequency] = useState('weekly');
  const [notifyOnNewFindings, setNotifyOnNewFindings] = useState(true);

  useEffect(() => {
    loadScheduledScans();
  }, [workspaceId]);

  const loadScheduledScans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('scheduled_scans')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScheduledScans(data || []);
    } catch (error) {
      console.error('Error loading scheduled scans:', error);
      toast.error('Failed to load scheduled scans');
    } finally {
      setLoading(false);
    }
  };

  const calculateNextRunTime = (freq: string): string => {
    const now = new Date();
    let nextRun: Date;

    switch (freq) {
      case 'daily':
        nextRun = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        nextRun = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        nextRun = new Date(now);
        nextRun.setMonth(nextRun.getMonth() + 1);
        break;
      default:
        nextRun = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    }

    return nextRun.toISOString();
  };

  const createScheduledScan = async () => {
    if (!targetValue.trim()) {
      toast.error('Please enter a target value');
      return;
    }

    try {
      setIsCreating(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('scheduled_scans').insert({
        workspace_id: workspaceId,
        user_id: user.id,
        scan_type: scanType,
        target_value: targetValue,
        frequency,
        notify_on_new_findings: notifyOnNewFindings,
        next_run_at: calculateNextRunTime(frequency),
        is_active: true
      });

      if (error) throw error;

      toast.success('Scheduled scan created successfully');
      setShowDialog(false);
      setTargetValue('');
      loadScheduledScans();
    } catch (error) {
      console.error('Error creating scheduled scan:', error);
      toast.error('Failed to create scheduled scan');
    } finally {
      setIsCreating(false);
    }
  };

  const toggleScanStatus = async (scanId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('scheduled_scans')
        .update({ is_active: !currentStatus })
        .eq('id', scanId);

      if (error) throw error;

      toast.success(`Scan ${!currentStatus ? 'activated' : 'paused'} successfully`);
      loadScheduledScans();
    } catch (error) {
      console.error('Error toggling scan status:', error);
      toast.error('Failed to update scan status');
    }
  };

  const deleteScheduledScan = async (scanId: string) => {
    if (!confirm('Are you sure you want to delete this scheduled scan?')) return;

    try {
      const { error } = await supabase
        .from('scheduled_scans')
        .delete()
        .eq('id', scanId);

      if (error) throw error;

      toast.success('Scheduled scan deleted successfully');
      loadScheduledScans();
    } catch (error) {
      console.error('Error deleting scheduled scan:', error);
      toast.error('Failed to delete scheduled scan');
    }
  };

  const getFrequencyBadgeColor = (freq: string) => {
    switch (freq) {
      case 'daily': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'weekly': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'monthly': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">Loading scheduled scans...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Scheduled Scans
            </CardTitle>
            <CardDescription>
              Automate your scans and get notified when new findings are detected
            </CardDescription>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Schedule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Scheduled Scan</DialogTitle>
                <DialogDescription>
                  Set up an automated scan that runs on your chosen schedule
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Scan Type</Label>
                  <Select value={scanType} onValueChange={setScanType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email Address</SelectItem>
                      <SelectItem value="username">Username</SelectItem>
                      <SelectItem value="domain">Domain</SelectItem>
                      <SelectItem value="phone">Phone Number</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Target Value</Label>
                  <Input
                    placeholder={`Enter ${scanType}...`}
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when new findings are detected
                    </p>
                  </div>
                  <Switch
                    checked={notifyOnNewFindings}
                    onCheckedChange={setNotifyOnNewFindings}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createScheduledScan} disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create Schedule'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {scheduledScans.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No scheduled scans yet</p>
            <Button variant="outline" onClick={() => setShowDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Schedule
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {scheduledScans.map((scan) => (
              <div
                key={scan.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">{scan.target_value}</span>
                    <Badge variant="secondary" className="text-xs">
                      {scan.scan_type}
                    </Badge>
                    <Badge className={getFrequencyBadgeColor(scan.frequency)}>
                      {scan.frequency}
                    </Badge>
                    {!scan.is_active && (
                      <Badge variant="secondary" className="text-xs">
                        Paused
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Next: {format(new Date(scan.next_run_at), 'MMM d, yyyy h:mm a')}
                    </span>
                    {scan.last_run_at && (
                      <span>
                        Last: {format(new Date(scan.last_run_at), 'MMM d, h:mm a')}
                      </span>
                    )}
                    {scan.notify_on_new_findings && (
                      <span className="flex items-center gap-1">
                        <Bell className="w-3 h-3" />
                        Notifications on
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleScanStatus(scan.id, scan.is_active)}
                    title={scan.is_active ? 'Pause' : 'Resume'}
                  >
                    {scan.is_active ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteScheduledScan(scan.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
