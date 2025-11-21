import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminUsers } from '@/hooks/useAdminUsers';

interface EditUserDialogProps {
  user: any;
  open: boolean;
  onClose: () => void;
}

export function EditUserDialog({ user, open, onClose }: EditUserDialogProps) {
  const { updateUserRole, updateUserSubscription, isUpdating } = useAdminUsers();
  const [role, setRole] = useState(user.role);
  const [subscriptionTier, setSubscriptionTier] = useState(user.subscription_tier);

  const handleSave = () => {
    if (role !== user.role) {
      updateUserRole({ userId: user.user_id, role });
    }
    
    if (subscriptionTier !== user.subscription_tier) {
      updateUserSubscription({ userId: user.user_id, tier: subscriptionTier });
    }
    
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user role and subscription settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>

          <div className="space-y-2">
            <Label>Full Name</Label>
            <div className="text-sm text-muted-foreground">
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
                <SelectItem value="premium">Premium User</SelectItem>
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
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
              <SelectItem value="family">Family</SelectItem>
            </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Member Since</Label>
            <div className="text-sm text-muted-foreground">
              {new Date(user.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isUpdating}>
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
