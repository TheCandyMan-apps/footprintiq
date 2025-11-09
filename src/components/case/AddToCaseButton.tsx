import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddToCaseButtonProps {
  itemType: 'scan' | 'finding' | 'data_source' | 'social_profile';
  itemId: string;
  title?: string;
  summary?: string;
  url?: string;
  buttonLabel?: string;
  size?: 'sm' | 'default' | 'lg';
}

interface CaseRecord { id: string; title: string; }

export function AddToCaseButton({
  itemType,
  itemId,
  title,
  summary,
  url,
  buttonLabel = 'Add to Case',
  size = 'sm'
}: AddToCaseButtonProps) {
  const [open, setOpen] = useState(false);
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [selectedCase, setSelectedCase] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;
    (async () => {
      const { data, error } = await supabase
        .from('cases')
        .select('id, title')
        .order('created_at', { ascending: false });
      if (!error) setCases(data || []);
    })();
  }, [open]);

  const handleAdd = async () => {
    if (!selectedCase) {
      toast({ title: 'Select a case', description: 'Please choose a case to add this item to.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('case_items').insert({
        case_id: selectedCase,
        item_type: itemType,
        item_id: itemId,
        title: title?.slice(0, 200) || null,
        summary: summary?.slice(0, 1000) || null,
        url: url || null,
        added_by: (await supabase.auth.getUser()).data.user?.id,
      });
      if (error) throw error;
      toast({ title: 'Added to case', description: 'Item was added to your case.' });
      setOpen(false);
    } catch (e: any) {
      toast({ title: 'Could not add to case', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button size={size} variant="outline" onClick={() => setOpen(true)}>{buttonLabel}</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Case</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Select value={selectedCase} onValueChange={setSelectedCase}>
              <SelectTrigger>
                <SelectValue placeholder="Select a case" />
              </SelectTrigger>
              <SelectContent>
                {cases.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={loading}>
              {loading ? 'Adding...' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
