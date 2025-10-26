import { useState, useEffect } from "react";
import { Send, Heart, ThumbsUp, Smile, Trash2, Edit2, AtSign } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Comment {
  id: string;
  user_id: string;
  content: string;
  mentions: string[];
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

interface CaseCommentsProps {
  caseId: string;
}

export function CaseComments({ caseId }: CaseCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadComments();
    getCurrentUser();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel(`case_comments_${caseId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'case_comments',
          filter: `case_id=eq.${caseId}`,
        },
        () => {
          loadComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [caseId]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from('case_comments')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .eq('case_id', caseId)
        .order('created_at', { ascending: true }) as any;

      if (error) throw error;
      setComments(data || []);
    } catch (error: any) {
      console.error('Load comments error:', error);
    }
  };

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      // Extract @mentions
      const mentions = Array.from(newComment.matchAll(/@(\w+)/g)).map(m => m[1]);

      const { error } = await supabase
        .from('case_comments')
        .insert({
          case_id: caseId,
          content: newComment,
          mentions,
          user_id: currentUserId,
        } as any);

      if (error) throw error;

      setNewComment("");
      toast({
        title: "Comment Posted",
        description: "Your comment has been added.",
      });

      // Send Slack notification if mentions exist
      if (mentions.length > 0) {
        await notifyMentions(mentions, newComment);
      }
    } catch (error: any) {
      console.error('Post comment error:', error);
      toast({
        title: "Failed to Post",
        description: error.message || "Unable to post comment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      const { error } = await supabase
        .from('case_comments')
        .update({ content: editContent })
        .eq('id', commentId);

      if (error) throw error;

      setEditingId(null);
      setEditContent("");
      toast({
        title: "Comment Updated",
        description: "Your changes have been saved.",
      });
    } catch (error: any) {
      console.error('Update comment error:', error);
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Delete this comment?")) return;

    try {
      const { error } = await supabase
        .from('case_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      toast({
        title: "Comment Deleted",
        description: "The comment has been removed.",
      });
    } catch (error: any) {
      console.error('Delete comment error:', error);
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleReaction = async (commentId: string, reactionType: string) => {
    try {
      // Check if already reacted
      const { data: existing } = await supabase
        .from('case_comment_reactions')
        .select('id')
        .eq('comment_id', commentId)
        .eq('reaction_type', reactionType)
        .maybeSingle();

      if (existing) {
        // Remove reaction
        await supabase
          .from('case_comment_reactions')
          .delete()
          .eq('id', existing.id);
      } else {
        // Add reaction
        await supabase
          .from('case_comment_reactions')
          .insert({
            comment_id: commentId,
            reaction_type: reactionType,
            user_id: currentUserId,
          } as any);
      }
    } catch (error: any) {
      console.error('Reaction error:', error);
    }
  };

  const notifyMentions = async (mentions: string[], content: string) => {
    try {
      // This would integrate with Slack webhook if SLACK_WEBHOOK_URL is configured
      const slackWebhook = import.meta.env.VITE_SLACK_WEBHOOK_URL;
      if (!slackWebhook) return;

      await fetch(slackWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `New mention in case #${caseId}: @${mentions.join(', @')}\n"${content.slice(0, 100)}..."`,
        }),
      });
    } catch (error) {
      console.error('Slack notification error:', error);
    }
  };

  const renderComment = (comment: Comment) => {
    const isOwner = comment.user_id === currentUserId;
    const isEditing = editingId === comment.id;

    return (
      <div key={comment.id} className="flex gap-3 p-4 rounded-lg border bg-card">
        <Avatar>
          <AvatarFallback>
            {comment.profiles?.full_name?.charAt(0) || comment.profiles?.email?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {comment.profiles?.full_name || comment.profiles?.email || "Unknown User"}
              </span>
              <span className="text-xs text-muted-foreground">
                {format(new Date(comment.created_at), "PPp")}
              </span>
              {comment.mentions.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  <AtSign className="h-3 w-3 mr-1" />
                  {comment.mentions.length}
                </Badge>
              )}
            </div>

            {isOwner && !isEditing && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingId(comment.id);
                    setEditContent(comment.content);
                  }}
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(comment.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[80px]"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleUpdate(comment.id)}>
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditingId(null);
                    setEditContent("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm whitespace-pre-wrap">{comment.content}</p>

              <div className="flex items-center gap-2 pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => handleReaction(comment.id, "like")}
                >
                  <ThumbsUp className="h-3 w-3 mr-1" />
                  <span className="text-xs">Like</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => handleReaction(comment.id, "love")}
                >
                  <Heart className="h-3 w-3 mr-1" />
                  <span className="text-xs">Love</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => handleReaction(comment.id, "smile")}
                >
                  <Smile className="h-3 w-3 mr-1" />
                  <span className="text-xs">Smile</span>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Collaboration</CardTitle>
        <CardDescription>
          Comments and team discussion • Use @username to mention
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* New Comment */}
          <div className="space-y-2">
            <Textarea
              placeholder="Add a comment... Use @username to mention team members"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                Tip: Press Shift+Enter for new line
              </span>
              <Button onClick={handleSubmit} disabled={loading || !newComment.trim()}>
                <Send className="h-4 w-4 mr-2" />
                Post Comment
              </Button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-3">
            {comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No comments yet. Start the discussion!
              </div>
            ) : (
              comments.map(renderComment)
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}