import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DashboardFilters } from '@/types/dashboard';
import { Trash2 } from 'lucide-react';

interface SavedView {
  id: string;
  name: string;
  filters: DashboardFilters;
  columns: string[];
  density: 'compact' | 'comfortable';
}

interface SavedViewsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFilters: DashboardFilters;
  currentColumns: string[];
  currentDensity: 'compact' | 'comfortable';
  onLoadView: (view: SavedView) => void;
}

export function SavedViewsDialog({
  open,
  onOpenChange,
  currentFilters,
  currentColumns,
  currentDensity,
  onLoadView,
}: SavedViewsDialogProps) {
  const [views, setViews] = useState<SavedView[]>([]);
  const [newViewName, setNewViewName] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadViews();
    }
  }, [open]);

  const loadViews = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('saved_views')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load views:', error);
      return;
    }

    const typedViews = (data || []).map(view => ({
      ...view,
      filters: view.filters as any as DashboardFilters,
      density: view.density as 'compact' | 'comfortable',
    }));

    setViews(typedViews);
  };

  const saveView = async () => {
    if (!newViewName.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter a name for this view',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('saved_views').insert({
      user_id: user.id,
      name: newViewName,
      filters: currentFilters as any,
      columns: currentColumns,
      density: currentDensity,
    });

    setSaving(false);

    if (error) {
      toast({
        title: 'Failed to save view',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'View saved',
      description: `"${newViewName}" has been saved`,
    });

    setNewViewName('');
    loadViews();
  };

  const deleteView = async (id: string) => {
    const { error } = await supabase
      .from('saved_views')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Failed to delete view',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({ title: 'View deleted' });
    loadViews();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Saved Views</DialogTitle>
          <DialogDescription>
            Save and load custom filter configurations
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="view-name">Save Current View</Label>
            <div className="flex gap-2">
              <Input
                id="view-name"
                placeholder="View name..."
                value={newViewName}
                onChange={(e) => setNewViewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveView()}
              />
              <Button onClick={saveView} disabled={saving}>
                Save
              </Button>
            </div>
          </div>

          {views.length > 0 && (
            <div className="space-y-2">
              <Label>Saved Views</Label>
              <div className="space-y-2">
                {views.map((view) => (
                  <div
                    key={view.id}
                    className="flex items-center justify-between gap-2 rounded-lg border p-3"
                  >
                    <button
                      onClick={() => {
                        onLoadView(view);
                        onOpenChange(false);
                      }}
                      className="flex-1 text-left text-sm hover:underline"
                    >
                      {view.name}
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteView(view.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
