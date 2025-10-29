import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface LiveCommentsProps {
  caseId: string;
}

export function LiveComments({ caseId }: LiveCommentsProps) {
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved' | 'mine'>('all');

  const { data: comments = [] } = useQuery({
    queryKey: ['case-comments', caseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('case_comments')
        .select('*')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const addComment = useMutation({
    mutationFn: async () => {
      if (!newComment.trim()) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Extract mentions (@userId)
      const mentions = (newComment.match(/@(\w+)/g) || [])
        .map(m => m.substring(1));

      const { error } = await supabase.from('case_comments').insert({
        case_id: caseId,
        user_id: user.id,
        content: newComment,
        mentions: mentions.length > 0 ? mentions : null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case-comments'] });
      setNewComment('');
      toast.success('Comment added');
    },
  });

  // Realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('case-comments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'case_comments',
          filter: `case_id=eq.${caseId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['case-comments'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [caseId, queryClient]);

  const filteredComments = comments.filter(comment => {
    // Apply filters here based on filter state
    return true;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <h3 className="font-semibold">Comments</h3>
          <Badge variant="secondary">{comments.length}</Badge>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'mine' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('mine')}
          >
            Mine
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {filteredComments.map((comment) => (
            <Card key={comment.id} className="p-4">
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {comment.user_id.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{comment.user_id}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                  {comment.mentions && comment.mentions.length > 0 && (
                    <div className="flex gap-1">
                      {comment.mentions.map((mention, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          @{mention}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment... (use @userId to mention)"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                addComment.mutate();
              }
            }}
          />
          <Button
            onClick={() => addComment.mutate()}
            disabled={!newComment.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press Ctrl+Enter to send
        </p>
      </div>
    </div>
  );
}