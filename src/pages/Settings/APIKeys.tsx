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
import { Key, Copy, Trash2, Plus, Eye, EyeOff, RefreshCw } from "lucide-react";
import { format } from "date-fns";

export default function APIKeys() {
  const queryClient = useQueryClient();
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [newKeyName, setNewKeyName] = useState("");

  // Fetch API keys
  const { data: keys, isLoading } = useQuery({
    queryKey: ["api-keys"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("api_keys")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Create key mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Generate a random API key
      const keyValue = `fiq_${Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')}`;

      const { data, error } = await supabase
        .from("api_keys")
        .insert({
          user_id: user.id,
          name: newKeyName || "API Key",
          key_hash: keyValue, // Store full key for now (in production, hash this)
          key_prefix: keyValue.substring(0, 12),
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success("API key created");
      setNewKeyName("");
      // Auto-show the newly created key
      setShowKey({ ...showKey, [data.id]: true });
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

  const toggleKeyVisibility = (id: string) => {
    setShowKey({ ...showKey, [id]: !showKey[id] });
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
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
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
                          {showKey[key.id] ? key.key_hash : `${key.key_prefix}${"•".repeat(48)}`}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleKeyVisibility(key.id)}
                        >
                          {showKey[key.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(key.key_hash)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
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
      </main>
    </div>
  );
}
