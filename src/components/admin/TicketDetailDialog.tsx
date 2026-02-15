import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Send, User, Calendar, Tag, CreditCard, MessageSquarePlus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface TicketMessage {
  id: string;
  ticket_id: string;
  author_id: string;
  body: string;
  is_internal: boolean;
  created_at: string;
}

interface TicketDetailDialogProps {
  ticket: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function TicketDetailDialog({ ticket, open, onOpenChange, onUpdate }: TicketDetailDialogProps) {
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [status, setStatus] = useState(ticket.status);
  const [priority, setPriority] = useState(ticket.priority);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadMessages();
    }
  }, [open, ticket.id]);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .eq('ticket_id', ticket.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('support_messages')
        .insert({
          ticket_id: ticket.id,
          author_id: user.id,
          body: newMessage,
          is_internal: isInternal
        });

      if (error) throw error;

      // Update ticket last_reply_at
      await supabase
        .from('support_tickets')
        .update({ last_reply_at: new Date().toISOString() })
        .eq('id', ticket.id);

      setNewMessage('');
      setIsInternal(false);
      loadMessages();
      onUpdate();
      
      toast({
        title: 'Message sent',
        description: isInternal ? 'Internal note added' : 'Reply sent to customer'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTicket = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({
          status,
          priority
        })
        .eq('id', ticket.id);

      if (error) throw error;

      onUpdate();
      toast({
        title: 'Ticket updated',
        description: 'Status and priority have been updated'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update ticket',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="font-mono text-sm text-muted-foreground">{ticket.ticket_number}</span>
            <Separator orientation="vertical" className="h-5" />
            <span>{ticket.subject}</span>
          </DialogTitle>
          <DialogDescription>
            Created {formatDate(ticket.created_at)} • Category: {ticket.category}
          </DialogDescription>
          {(ticket.profiles?.full_name || ticket.profiles?.email) && (
            <div className="flex items-center gap-2 mt-2 p-2 rounded-md bg-muted/50 text-sm">
              <User className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="font-medium">{ticket.profiles.full_name || 'Unknown User'}</span>
              {ticket.profiles.email && (
                <span className="text-muted-foreground">({ticket.profiles.email})</span>
              )}
            </div>
          )}
        </DialogHeader>

        <div className="space-y-6">
          {/* Ticket Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="waiting_on_user">Waiting on User</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleUpdateTicket} disabled={loading}>
            Update Ticket
          </Button>

          <Separator />

          {/* Original Description */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Original Request</h4>
            <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {/* Messages */}
          <div className="space-y-3">
            <h4 className="font-medium">Messages</h4>
            {messages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No messages yet</p>
            ) : (
              messages.map(msg => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg ${
                    msg.is_internal ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {msg.is_internal ? 'Internal Note' : 'Support Reply'}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {formatDate(msg.created_at)}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                </div>
              ))
            )}
          </div>

          {/* New Message */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>New Message</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <MessageSquarePlus className="w-3.5 h-3.5" />
                    Canned Replies
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuItem onClick={() => setNewMessage("You can remove your payment method by going to Settings > Subscription and clicking 'Manage Subscription'. This will open a secure portal where you can update or remove your card.")}>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Card removal instructions
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setNewMessage("To manage your subscription (upgrade, downgrade, or cancel), go to Settings > Subscription and click 'Manage Subscription'. You'll be able to make changes in the secure billing portal.")}>
                    <Tag className="w-4 h-4 mr-2" />
                    Subscription management help
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Textarea
              placeholder="Type your message..."
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              rows={4}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  id="internal-note"
                  checked={isInternal}
                  onCheckedChange={setIsInternal}
                />
                <Label htmlFor="internal-note" className="text-sm">
                  Internal note (not visible to customer)
                </Label>
              </div>
              <Button onClick={handleSendMessage} disabled={loading || !newMessage.trim()}>
                <Send className="w-4 h-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}