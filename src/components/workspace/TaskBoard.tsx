import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/hooks/useWorkspace';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Clock, User, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface TaskBoardProps {
  caseId?: string;
}

export function TaskBoard({ caseId }: TaskBoardProps) {
  const { workspace } = useWorkspace();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignee_id: '',
  });

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', workspace?.id, caseId],
    queryFn: async () => {
      if (!workspace) return [];

      let query = supabase
        .from('tasks' as any)
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false });

      if (caseId) {
        query = query.eq('case_id', caseId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as any[];
    },
    enabled: !!workspace,
  });

  const { data: members = [] } = useQuery({
    queryKey: ['workspace-members', workspace?.id],
    queryFn: async () => {
      if (!workspace) return [];

      const { data, error } = await supabase
        .from('workspace_users' as any)
        .select('user_id, role')
        .eq('workspace_id', workspace.id);

      if (error) throw error;
      return data as any[];
    },
    enabled: !!workspace,
  });

  const createTask = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !workspace) throw new Error('Not authenticated');

      const { error } = await supabase.from('tasks' as any).insert({
        workspace_id: workspace.id,
        case_id: caseId || null,
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        assignee_id: newTask.assignee_id || null,
        created_by: user.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setIsCreateOpen(false);
      setNewTask({ title: '', description: '', priority: 'medium', assignee_id: '' });
      toast.success('Task created');
    },
    onError: (error: Error) => {
      toast.error('Failed to create task: ' + error.message);
    },
  });

  const updateTaskStatus = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      const updates: any = { status, updated_at: new Date().toISOString() };
      if (status === 'done') {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('tasks' as any)
        .update(updates)
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const tasksByStatus = {
    todo: tasks.filter((t: any) => t.status === 'todo'),
    in_progress: tasks.filter((t: any) => t.status === 'in_progress'),
    done: tasks.filter((t: any) => t.status === 'done'),
  };

  if (isLoading) {
    return <div>Loading tasks...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Tasks</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Task title"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Task description"
                />
              </div>
              <div>
                <Label>Priority</Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Assign To</Label>
                <Select
                  value={newTask.assignee_id}
                  onValueChange={(value) => setNewTask({ ...newTask, assignee_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {members.map((member) => (
                      <SelectItem key={member.user_id} value={member.user_id}>
                        {member.user_id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => createTask.mutate()} className="w-full">
                Create Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* To Do Column */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">To Do ({tasksByStatus.todo.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {tasksByStatus.todo.map((task: any) => (
              <Card key={task.id} className="p-3">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-sm">{task.title}</h4>
                    <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                      {task.priority}
                    </Badge>
                  </div>
                  {task.description && (
                    <p className="text-xs text-muted-foreground">{task.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {task.assignee_id && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>Assigned</span>
                      </div>
                    )}
                    {task.due_date && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{format(new Date(task.due_date), 'MMM d')}</span>
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => updateTaskStatus.mutate({ taskId: task.id, status: 'in_progress' })}
                  >
                    Start
                  </Button>
                </div>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* In Progress Column */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">In Progress ({tasksByStatus.in_progress.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {tasksByStatus.in_progress.map((task: any) => (
              <Card key={task.id} className="p-3 border-primary">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-sm">{task.title}</h4>
                    <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                      {task.priority}
                    </Badge>
                  </div>
                  {task.description && (
                    <p className="text-xs text-muted-foreground">{task.description}</p>
                  )}
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => updateTaskStatus.mutate({ taskId: task.id, status: 'done' })}
                  >
                    Complete
                  </Button>
                </div>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Done Column */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Done ({tasksByStatus.done.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {tasksByStatus.done.map((task: any) => (
              <Card key={task.id} className="p-3 opacity-60">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-sm line-through">{task.title}</h4>
                    <Badge variant="secondary" className="text-xs">
                      ✓
                    </Badge>
                  </div>
                  {task.completed_at && (
                    <p className="text-xs text-muted-foreground">
                      Completed {format(new Date(task.completed_at), 'MMM d')}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}