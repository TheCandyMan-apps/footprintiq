import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Settings, Trash2, Crown, Shield, Eye, Search, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { SEO } from "@/components/SEO";

export default function WorkspaceManagement() {
  const navigate = useNavigate();
  const { workspace, workspaces, switchWorkspace, refreshWorkspace } = useWorkspace();
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null);
  const [addMemberEmail, setAddMemberEmail] = useState("");
  const [addMemberRole, setAddMemberRole] = useState<"viewer" | "analyst" | "admin">("viewer");
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ['workspace-members', selectedWorkspace],
    enabled: !!selectedWorkspace,
    queryFn: async () => {
      if (!selectedWorkspace) return [];
      
      const client: any = supabase;
      const { data, error } = await client
        .from('workspace_members')
        .select(`
          id,
          user_id,
          role,
          created_at,
          profiles:user_id (
            email,
            full_name
          )
        `)
        .eq('workspace_id', selectedWorkspace);

      if (error) throw error;
      return data || [];
    }
  });

  const deleteWorkspaceMutation = useMutation({
    mutationFn: async (workspaceId: string) => {
      if (!user) throw new Error("Not authenticated");

      const targetWorkspace = workspaces.find((w: any) => w.id === workspaceId);
      if (targetWorkspace?.owner_id !== user.id) {
        throw new Error("Only workspace owners can delete workspaces");
      }

      const client: any = supabase;
      const { error } = await client
        .from("workspaces")
        .delete()
        .eq("id", workspaceId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Workspace deleted successfully");
      setSelectedWorkspace(null);
      refreshWorkspace();
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to delete workspace');
    }
  });

  const removeMemberMutation = useMutation({
    mutationFn: async ({ workspaceId, memberId }: { workspaceId: string; memberId: string }) => {
      const client: any = supabase;
      const { error } = await client
        .from("workspace_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Member removed");
      queryClient.invalidateQueries({ queryKey: ['workspace-members'] });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to remove member');
    }
  });

  const changeMemberRoleMutation = useMutation({
    mutationFn: async ({ workspaceId, memberId, newRole }: { 
      workspaceId: string; 
      memberId: string; 
      newRole: 'viewer' | 'analyst' | 'admin' 
    }) => {
      const client: any = supabase;
      const { error } = await client
        .from("workspace_members")
        .update({ role: newRole })
        .eq("id", memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Member role updated");
      queryClient.invalidateQueries({ queryKey: ['workspace-members'] });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update role');
    }
  });

  const addMemberMutation = useMutation({
    mutationFn: async ({ workspaceId, email, role }: { 
      workspaceId: string; 
      email: string; 
      role: 'viewer' | 'analyst' | 'admin' 
    }) => {
      // Look up user by email
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', email)
        .single();

      if (!profile) {
        throw new Error('User not found. They must have an account first.');
      }

      // Add as member
      const client: any = supabase;
      const { error } = await client
        .from("workspace_members")
        .insert({
          workspace_id: workspaceId,
          user_id: profile.user_id,
          role: role
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Member added to workspace");
      setAddMemberEmail("");
      setAddMemberRole("viewer");
      queryClient.invalidateQueries({ queryKey: ['workspace-members'] });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to add member');
    }
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'analyst':
        return <Search className="h-4 w-4 text-green-500" />;
      default:
        return <Eye className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, any> = {
      owner: 'default',
      admin: 'secondary',
      analyst: 'outline',
      viewer: 'outline'
    };
    return variants[role] || 'outline';
  };

  const isOwner = (workspaceId: string) => {
    const ws = workspaces.find((w: any) => w.id === workspaceId);
    return ws?.owner_id === user?.id;
  };

  return (
    <>
      <SEO
        title="Workspace Management — FootprintIQ"
        description="Manage your workspaces, members, and permissions"
        canonical="https://footprintiq.app/workspace-management"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Workspace Management</h1>
              <p className="text-muted-foreground">
                Manage your workspaces, members, and permissions
              </p>
            </div>
            <Button 
              onClick={() => navigate('/workspaces')}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Create New Workspace
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Workspace List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Your Workspaces
                </CardTitle>
                <CardDescription>
                  {workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {workspaces.map((ws: any) => (
                  <div
                    key={ws.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedWorkspace === ws.id
                        ? 'border-primary bg-accent'
                        : 'hover:bg-accent'
                    }`}
                    onClick={() => setSelectedWorkspace(ws.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">{ws.name}</h3>
                          {isOwner(ws.id) && (
                            <Crown className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          <span>{ws.member_count || 1} member{ws.member_count !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                    {ws.id === workspace?.id && (
                      <Badge variant="secondary" className="text-xs">Active</Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Workspace Details */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Workspace Details</CardTitle>
                <CardDescription>
                  {selectedWorkspace
                    ? 'Manage members and settings'
                    : 'Select a workspace to view details'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedWorkspace ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a workspace from the list to view details</p>
                  </div>
                ) : (
                  <Tabs defaultValue="members">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="members">Members</TabsTrigger>
                      <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="members" className="space-y-4">
                      {isOwner(selectedWorkspace) && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Add Member</CardTitle>
                            <CardDescription>Add existing users to this workspace</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex gap-4">
                              <Input
                                placeholder="user@example.com"
                                value={addMemberEmail}
                                onChange={(e) => setAddMemberEmail(e.target.value)}
                                className="flex-1"
                              />
                              <Select value={addMemberRole} onValueChange={(v) => setAddMemberRole(v as any)}>
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="viewer">Viewer</SelectItem>
                                  <SelectItem value="analyst">Analyst</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button 
                                onClick={() => addMemberMutation.mutate({
                                  workspaceId: selectedWorkspace,
                                  email: addMemberEmail,
                                  role: addMemberRole
                                })}
                                disabled={!addMemberEmail || addMemberMutation.isPending}
                              >
                                Add
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                      
                      {membersLoading ? (
                        <div className="text-center py-8 text-muted-foreground">
                          Loading members...
                        </div>
                      ) : !members || members.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No members found
                        </div>
                      ) : (
                        <div className="border rounded-lg">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Member</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {members.map((member: any) => (
                                <TableRow key={member.id}>
                                  <TableCell>
                                    <div>
                                      <div className="font-medium">
                                        {member.profiles?.full_name || 'Unknown'}
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        {member.profiles?.email}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {isOwner(selectedWorkspace) && member.user_id !== user?.id ? (
                                      <Select 
                                        value={member.role}
                                        onValueChange={(newRole) => changeMemberRoleMutation.mutate({
                                          workspaceId: selectedWorkspace,
                                          memberId: member.id,
                                          newRole: newRole as any
                                        })}
                                      >
                                        <SelectTrigger className="w-32">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="viewer">
                                            <div className="flex items-center gap-2">
                                              <Eye className="h-4 w-4" />
                                              Viewer
                                            </div>
                                          </SelectItem>
                                          <SelectItem value="analyst">
                                            <div className="flex items-center gap-2">
                                              <Search className="h-4 w-4" />
                                              Analyst
                                            </div>
                                          </SelectItem>
                                          <SelectItem value="admin">
                                            <div className="flex items-center gap-2">
                                              <Shield className="h-4 w-4" />
                                              Admin
                                            </div>
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        {getRoleIcon(member.role)}
                                        <Badge variant={getRoleBadge(member.role)}>
                                          {member.role}
                                        </Badge>
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-sm text-muted-foreground">
                                    {new Date(member.created_at).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {isOwner(selectedWorkspace) && member.user_id !== user?.id && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeMemberMutation.mutate({
                                          workspaceId: selectedWorkspace,
                                          memberId: member.id
                                        })}
                                        className="hover:bg-destructive/10 hover:text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-4">
                      {(() => {
                        const ws = workspaces.find((w: any) => w.id === selectedWorkspace);
                        if (!ws) return null;

                        return (
                          <div className="space-y-6">
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium">Workspace Name</label>
                                <p className="text-lg">{ws.name}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Workspace Slug</label>
                                <p className="text-sm text-muted-foreground">{ws.slug}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Subscription Tier</label>
                                <Badge variant="outline">{ws.subscription_tier}</Badge>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Created</label>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(ws.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>

                            {isOwner(selectedWorkspace) && (
                              <div className="pt-6 border-t">
                                <h3 className="text-lg font-semibold mb-4 text-destructive">
                                  Danger Zone
                                </h3>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="destructive" className="w-full">
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete Workspace
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the
                                        workspace "{ws.name}" and all associated data including scans,
                                        cases, and reports.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => deleteWorkspaceMutation.mutate(selectedWorkspace)}
                                        className="bg-destructive hover:bg-destructive/90"
                                      >
                                        Delete Workspace
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
