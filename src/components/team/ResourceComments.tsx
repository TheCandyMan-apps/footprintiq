import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface ResourceCommentsProps {
  teamId: string;
  resourceType: string;
  resourceId: string;
}

export default function ResourceComments({ teamId, resourceType, resourceId }: ResourceCommentsProps) {
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<any[]>([]);

  const { data: initialComments, refetch } = useQuery({
    queryKey: ["resource-comments", teamId, resourceType, resourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_comments" as any)
        .select("*")
        .eq("team_id", teamId)
        .eq("resource_type", resourceType)
        .eq("resource_id", resourceId)
        .is("parent_id", null)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as any[];
    },
  });

  useEffect(() => {
    if (initialComments) setComments(initialComments);

    const channel = supabase
      .channel(`comments-${resourceId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "team_comments",
          filter: `resource_id=eq.${resourceId}`,
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [initialComments, resourceId, refetch]);

  const addComment = async () => {
    if (!newComment.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("team_comments" as any)
        .insert({
          team_id: teamId,
          resource_type: resourceType,
          resource_id: resourceId,
          user_id: user.id,
          content: newComment,
        });

      if (error) throw error;

      setNewComment("");
      toast.success("Comment added");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t">
      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {comment.user_id.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">User {comment.user_id.slice(0, 8)}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm">{comment.content}</p>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-center text-muted-foreground py-4 text-sm">No comments yet</p>
          )}
        </div>
      </ScrollArea>
      <div className="flex gap-2">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              addComment();
            }
          }}
          className="min-h-[60px]"
        />
        <Button onClick={addComment} size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
