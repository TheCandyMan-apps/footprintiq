import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { SEO } from "@/components/SEO";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ApiPlayground } from "@/components/dev/ApiPlayground";
import { SDKGenerator } from "@/components/dev/SDKGenerator";
import { RateLimitMonitor } from "@/components/dev/RateLimitMonitor";
import { EmbeddableWidget, generateEmbedCode } from "@/components/EmbeddableWidget";
import { WhiteLabelToggle } from "@/components/WhiteLabelToggle";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Code, Key, Play, Book, Activity, Plus, Trash2, ExternalLink, Sparkles, Palette } from "lucide-react";

export default function DeveloperPortal() {
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedApiKey, setSelectedApiKey] = useState<string>();
  const { toast } = useToast();

  useEffect(() => {
    loadApiKeys();
  }, []);

  const generateApiKey = async () => {
    if (!newKeyName.trim()) {
      toast({ title: "Error", description: "Please enter a key name", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
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

      setSelectedApiKey(key);
      
      // Copy to clipboard
      navigator.clipboard.writeText(key);
      
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

  return (
    <>
      <SEO 
        title="Developer Portal — FootprintIQ API & SDKs"
        description="Build with FootprintIQ. Access comprehensive API documentation, SDK generators, interactive playground, and developer tools for OSINT integration."
        canonical="https://footprintiq.app/developers"
      />
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Code className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">Developer Portal</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Build powerful OSINT integrations with FootprintIQ APIs
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{apiKeys.length}</div>
                <p className="text-sm text-muted-foreground">Active API Keys</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">4</div>
                <p className="text-sm text-muted-foreground">SDK Languages</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">12</div>
                <p className="text-sm text-muted-foreground">API Endpoints</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">99.9%</div>
                <p className="text-sm text-muted-foreground">API Uptime</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="keys" className="space-y-6">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="keys">
                <Key className="h-4 w-4 mr-2" />
                API Keys
              </TabsTrigger>
              <TabsTrigger value="playground">
                <Play className="h-4 w-4 mr-2" />
                Playground
              </TabsTrigger>
              <TabsTrigger value="sdk">
                <Code className="h-4 w-4 mr-2" />
                SDK Generator
              </TabsTrigger>
              <TabsTrigger value="widget">
                <Sparkles className="h-4 w-4 mr-2" />
                Widget
              </TabsTrigger>
              <TabsTrigger value="whitelabel">
                <Palette className="h-4 w-4 mr-2" />
                White-Label
              </TabsTrigger>
              <TabsTrigger value="docs">
                <Book className="h-4 w-4 mr-2" />
                Documentation
              </TabsTrigger>
              <TabsTrigger value="monitoring">
                <Activity className="h-4 w-4 mr-2" />
                Monitoring
              </TabsTrigger>
            </TabsList>

            {/* API Keys Tab */}
            <TabsContent value="keys" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Manage API Keys</CardTitle>
                  <CardDescription>
                    Create and manage API keys for programmatic access to FootprintIQ
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Create New Key */}
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

                  {/* Display New Key */}
                  {selectedApiKey && (
                    <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                      <p className="text-sm font-medium mb-2 text-green-900 dark:text-green-100">
                        ✓ New API Key Created (copied to clipboard)
                      </p>
                      <code className="text-xs bg-white dark:bg-gray-900 p-2 rounded block break-all">
                        {selectedApiKey}
                      </code>
                      <p className="text-xs text-green-700 dark:text-green-300 mt-2">
                        Save this key securely - you won't be able to see it again!
                      </p>
                    </div>
                  )}

                  {/* List Keys */}
                  <div className="space-y-2">
                    {apiKeys.map((key) => (
                      <div key={key.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{key.name}</p>
                          <p className="text-sm text-muted-foreground font-mono">
                            {key.key_prefix}••••••••
                          </p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              Created: {new Date(key.created_at).toLocaleDateString()}
                            </Badge>
                            {key.last_used_at && (
                              <Badge variant="outline" className="text-xs">
                                Last used: {new Date(key.last_used_at).toLocaleDateString()}
                              </Badge>
                            )}
                          </div>
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

              {/* Security Best Practices */}
              <Card>
                <CardHeader>
                  <CardTitle>Security Best Practices</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Never commit API keys to version control</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Use environment variables to store keys</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Rotate keys regularly and delete unused keys</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Use separate keys for development and production</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Monitor API usage for unusual activity</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Playground Tab */}
            <TabsContent value="playground">
              <ApiPlayground />
            </TabsContent>

            {/* SDK Generator Tab */}
            <TabsContent value="sdk">
              <SDKGenerator apiKey={selectedApiKey} />
            </TabsContent>

            {/* Documentation Tab */}
            <TabsContent value="docs" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>API Documentation</CardTitle>
                  <CardDescription>
                    Comprehensive guides and references for FootprintIQ APIs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <a href="/docs/api" className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                      <div>
                        <p className="font-medium">REST API Reference</p>
                        <p className="text-sm text-muted-foreground">Complete endpoint documentation</p>
                      </div>
                      <ExternalLink className="h-5 w-5 text-muted-foreground" />
                    </a>
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                      <div>
                        <p className="font-medium">Authentication Guide</p>
                        <p className="text-sm text-muted-foreground">Learn how to authenticate API requests</p>
                      </div>
                      <ExternalLink className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                      <div>
                        <p className="font-medium">Webhook Integration</p>
                        <p className="text-sm text-muted-foreground">Set up real-time event notifications</p>
                      </div>
                      <ExternalLink className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                      <div>
                        <p className="font-medium">Rate Limits & Quotas</p>
                        <p className="text-sm text-muted-foreground">Understand API usage limits</p>
                      </div>
                      <ExternalLink className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Start Examples */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Start Examples</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Basic Scan Query</h4>
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`// Fetch recent scans
const response = await fetch(
  'https://byuzgvauaeldjqxlrjci.supabase.co/functions/v1/api-v1/scans?limit=10',
  {
    headers: {
      'x-api-key': 'YOUR_API_KEY'
    }
  }
);

const scans = await response.json();
console.log(scans);`}
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Filter Findings by Severity</h4>
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`// Get high severity findings
const response = await fetch(
  'https://byuzgvauaeldjqxlrjci.supabase.co/functions/v1/api-v1/findings?scan_id=SCAN_ID&severity=high',
  {
    headers: {
      'x-api-key': 'YOUR_API_KEY'
    }
  }
);

const findings = await response.json();`}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Monitoring Tab */}
            <TabsContent value="monitoring">
              <RateLimitMonitor />
            </TabsContent>

            {/* Widget Tab */}
            <TabsContent value="widget" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Embeddable Username Widget</CardTitle>
                  <CardDescription>
                    Add username availability checks to your website
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Preview</h4>
                    <EmbeddableWidget branded={true} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Embed Code</Label>
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                      {generateEmbedCode(true)}
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(generateEmbedCode(true));
                        toast({ title: "Copied!", description: "Embed code copied to clipboard" });
                      }}
                    >
                      Copy Embed Code
                    </Button>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Free tier:</strong> Includes "Made with FootprintIQ" badge. 
                      Upgrade to Premium to remove branding.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* White-Label Tab */}
            <TabsContent value="whitelabel">
              <WhiteLabelToggle />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
}
