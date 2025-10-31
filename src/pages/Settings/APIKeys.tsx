import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Key, Copy, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function APIKeysSettings() {
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: workspace } = useQuery({
    queryKey: ['current-workspace'],
    queryFn: async (): Promise<any> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data } = await supabase
        .from('workspaces' as any)
        .select('id, name')
        .eq('owner_id', user.id)
        .single();

      return data;
    },
  });

  const { data: apiKeys } = useQuery<any[]>({
    queryKey: ['api-keys', workspace?.id],
    queryFn: async () => {
      if (!workspace?.id) return [];

      const { data } = await supabase
        .from('api_keys' as any)
        .select('*')
        .eq('workspace_id', workspace.id)
        .is('revoked_at', null)
        .order('created_at', { ascending: false });

      return data || [];
    },
    enabled: !!workspace?.id,
  });

  const createKey = useMutation({
    mutationFn: async (name: string) => {
      if (!workspace?.id) throw new Error('No workspace');

      // Generate key
      const key = `fiq_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
      
      // Hash it
      const encoder = new TextEncoder();
      const data = encoder.encode(key);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const key_hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const { error } = await supabase
        .from('api_keys' as any)
        .insert({
          workspace_id: workspace.id,
          name,
          key_hash,
          key_prefix: key.substring(0, 10),
          scopes: ['scan:write', 'findings:read'],
        });

      if (error) throw error;
      return key;
    },
    onSuccess: (key) => {
      setGeneratedKey(key);
      setShowCreate(false);
      setNewKeyName('');
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast.success('API key created successfully');
    },
    onError: () => {
      toast.error('Failed to create API key');
    },
  });

  const revokeKey = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('api_keys' as any)
        .update({ revoked_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast.success('API key revoked');
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Keys</h1>
          <p className="text-muted-foreground">
            Manage API keys for programmatic access
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Key
        </Button>
      </div>

      {/* Generated Key Display */}
      {generatedKey && (
        <Card className="p-6 border-success">
          <h3 className="font-semibold mb-2">API Key Created</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Copy this key now. You won't be able to see it again.
          </p>
          <div className="flex gap-2">
            <Input value={generatedKey} readOnly className="font-mono" />
            <Button onClick={() => copyToClipboard(generatedKey)}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Keys List */}
      <div className="space-y-3">
        {apiKeys?.map((key) => (
          <Card key={key.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{key.name}</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {key.key_prefix}...
                  </p>
                  <div className="flex gap-2 mt-1">
                    {key.scopes.map((scope) => (
                      <Badge key={scope} variant="secondary" className="text-xs">
                        {scope}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {key.last_used_at && (
                  <span className="text-sm text-muted-foreground">
                    Last used: {new Date(key.last_used_at).toLocaleDateString()}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => revokeKey.mutate(key.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {apiKeys?.length === 0 && (
          <Card className="p-8 text-center">
            <Key className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No API keys yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first API key to get started
            </p>
            <Button onClick={() => setShowCreate(true)}>Create Key</Button>
          </Card>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="keyName">Key Name</Label>
              <Input
                id="keyName"
                placeholder="e.g., Production API"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={() => createKey.mutate(newKeyName)}
              disabled={!newKeyName || createKey.isPending}
            >
              Create Key
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
