import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Shield, UserPlus } from "lucide-react";
import { format } from "date-fns";

export default function RoleManagement() {
  const { data: userRoles, isLoading } = useQuery({
    queryKey: ["user-roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "destructive";
      case "moderator": return "warning";
      case "analyst": return "primary";
      default: return "secondary";
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Role Management</h1>
          <p className="text-muted-foreground">Manage user roles and permissions</p>
        </div>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Grant Role
        </Button>
      </div>

      {isLoading ? (
        <div>Loading roles...</div>
      ) : (
        <div className="space-y-4">
          {userRoles?.map((userRole: any) => (
            <Card key={userRole.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">User ID: {userRole.user_id.slice(0, 8)}...</span>
                      <Badge variant={getRoleColor(userRole.role) as any}>
                        {userRole.role}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Created: {format(new Date(userRole.created_at), "PPp")}
                      {userRole.expires_at && ` • Expires: ${format(new Date(userRole.expires_at), "PPp")}`}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Revoke
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
