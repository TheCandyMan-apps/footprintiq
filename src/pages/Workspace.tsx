import { useState } from 'react';
import { useWorkspace } from '@/hooks/useWorkspace';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Users, Key, Shield, CreditCard, Settings, Trash2, Copy, Plus } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logAudit, AuditActions } from '@/lib/workspace/audit';

export default function Workspace() {
  const { workspace, currentRole, can } = useWorkspace();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'viewer' | 'analyst' | 'admin'>('viewer');
  const [newKeyName, setNewKeyName] = useState('');
  const queryClient = useQueryClient();

  // Fetch workspace members
  const { data: members = [] } = useQuery({
    queryKey: ['workspace-members', workspace?.id],
    queryFn: async () => {
      if (!workspace) return [];
      const { data, error } = await supabase
        .from('workspace_users' as any)
        .select('*, profiles(email, full_name)')
        .eq('workspace_id', workspace.id);
      if (error) throw error;
      return data;
    },
    enabled: !!workspace,
  });

  // Fetch API keys
  const { data: apiKeys = [] } = useQuery({
    queryKey: ['workspace-api-keys', workspace?.id],
    queryFn: async () => {
      if (!workspace) return [];
      const { data, error } = await supabase
        .from('workspace_api_keys' as any)
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!workspace && can('manage_api_keys'),
  });

  // Invite member mutation
  const inviteMutation = useMutation({
    mutationFn: async () => {
      if (!workspace) throw new Error('No workspace');
      
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { error } = await supabase.from('invitations' as any).insert({
        workspace_id: workspace.id,
        email: inviteEmail,
        role: inviteRole,
        invited_by: (await supabase.auth.getUser()).data.user?.id,
        token,
        expires_at: expiresAt.toISOString(),
      });

      if (error) throw error;

      await logAudit(workspace.id, {
        action: AuditActions.MEMBER_INVITED,
        resourceType: 'invitation',
        metadata: { email: inviteEmail, role: inviteRole },
      });
    },
    onSuccess: () => {
      toast.success('Invitation sent successfully');
      setInviteEmail('');
      queryClient.invalidateQueries({ queryKey: ['workspace-members'] });
    },
    onError: (error) => {
      toast.error('Failed to send invitation: ' + error.message);
    },
  });

  // Create API key mutation
  const createKeyMutation = useMutation({
    mutationFn: async () => {
      if (!workspace) throw new Error('No workspace');

      const apiKey = `fpiq_${crypto.randomUUID().replace(/-/g, '')}`;
      const keyHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(apiKey));
      const hashHex = Array.from(new Uint8Array(keyHash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      const { error } = await supabase.from('workspace_api_keys' as any).insert({
        workspace_id: workspace.id,
        name: newKeyName,
        key_hash: hashHex,
        key_prefix: apiKey.substring(0, 12) + '...',
        created_by: (await supabase.auth.getUser()).data.user?.id,
        scopes: ['read:findings', 'create:scans'],
      });

      if (error) throw error;

      await logAudit(workspace.id, {
        action: AuditActions.API_KEY_CREATED,
        resourceType: 'api_key',
        metadata: { name: newKeyName },
      });

      return apiKey;
    },
    onSuccess: (apiKey) => {
      toast.success('API key created', {
        description: 'Copy it now - it won\'t be shown again',
      });
      navigator.clipboard.writeText(apiKey);
      setNewKeyName('');
      queryClient.invalidateQueries({ queryKey: ['workspace-api-keys'] });
    },
    onError: (error) => {
      toast.error('Failed to create API key: ' + error.message);
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (!workspace) throw new Error('No workspace');
      const { error } = await supabase
        .from('workspace_users' as any)
        .delete()
        .eq('workspace_id', workspace.id)
        .eq('user_id', userId);
      if (error) throw error;

      await logAudit(workspace.id, {
        action: AuditActions.MEMBER_REMOVED,
        resourceType: 'workspace_user',
        metadata: { user_id: userId },
      });
    },
    onSuccess: () => {
      toast.success('Member removed');
      queryClient.invalidateQueries({ queryKey: ['workspace-members'] });
    },
    onError: (error) => {
      toast.error('Failed to remove member: ' + error.message);
    },
  });

  if (!workspace) {
    return <div className="container py-8">Loading workspace...</div>;
  }

  return (
    <>
      <SEO
        title="Workspace Settings"
        description="Manage your workspace settings, team members, and API keys"
      />
      
      <div className="container py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{workspace.name}</h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{workspace.subscription_tier}</Badge>
            <Badge variant="secondary">{currentRole}</Badge>
          </div>
        </div>

        <Tabs defaultValue="members" className="space-y-6">
          <TabsList>
            <TabsTrigger value="members">
              <Users className="w-4 h-4 mr-2" />
              Members
            </TabsTrigger>
            {can('manage_api_keys') && (
              <TabsTrigger value="api-keys">
                <Key className="w-4 h-4 mr-2" />
                API Keys
              </TabsTrigger>
            )}
            {can('read') && (
              <TabsTrigger value="billing">
                <CreditCard className="w-4 h-4 mr-2" />
                Billing
              </TabsTrigger>
            )}
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-6">
            {can('manage_users') && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Invite Team Member</h3>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="colleague@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div className="w-40">
                    <Label htmlFor="role">Role</Label>
                    <Select value={inviteRole} onValueChange={(v: any) => setInviteRole(v)}>
                      <SelectTrigger id="role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="analyst">Analyst</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={() => inviteMutation.mutate()}
                      disabled={!inviteEmail || inviteMutation.isPending}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Invite
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Team Members</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    {can('manage_users') && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member: any) => (
                    <TableRow key={member.id}>
                      <TableCell>{member.profiles?.email || 'N/A'}</TableCell>
                      <TableCell>{member.profiles?.full_name || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{member.role}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(member.joined_at).toLocaleDateString()}
                      </TableCell>
                      {can('manage_users') && member.role !== 'owner' && (
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMemberMutation.mutate(member.user_id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {can('manage_api_keys') && (
            <TabsContent value="api-keys" className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Create API Key</h3>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="keyName">Key Name</Label>
                    <Input
                      id="keyName"
                      placeholder="Production API Key"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={() => createKeyMutation.mutate()}
                      disabled={!newKeyName || createKeyMutation.isPending}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Key
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">API Keys</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Prefix</TableHead>
                      <TableHead>Last Used</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiKeys.map((key: any) => (
                      <TableRow key={key.id}>
                        <TableCell>{key.name}</TableCell>
                        <TableCell>
                          <code className="text-xs">{key.key_prefix}</code>
                        </TableCell>
                        <TableCell>
                          {key.last_used_at
                            ? new Date(key.last_used_at).toLocaleDateString()
                            : 'Never'}
                        </TableCell>
                        <TableCell>
                          {new Date(key.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="billing">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Subscription</h3>
              <div className="space-y-4">
                <div>
                  <Label>Current Plan</Label>
                  <p className="text-2xl font-bold capitalize mt-1">
                    {workspace.subscription_tier}
                  </p>
                </div>
                <Button>Manage Billing</Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Workspace Settings</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="workspaceName">Workspace Name</Label>
                  <Input
                    id="workspaceName"
                    defaultValue={workspace.name}
                    disabled={!can('write')}
                  />
                </div>
                <div>
                  <Label htmlFor="workspaceSlug">Workspace Slug</Label>
                  <Input
                    id="workspaceSlug"
                    defaultValue={workspace.slug}
                    disabled
                  />
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
