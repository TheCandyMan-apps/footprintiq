import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Settings, Mail, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { WorkspaceCases } from "@/components/workspace/WorkspaceCases";

export default function Workspaces() {
  const { workspace, workspaces, switchWorkspace, refreshWorkspace } = useWorkspace();
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"viewer" | "analyst" | "admin">("analyst");
  const queryClient = useQueryClient();

  const createWorkspaceMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Generate a safe, unique slug
      const base = name.trim().toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 60) || 'workspace';
      const slug = `${base}-${Math.random().toString(36).slice(2,7)}`;

      // Create workspace
      const { data: ws, error: wsError } = await supabase
        .from("workspaces" as any)
        .insert({ name, owner_id: user.id, slug })
        .select()
        .single();

      if (wsError) throw wsError;
      if (!ws) throw new Error("Failed to create workspace");

      // Add creator as admin member (required for downstream RLS checks)
      const { error: memberError } = await supabase.from("workspace_members" as any).insert({
        workspace_id: (ws as any).id,
        user_id: user.id,
        role: "admin",
      });
      if (memberError) throw memberError;

      // Set as active workspace
      sessionStorage.setItem('current_workspace_id', (ws as any).id);

      return ws as any;
    },
    onSuccess: () => {
      toast.success("Workspace created");
      setNewWorkspaceName("");
      refreshWorkspace();
    },
    onError: (err: any) => {
      const msg = err?.message || 'Failed to create workspace';
      toast.error(msg);
    }
  });

  const inviteMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      if (!workspace) throw new Error("No workspace selected");

      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { error } = await supabase.from("workspace_invites" as any).insert({
        workspace_id: workspace.id,
        email,
        role,
        token,
        expires_at: expiresAt.toISOString(),
      });

      if (error) throw error;

      // Call edge function to send email
      await supabase.functions.invoke("workspace-invitation", {
        body: { email, token, workspaceName: workspace.name },
      });
    },
    onSuccess: () => {
      toast.success("Invitation sent");
      setInviteEmail("");
    },
  });

  const deleteWorkspaceMutation = useMutation({
    mutationFn: async (workspaceId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Check if user is the owner
      const targetWorkspace = workspaces.find((w: any) => w.id === workspaceId);
      if (targetWorkspace?.owner_id !== user.id) {
        throw new Error("Only workspace owners can delete workspaces");
      }

      const { error } = await supabase
        .from("workspaces" as any)
        .delete()
        .eq("id", workspaceId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Workspace deleted");
      refreshWorkspace();
    },
    onError: (err: any) => {
      const msg = err?.message || 'Failed to delete workspace';
      toast.error(msg);
    }
  });

  const handleDeleteWorkspace = async (workspaceId: string) => {
    if (!confirm('Are you sure you want to delete this workspace? This will delete all data associated with it. This action cannot be undone.')) {
      return;
    }

    deleteWorkspaceMutation.mutate(workspaceId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Workspaces</h1>
          <p className="text-muted-foreground">
            Collaborate with your team on investigations
          </p>
          <div className="mt-4">
            <Link to="/workspace-management">
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Manage Workspaces
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {workspaces.map((ws: any) => (
            <Card
              key={ws.id}
              className={ws.id === workspace?.id ? "border-primary" : ""}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{ws.name}</span>
                  {ws.id === workspace?.id && (
                    <Badge variant="secondary">Active</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {ws.role === "admin" ? "Administrator" : ws.role}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{ws.member_count || 1} members</span>
                </div>
                <div className="flex gap-2">
                  {ws.id !== workspace?.id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => switchWorkspace(ws.id)}
                    >
                      Switch
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" asChild>
                    <a href={`/workspace?id=${ws.id}`}>
                      <Settings className="h-4 w-4" />
                    </a>
                  </Button>
                  {ws.owner_id === ws.user_id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteWorkspace(ws.id)}
                      className="hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          <Dialog>
            <DialogTrigger asChild>
              <Card className="border-dashed cursor-pointer hover:border-primary transition-colors">
                <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px]">
                  <Plus className="h-12 w-12 mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">Create Workspace</p>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Workspace</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="workspace-name">Workspace Name</Label>
                  <Input
                    id="workspace-name"
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    placeholder="My Investigation Team"
                  />
                </div>
                <Button
                  onClick={() => createWorkspaceMutation.mutate(newWorkspaceName)}
                  disabled={!newWorkspaceName || createWorkspaceMutation.isPending}
                  className="w-full"
                >
                  Create Workspace
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {workspace && (
          <>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Invite Team Members
                </CardTitle>
                <CardDescription>
                  Add collaborators to {workspace.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="md:col-span-2">
                    <Label htmlFor="invite-email">Email Address</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="colleague@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="invite-role">Role</Label>
                    <Select value={inviteRole} onValueChange={(v: any) => setInviteRole(v)}>
                      <SelectTrigger id="invite-role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="analyst">Analyst</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  onClick={() => inviteMutation.mutate({ email: inviteEmail, role: inviteRole })}
                  disabled={!inviteEmail || inviteMutation.isPending}
                  className="mt-4"
                >
                  Send Invitation
                </Button>
              </CardContent>
            </Card>

            <WorkspaceCases workspaceId={workspace.id} />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
