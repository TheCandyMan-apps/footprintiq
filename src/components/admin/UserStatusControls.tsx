import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Ban, CheckCircle, Trash2, AlertTriangle, Loader2 } from 'lucide-react';

interface UserStatusControlsProps {
  userId: string;
  userEmail: string;
  currentStatus: string;
  onStatusChanged?: () => void;
}

export function UserStatusControls({ 
  userId, 
  userEmail, 
  currentStatus, 
  onStatusChanged 
}: UserStatusControlsProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [disableReason, setDisableReason] = useState('');
  const [deleteReason, setDeleteReason] = useState('');

  const handleStatusChange = async (newStatus: 'active' | 'disabled', reason?: string) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase.rpc('update_user_status', {
        _user_id: userId,
        _new_status: newStatus,
        _reason: reason || null,
      });

      if (error) throw error;

      toast.success(`User ${newStatus === 'active' ? 'enabled' : 'disabled'} successfully`);
      onStatusChanged?.();
    } catch (error: any) {
      console.error('Error updating user status:', error);
      toast.error(error.message || 'Failed to update user status');
    } finally {
      setIsUpdating(false);
      setDisableReason('');
    }
  };

  const handleDeleteUser = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase.rpc('admin_delete_user', {
        _user_id: userId,
        _reason: deleteReason || 'Admin deletion',
      });

      if (error) throw error;

      toast.success('User deleted successfully');
      onStatusChanged?.();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Failed to delete user');
    } finally {
      setIsUpdating(false);
      setDeleteReason('');
    }
  };

  const getStatusBadge = () => {
    switch (currentStatus) {
      case 'active':
        return (
          <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case 'disabled':
        return (
          <Badge variant="destructive">
            <Ban className="h-3 w-3 mr-1" />
            Disabled
          </Badge>
        );
      case 'deleted':
        return (
          <Badge variant="secondary">
            <Trash2 className="h-3 w-3 mr-1" />
            Deleted
          </Badge>
        );
      default:
        return <Badge variant="outline">{currentStatus}</Badge>;
    }
  };

  return (
    <div className="space-y-4 border-t pt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label className="text-base font-medium">Account Status</Label>
          {getStatusBadge()}
        </div>
      </div>

      <div className="flex gap-2">
        {currentStatus === 'active' ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                <Ban className="h-4 w-4 mr-2" />
                Disable Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Disable User Account
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will prevent <strong>{userEmail}</strong> from accessing their account.
                  They will not be able to log in or perform any actions until re-enabled.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-4">
                <Label htmlFor="disable-reason">Reason for disabling</Label>
                <Textarea
                  id="disable-reason"
                  placeholder="Enter reason for disabling this account..."
                  value={disableReason}
                  onChange={(e) => setDisableReason(e.target.value)}
                  className="mt-2"
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleStatusChange('disabled', disableReason)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isUpdating}
                >
                  {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Disable Account'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : currentStatus === 'disabled' ? (
          <Button 
            variant="outline" 
            className="text-green-600 border-green-600/30 hover:bg-green-600/10"
            onClick={() => handleStatusChange('active')}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Enable Account
          </Button>
        ) : null}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" />
                Permanently Delete User
              </AlertDialogTitle>
              <AlertDialogDescription>
                <strong className="text-destructive">This action cannot be undone.</strong>
                <br /><br />
                Deleting <strong>{userEmail}</strong> will permanently remove:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Their user account and authentication</li>
                  <li>All profile data</li>
                  <li>Their workspaces and associated data</li>
                  <li>All scan history and results</li>
                </ul>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Label htmlFor="delete-reason">Reason for deletion</Label>
              <Textarea
                id="delete-reason"
                placeholder="Enter reason for permanently deleting this account..."
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="mt-2"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteUser}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isUpdating}
              >
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Permanently Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}