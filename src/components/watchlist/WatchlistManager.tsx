import { useState, useEffect } from "react";
import { Eye, Plus, Edit2, Trash2, Play, Pause, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Watchlist {
  id: string;
  name: string;
  description: string;
  rules: any[];
  is_active: boolean;
  created_at: string;
  member_count?: number;
}

interface WatchlistRule {
  type: 'avatar_hash' | 'pgp_key' | 'email_pattern' | 'phone_prefix' | 'asn' | 'vt_reputation';
  operator: 'equals' | 'contains' | 'matches' | 'greater_than' | 'less_than';
  value: string;
}

export function WatchlistManager() {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    rules: [] as WatchlistRule[],
  });
  const [newRule, setNewRule] = useState<WatchlistRule>({
    type: 'email_pattern',
    operator: 'contains',
    value: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    loadWatchlists();
  }, []);

  const loadWatchlists = async () => {
    try {
      const { data, error } = await supabase
        .from('watchlists')
        .select(`
          *,
          watchlist_members (count)
        `)
        .order('created_at', { ascending: false }) as any;

      if (error) throw error;

      const processed = data?.map((w: any) => ({
        ...w,
        member_count: w.watchlist_members?.[0]?.count || 0,
        rules: w.rules || [],
      })) || [];

      setWatchlists(processed);
    } catch (error: any) {
      console.error('Load watchlists error:', error);
      toast({
        title: "Load Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Watchlist name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingId) {
        // Update
        const { error } = await supabase
          .from('watchlists')
          .update({
            name: formData.name,
            description: formData.description,
            rules: formData.rules as any,
          })
          .eq('id', editingId);

        if (error) throw error;

        toast({
          title: "Watchlist Updated",
          description: "Changes saved successfully",
        });
      } else {
        // Create
        const { error } = await supabase
          .from('watchlists')
          .insert({
            name: formData.name,
            description: formData.description,
            rules: formData.rules as any,
            is_active: true,
          } as any);

        if (error) throw error;

        toast({
          title: "Watchlist Created",
          description: "New watchlist is ready",
        });
      }

      resetForm();
      loadWatchlists();
    } catch (error: any) {
      console.error('Save watchlist error:', error);
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this watchlist? All members will be removed.")) return;

    try {
      const { error } = await supabase
        .from('watchlists')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Watchlist Deleted",
        description: "The watchlist has been removed",
      });

      loadWatchlists();
    } catch (error: any) {
      console.error('Delete watchlist error:', error);
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('watchlists')
        .update({ is_active: !currentState })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: currentState ? "Watchlist Paused" : "Watchlist Activated",
        description: currentState ? "Auto-expansion disabled" : "Auto-expansion enabled",
      });

      loadWatchlists();
    } catch (error: any) {
      console.error('Toggle active error:', error);
      toast({
        title: "Toggle Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addRule = () => {
    if (!newRule.value.trim()) {
      toast({
        title: "Validation Error",
        description: "Rule value is required",
        variant: "destructive",
      });
      return;
    }

    setFormData({
      ...formData,
      rules: [...formData.rules, { ...newRule }],
    });

    setNewRule({
      type: 'email_pattern',
      operator: 'contains',
      value: '',
    });
  };

  const removeRule = (index: number) => {
    setFormData({
      ...formData,
      rules: formData.rules.filter((_, i) => i !== index),
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      rules: [],
    });
    setEditingId(null);
  };

  const startEdit = (watchlist: Watchlist) => {
    setFormData({
      name: watchlist.name,
      description: watchlist.description || "",
      rules: watchlist.rules || [],
    });
    setEditingId(watchlist.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Eye className="h-6 w-6 text-primary" />
            Smart Watchlists
          </h2>
          <p className="text-muted-foreground mt-1">
            Auto-expand entity clusters based on rules
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              New Watchlist
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit" : "Create"} Watchlist</DialogTitle>
              <DialogDescription>
                Define rules to automatically add entities to this watchlist
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., High-Risk Actors"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What is this watchlist tracking?"
                />
              </div>

              {/* Rules Section */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Rules</label>

                {formData.rules.map((rule, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
                    <Badge variant="outline">{rule.type}</Badge>
                    <Badge variant="secondary">{rule.operator}</Badge>
                    <code className="text-xs flex-1">{rule.value}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRule(idx)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}

                {/* Add New Rule */}
                <div className="grid grid-cols-3 gap-2">
                  <Select
                    value={newRule.type}
                    onValueChange={(v: any) => setNewRule({ ...newRule, type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="avatar_hash">Avatar Hash</SelectItem>
                      <SelectItem value="pgp_key">PGP Key</SelectItem>
                      <SelectItem value="email_pattern">Email Pattern</SelectItem>
                      <SelectItem value="phone_prefix">Phone Prefix</SelectItem>
                      <SelectItem value="asn">ASN</SelectItem>
                      <SelectItem value="vt_reputation">VT Reputation</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={newRule.operator}
                    onValueChange={(v: any) => setNewRule({ ...newRule, operator: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equals">Equals</SelectItem>
                      <SelectItem value="contains">Contains</SelectItem>
                      <SelectItem value="matches">Matches Regex</SelectItem>
                      <SelectItem value="greater_than">&gt;</SelectItem>
                      <SelectItem value="less_than">&lt;</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    value={newRule.value}
                    onChange={(e) => setNewRule({ ...newRule, value: e.target.value })}
                    placeholder="Value"
                  />
                </div>

                <Button variant="outline" size="sm" onClick={addRule} className="w-full">
                  <Plus className="h-3 w-3 mr-2" />
                  Add Rule
                </Button>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  Save Watchlist
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Watchlists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {watchlists.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="text-center py-12">
              <Eye className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No watchlists yet. Create one to start tracking entities.</p>
            </CardContent>
          </Card>
        ) : (
          watchlists.map((watchlist) => (
            <Card key={watchlist.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{watchlist.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {watchlist.description || "No description"}
                    </CardDescription>
                  </div>
                  <Badge variant={watchlist.is_active ? "default" : "secondary"}>
                    {watchlist.is_active ? "Active" : "Paused"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{watchlist.member_count} members</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {watchlist.rules?.length || 0} rules
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => startEdit(watchlist)}
                  >
                    <Edit2 className="h-3 w-3 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActive(watchlist.id, watchlist.is_active)}
                  >
                    {watchlist.is_active ? (
                      <Pause className="h-3 w-3" />
                    ) : (
                      <Play className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(watchlist.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}