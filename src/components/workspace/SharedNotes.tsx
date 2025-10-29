import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/hooks/useWorkspace';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Clock, Users, History } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface SharedNotesProps {
  caseId?: string;
}

export function SharedNotes({ caseId }: SharedNotesProps) {
  const { workspace } = useWorkspace();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [noteTitle, setNoteTitle] = useState('');

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['notes', workspace?.id, caseId],
    queryFn: async () => {
      if (!workspace) return [];

      let query = supabase
        .from('notes' as any)
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('updated_at', { ascending: false });

      if (caseId) {
        query = query.eq('case_id', caseId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as any[];
    },
    enabled: !!workspace,
  });

  const { data: versions = [] } = useQuery({
    queryKey: ['note-versions', selectedNote],
    queryFn: async () => {
      if (!selectedNote) return [];

      const { data, error } = await supabase
        .from('note_versions' as any)
        .select('*')
        .eq('note_id', selectedNote)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as any[];
    },
    enabled: !!selectedNote,
  });

  const createNote = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !workspace) throw new Error('Not authenticated');

      const { error } = await supabase.from('notes' as any).insert({
        workspace_id: workspace.id,
        case_id: caseId || null,
        title: noteTitle,
        content: noteContent,
        created_by: user.id,
        updated_by: user.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setIsCreateOpen(false);
      setNoteTitle('');
      setNoteContent('');
      toast.success('Note created');
    },
  });

  const updateNote = useMutation({
    mutationFn: async ({ noteId, content }: { noteId: string; content: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Save current version
      const { data: currentNote } = await supabase
        .from('notes' as any)
        .select('content')
        .eq('id', noteId)
        .single();

      if (currentNote && 'content' in currentNote) {
        await supabase.from('note_versions' as any).insert({
          note_id: noteId,
          content: (currentNote as any).content,
          updated_by: user.id,
        });
      }

      // Update note
      const { error } = await supabase
        .from('notes' as any)
        .update({
          content,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', noteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Note updated');
    },
  });

  // Realtime updates
  useEffect(() => {
    if (!workspace) return;

    const channel = supabase
      .channel('notes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
          filter: `workspace_id=eq.${workspace.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['notes'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workspace, queryClient]);

  if (isLoading) {
    return <div>Loading notes...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Shared Notes</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Note
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Note title"
                />
              </div>
              <div>
                <Label>Content</Label>
                <Textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Start writing..."
                  rows={10}
                />
              </div>
              <Button onClick={() => createNote.mutate()} className="w-full">
                Create Note
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((note: any) => (
          <Card key={note.id} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{note.title}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedNote(note.id)}
                >
                  <History className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                {note.content}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>
                    {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
                  </span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  Shared
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedNote && versions.length > 0 && (
        <Dialog open={!!selectedNote} onOpenChange={() => setSelectedNote(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Version History</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {versions.map((version: any) => (
                <Card key={version.id} className="p-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          updateNote.mutate({ noteId: selectedNote, content: version.content });
                          setSelectedNote(null);
                        }}
                      >
                        Restore
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {version.content}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}