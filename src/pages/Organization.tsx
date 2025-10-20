import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Users, Plus, Trash2, Shield, Activity } from "lucide-react";
import { SEO } from "@/components/SEO";

interface Organization {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  created_at: string;
}

interface Member {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profiles: { email: string; full_name: string };
}

export default function Organization() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [newOrgName, setNewOrgName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");

  useEffect(() => {
    checkAuth();
    loadOrganization();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const loadOrganization = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if user belongs to an organization
      const { data: memberData } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .single();

      if (memberData) {
        // Load organization details
        const { data: orgData } = await supabase
          .from("organizations")
          .select("*")
          .eq("id", memberData.organization_id)
          .single();

        setOrganization(orgData);

        // Load members without join - fetch separately
        const { data: membersData } = await supabase
          .from("organization_members")
          .select("*")
          .eq("organization_id", memberData.organization_id);

        // Fetch profile data for each member
        if (membersData) {
          const membersWithProfiles = await Promise.all(
            membersData.map(async (member) => {
              const { data: profile } = await supabase
                .from("profiles")
                .select("email, full_name")
                .eq("user_id", member.user_id)
                .single();
              
              return {
                ...member,
                profiles: profile || { email: "Unknown", full_name: "Unknown" }
              };
            })
          );
          setMembers(membersWithProfiles);
        }
      }
    } catch (error) {
      console.error("Error loading organization:", error);
    } finally {
      setLoading(false);
    }
  };

  const createOrganization = async () => {
    if (!newOrgName.trim()) {
      toast({ title: "Error", description: "Please enter organization name", variant: "destructive" });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .insert({
          name: newOrgName,
          owner_id: user.id,
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Add creator as admin
      await supabase
        .from("organization_members")
        .insert({
          organization_id: org.id,
          user_id: user.id,
          role: "admin",
        });

      toast({ title: "Success", description: "Organization created" });
      loadOrganization();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const inviteMember = async () => {
    if (!inviteEmail.trim()) {
      toast({ title: "Error", description: "Please enter email", variant: "destructive" });
      return;
    }

    try {
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { data: { user } } = await supabase.auth.getUser();

      await supabase.from("team_invitations").insert({
        organization_id: organization!.id,
        email: inviteEmail,
        role: inviteRole,
        invited_by: user!.id,
        token,
        expires_at: expiresAt.toISOString(),
      });

      toast({ title: "Success", description: "Invitation sent" });
      setInviteEmail("");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      await supabase.from("organization_members").delete().eq("id", memberId);
      toast({ title: "Success", description: "Member removed" });
      loadOrganization();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (loading) {
    return <div className="container mx-auto py-8">Loading...</div>;
  }

  return (
    <>
      <SEO title="Organization | FootprintIQ" description="Manage your organization and team" />
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Organization</h1>
            <p className="text-muted-foreground">Manage your team and collaboration</p>
          </div>

          {!organization ? (
            <Card>
              <CardHeader>
                <CardTitle>Create Organization</CardTitle>
                <CardDescription>Start collaborating with your team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Organization Name</Label>
                  <Input
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    placeholder="Acme Security Team"
                  />
                </div>
                <Button onClick={createOrganization}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Organization
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>{organization.name}</CardTitle>
                  <CardDescription>
                    {organization.description || "Manage your organization settings"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-2xl font-bold">{members.length}</p>
                        <p className="text-sm text-muted-foreground">Team Members</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-2xl font-bold">
                          {members.filter(m => m.role === "admin").length}
                        </p>
                        <p className="text-sm text-muted-foreground">Admins</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-2xl font-bold">Active</p>
                        <p className="text-sm text-muted-foreground">Status</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>Manage access and roles</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{member.profiles?.full_name || "Unknown"}</p>
                          <p className="text-sm text-muted-foreground">{member.profiles?.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={member.role === "admin" ? "default" : "secondary"}>
                            {member.role}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeMember(member.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <Label>Invite Member</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="email@example.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                      <select
                        className="border rounded px-3"
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value)}
                      >
                        <option value="viewer">Viewer</option>
                        <option value="analyst">Analyst</option>
                        <option value="admin">Admin</option>
                      </select>
                      <Button onClick={inviteMember}>Invite</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </>
  );
}
