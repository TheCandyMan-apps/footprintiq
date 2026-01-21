import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Key, Copy, Trash2, Plus, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { SettingsBreadcrumb } from "@/components/settings/SettingsBreadcrumb";
import { SettingsNav } from "@/components/settings/SettingsNav";

// Type for the safe view that excludes key_hash
interface ApiKeySafe {
  id: string;
  user_id: string;
  workspace_id: string | null;
  name: string;
  key_prefix: string;
  is_active: boolean | null;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export default function APIKeys() {
  const queryClient = useQueryClient();
  const [newKeyName, setNewKeyName] = useState("");
  // Store the newly created key temporarily (only shown once)
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<{ id: string; key: string } | null>(null);

  // Fetch API keys using the safe view that excludes key_hash
  const { data: keys, isLoading } = useQuery({
    queryKey: ["api-keys"],
    queryFn: async (): Promise<ApiKeySafe[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Use the safe view that excludes key_hash to prevent hash exposure
      const { data, error } = await supabase
        .from("api_keys_safe" as any)
        .select("id, user_id, workspace_id, name, key_prefix, is_active, last_used_at, expires_at, created_at, updated_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data as unknown as ApiKeySafe[]) || [];
    },
  });

  // Create key mutation - uses secure Edge Function
  const createMutation = useMutation({
    mutationFn: async () => {
      // Call the secure Edge Function that generates and hashes the key server-side
      const { data, error } = await supabase.functions.invoke('create-api-key', {
        body: { name: newKeyName || 'API Key' }
      });

      if (error) throw error;
      if (!data || !data.key || !data.id) {
        throw new Error('Invalid response from server');
      }
      
      return { id: data.id, key: data.key };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success("API key created - copy it now, it won't be shown again!");
      setNewKeyName("");
      // Store the newly created key for one-time display
      setNewlyCreatedKey({ id: data.id, key: data.key });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to create API key");
    },
  });

  // Delete key mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("api_keys")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success("API key deleted");
    },
  });

  // Toggle key active status
  const toggleMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase
        .from("api_keys")
        .update({ is_active: active })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success("API key updated");
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };


  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="API Keys | FootprintIQ"
        description="Manage your FootprintIQ API keys for programmatic access to OSINT scanning and monitoring."
      />
      <Header />
      
      <main className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <SettingsNav />
            </div>
          </aside>
          <div className="min-w-0 space-y-8">
            <SettingsBreadcrumb currentPage="API Keys" />
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 shadow-elegant">
              <Key className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                API Keys
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage your API keys for programmatic access
              </p>
            </div>
          </div>

          {/* Create New Key */}
          <Card className="p-6 hover:shadow-elevated transition-all duration-300 border-muted/50">
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Plus className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Create New API Key</h2>
              </div>

              <div className="space-y-2">
                <Label>Key Name (Optional)</Label>
                <Input
                  placeholder="e.g., Production Server, Development"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
              </div>

              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create API Key"}
              </Button>
            </form>
          </Card>

          {/* Newly Created Key Alert - Show once */}
          {newlyCreatedKey && (
            <Card className="p-6 border-2 border-primary bg-primary/5">
              <div className="flex items-center gap-2 mb-3">
                <Key className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-primary">New API Key Created</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                <strong>Copy this key now!</strong> It will not be shown again. Keys are securely hashed on our servers.
              </p>
              <div className="flex items-center gap-2 mb-3">
                <code className="text-sm font-mono bg-muted px-3 py-2 rounded flex-1 break-all">
                  {newlyCreatedKey.key}
                </code>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    copyToClipboard(newlyCreatedKey.key);
                    toast.success("API key copied! Store it securely.");
                  }}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNewlyCreatedKey(null)}
              >
                I've saved my key
              </Button>
            </Card>
          )}

          {/* Existing Keys */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Your API Keys</h2>
            
            {isLoading ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Loading keys...</p>
              </Card>
            ) : !keys || keys.length === 0 ? (
              <Card className="p-12 text-center">
                <Key className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-xl font-semibold mb-2">No API keys yet</h3>
                <p className="text-muted-foreground">Create your first API key to get started</p>
              </Card>
            ) : (
              keys.map((key) => (
                <Card key={key.id} className="p-6 hover:shadow-elevated transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold">{key.name}</h3>
                        <Badge variant={key.is_active ? "default" : "secondary"}>
                          {key.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <code className="text-sm font-mono bg-muted px-3 py-1 rounded">
                          {key.key_prefix}{"•".repeat(48)}
                        </code>
                        <span className="text-xs text-muted-foreground">(Key is securely hashed)</span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Created: {format(new Date(key.created_at), "MMM d, yyyy")}</span>
                        {key.last_used_at && (
                          <span>Last used: {format(new Date(key.last_used_at), "MMM d, yyyy h:mm a")}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleMutation.mutate({ id: key.id, active: !key.is_active })}
                        title={key.is_active ? "Deactivate" : "Activate"}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm("Delete this API key? This action cannot be undone.")) {
                            deleteMutation.mutate(key.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Usage Information */}
          <Card className="p-6 bg-muted/50">
            <h3 className="font-semibold mb-3">API Key Security</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Keep your API keys secure and never share them publicly</li>
              <li>• Use different keys for different environments (production, development)</li>
              <li>• Rotate keys periodically for enhanced security</li>
              <li>• Deactivate unused keys immediately</li>
              <li>• Monitor key usage regularly for suspicious activity</li>
            </ul>
          </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
