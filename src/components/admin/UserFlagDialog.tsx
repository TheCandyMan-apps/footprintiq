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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Flag, AlertTriangle, Eye, ShieldAlert, Ban, Bot } from 'lucide-react';

interface UserFlagDialogProps {
  userId: string;
  userEmail: string;
  open: boolean;
  onClose: () => void;
  onFlagged?: () => void;
}

const FLAG_TYPES = [
  { value: 'suspicious', label: 'Suspicious', icon: AlertTriangle, description: 'User exhibits suspicious behavior' },
  { value: 'watching', label: 'Watching', icon: Eye, description: 'Monitor this account closely' },
  { value: 'high_risk', label: 'High Risk', icon: ShieldAlert, description: 'High risk of abuse or fraud' },
  { value: 'abuse', label: 'Abuse', icon: Ban, description: 'Terms of service violation' },
  { value: 'spam', label: 'Spam', icon: Bot, description: 'Spam or bot-like activity' },
];

export function UserFlagDialog({ userId, userEmail, open, onClose, onFlagged }: UserFlagDialogProps) {
  const [flagType, setFlagType] = useState<string>('suspicious');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for flagging');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('flagged_users')
        .insert({
          user_id: userId,
          flag_type: flagType,
          flagged_by: user.id,
          reason: reason.trim(),
          notes: notes.trim() || null,
        });

      if (error) throw error;

      toast.success(`User flagged as ${flagType}`);
      onFlagged?.();
      onClose();
      
      // Reset form
      setFlagType('suspicious');
      setReason('');
      setNotes('');
    } catch (error: any) {
      console.error('Error flagging user:', error);
      toast.error(error.message || 'Failed to flag user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedFlagType = FLAG_TYPES.find(f => f.value === flagType);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-destructive" />
            Flag User
          </DialogTitle>
          <DialogDescription>
            Flag <strong>{userEmail}</strong> for monitoring or action
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="flag-type">Flag Type</Label>
            <Select value={flagType} onValueChange={setFlagType}>
              <SelectTrigger id="flag-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FLAG_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {selectedFlagType && (
              <p className="text-xs text-muted-foreground">
                {selectedFlagType.description}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Textarea
              id="reason"
              placeholder="Why are you flagging this user?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional observations or details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleSubmit}
            disabled={isSubmitting || !reason.trim()}
          >
            {isSubmitting ? 'Flagging...' : 'Flag User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}