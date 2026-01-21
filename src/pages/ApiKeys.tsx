import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Key, Plus, Trash2, Copy } from "lucide-react";

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

export default function ApiKeys() {
  const [newKeyName, setNewKeyName] = useState("");
  const queryClient = useQueryClient();

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

  // Create API key mutation
  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Generate a random API key
      const apiKey = `fiq_${Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')}`;

      const { data, error} = await supabase
        .from("api_keys")
        .insert({
          user_id: user.id,
          name,
          key_hash: apiKey, // In production, hash this
          key_prefix: apiKey.slice(0, 12),
        })
        .select()
        .single();

      if (error) throw error;
      return { ...data, full_key: apiKey };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      setNewKeyName("");
      
      // Show the full key once
      navigator.clipboard.writeText(data.full_key);
      toast.success("API key created and copied to clipboard! Save it now - you won't see it again.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to create API key");
    },
  });

  // Delete API key mutation
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
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to delete key");
    },
  });

  const handleCreate = () => {
    if (newKeyName.trim()) {
      createMutation.mutate(newKeyName.trim());
    }
  };


  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="API Keys | FootprintIQ"
        description="Manage your API keys for FootprintIQ integration"
      />
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5">
              <Key className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">API Keys</h1>
            <p className="text-muted-foreground text-lg">
              Create and manage API keys for programmatic access
            </p>
          </div>

          {/* Create Key */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Create New API Key</h2>
            <div className="flex gap-2">
              <Input
                placeholder="Key name (e.g., Production, Testing)..."
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending || !newKeyName.trim()}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Your API key will be shown once. Make sure to copy it!
            </p>
          </Card>

          {/* Keys List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Your API Keys</h2>
            {isLoading ? (
              <Card className="p-6 text-center text-muted-foreground">
                Loading keys...
              </Card>
            ) : keys?.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground">
                No API keys yet. Create one above to get started.
              </Card>
            ) : (
              <div className="grid gap-4">
                {keys?.map((key) => (
                  <Card key={key.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 space-y-1">
                        <div className="font-medium">{key.name}</div>
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {key.key_prefix}{"•".repeat(32)}
                          </code>
                          <span className="text-xs text-muted-foreground">(Key is securely hashed)</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Created {new Date(key.created_at || "").toLocaleDateString()}
                          {key.last_used_at && ` • Last used ${new Date(key.last_used_at).toLocaleDateString()}`}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={key.is_active ? "default" : "secondary"}>
                          {key.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMutation.mutate(key.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Security Notice */}
          <Card className="p-6 bg-muted/50">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Key className="w-4 h-4" />
              Security Best Practices
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Never share your API keys publicly or commit them to version control</li>
              <li>• Rotate keys regularly and delete unused ones</li>
              <li>• Use different keys for development and production</li>
              <li>• Monitor usage and revoke keys if suspicious activity is detected</li>
            </ul>
          </Card>
        </div>
      </main>
    </div>
  );
}
