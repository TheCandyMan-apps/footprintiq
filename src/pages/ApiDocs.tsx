import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Key, Trash2, Plus } from "lucide-react";
import { SEO } from "@/components/SEO";

export default function ApiDocs() {
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateApiKey = async () => {
    if (!newKeyName.trim()) {
      toast({ title: "Error", description: "Please enter a key name", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // Generate random API key
      const key = `fpiq_${crypto.randomUUID().replace(/-/g, "")}`;
      const encoder = new TextEncoder();
      const data = encoder.encode(key);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const keyHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

      const { data: newKey, error } = await supabase
        .from("api_keys")
        .insert({
          name: newKeyName,
          key_hash: keyHash,
          key_prefix: key.substring(0, 12),
          user_id: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "API Key Created",
        description: "Save this key securely - you won't see it again!",
      });

      // Show the full key to user (only time it's visible)
      alert(`Your API Key: ${key}\n\nSave this securely!`);
      
      setNewKeyName("");
      loadApiKeys();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const loadApiKeys = async () => {
    const { data, error } = await supabase
      .from("api_keys")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setApiKeys(data);
    }
  };

  const deleteApiKey = async (id: string) => {
    const { error } = await supabase.from("api_keys").delete().eq("id", id);
    
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "API key deleted" });
      loadApiKeys();
    }
  };

  useState(() => {
    loadApiKeys();
  });

  return (
    <>
      <SEO 
        title="API Documentation | FootprintIQ"
        description="Access FootprintIQ programmatically with our REST API"
      />
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">API Documentation</h1>
            <p className="text-muted-foreground">
              Access your FootprintIQ data programmatically
            </p>
          </div>

          {/* API Keys Management */}
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Manage your API keys for programmatic access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="keyName">Key Name</Label>
                  <Input
                    id="keyName"
                    placeholder="Production API Key"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
                <Button onClick={generateApiKey} disabled={loading} className="mt-6">
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Key
                </Button>
              </div>

              <div className="space-y-2">
                {apiKeys.map((key) => (
                  <div key={key.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{key.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {key.key_prefix}••••••••
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last used: {key.last_used_at ? new Date(key.last_used_at).toLocaleString() : "Never"}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteApiKey(key.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* API Documentation */}
          <Card>
            <CardHeader>
              <CardTitle>Endpoints</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">GET /scans</h3>
                <p className="text-sm text-muted-foreground mb-2">List all your scans</p>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`curl -X GET https://byuzgvauaeldjqxlrjci.supabase.co/functions/v1/api-scans/scans?limit=10 \\
  -H "x-api-key: YOUR_API_KEY"`}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2">GET /scans?id=SCAN_ID</h3>
                <p className="text-sm text-muted-foreground mb-2">Get a specific scan with details</p>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`curl -X GET https://byuzgvauaeldjqxlrjci.supabase.co/functions/v1/api-scans/scans?id=SCAN_ID \\
  -H "x-api-key: YOUR_API_KEY"`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
