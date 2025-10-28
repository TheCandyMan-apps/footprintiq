import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Mail, Trash2, Crown, Shield, Eye } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface TeamMembersProps {
  teamId: string;
}

export default function TeamMembers({ teamId }: TeamMembersProps) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member" | "viewer">("member");

  const { data: members, refetch: refetchMembers } = useQuery({
    queryKey: ["team-members", teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members" as any)
        .select("*")
        .eq("team_id", teamId)
        .order("joined_at", { ascending: false });

      if (error) throw error;
      return data as any[];
    },
  });

  const { data: invitations, refetch: refetchInvitations } = useQuery({
    queryKey: ["team-invitations", teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_invitations" as any)
        .select("*")
        .eq("team_id", teamId)
        .is("accepted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as any[];
    },
  });

  const inviteMember = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { error } = await supabase
        .from("team_invitations" as any)
        .insert({
          team_id: teamId,
          email: inviteEmail,
          role: inviteRole,
          invited_by: user.id,
          expires_at: expiresAt.toISOString(),
        });

      if (error) throw error;

      toast.success("Invitation sent successfully");
      setInviteEmail("");
      refetchInvitations();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from("team_members" as any)
        .delete()
        .eq("id", memberId);

      if (error) throw error;

      toast.success("Member removed");
      refetchMembers();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner": return <Crown className="h-4 w-4" />;
      case "admin": return <Shield className="h-4 w-4" />;
      case "viewer": return <Eye className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Invite Member</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="email@example.com"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            <Select value={inviteRole} onValueChange={(v: any) => setInviteRole(v)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={inviteMember}>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite
            </Button>
          </div>
        </CardContent>
      </Card>

      {invitations && invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {invitations.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{invite.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Expires {new Date(invite.expires_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize">{invite.role}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Team Members ({members?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {members?.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getRoleIcon(member.role)}
                  <div>
                    <p className="text-sm font-medium">User {member.user_id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(member.joined_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">{member.role}</Badge>
                  {member.role !== "owner" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMember(member.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
