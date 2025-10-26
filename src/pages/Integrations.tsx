import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Webhook, MessageSquare, Send, Database, Shield, CheckCircle2 } from "lucide-react";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  configuration_schema: { name: string; label: string; type: string; required: boolean }[];
}

interface UserIntegration {
  id: string;
  integration_id: string;
  is_active: boolean;
  last_sync_at: string | null;
  configuration: any;
}

const Integrations = () => {
  const [availableIntegrations, setAvailableIntegrations] = useState<Integration[]>([]);
  const [userIntegrations, setUserIntegrations] = useState<UserIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load available integrations from catalog
      const { data: catalog } = await supabase
        .from('integration_catalog')
        .select('*')
        .order('name');

      // Load user's integrations
      const { data: userInts } = await supabase
        .from('user_integrations')
        .select('*')
        .eq('user_id', user.id);

      setAvailableIntegrations((catalog || []) as unknown as Integration[]);
      setUserIntegrations(userInts || []);
    } catch (error) {
      console.error('Error loading integrations:', error);
      toast({
        title: "Error",
        description: "Failed to load integrations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!selectedIntegration) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_integrations')
        .insert({
          user_id: user.id,
          integration_id: selectedIntegration.id,
          configuration: configValues,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `${selectedIntegration.name} connected successfully`,
      });

      setSelectedIntegration(null);
      setConfigValues({});
      loadIntegrations();
    } catch (error) {
      console.error('Error connecting integration:', error);
      toast({
        title: "Error",
        description: "Failed to connect integration",
        variant: "destructive"
      });
    }
  };

  const toggleIntegration = async (integrationId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('user_integrations')
        .update({ is_active: !currentStatus })
        .eq('id', integrationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Integration ${!currentStatus ? 'enabled' : 'disabled'}`,
      });

      loadIntegrations();
    } catch (error) {
      console.error('Error toggling integration:', error);
      toast({
        title: "Error",
        description: "Failed to update integration",
        variant: "destructive"
      });
    }
  };

  const getIcon = (category: string) => {
    switch (category) {
      case 'messaging': return MessageSquare;
      case 'webhook': return Webhook;
      case 'siem': return Shield;
      case 'crm': return Database;
      default: return Send;
    }
  };

  const groupedIntegrations = availableIntegrations.reduce((acc, integration) => {
    if (!acc[integration.category]) {
      acc[integration.category] = [];
    }
    acc[integration.category].push(integration);
    return acc;
  }, {} as Record<string, Integration[]>);

  const isConnected = (integrationId: string) => {
    return userIntegrations.some(ui => ui.integration_id === integrationId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <SEO 
        title="Enterprise Integrations — Connect FootprintIQ to Your Tools"
        description="Connect FootprintIQ with Slack, Teams, Discord, Splunk, Salesforce, and more. Seamless integration with your existing security stack."
        canonical="https://footprintiq.app/integrations"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://footprintiq.app/"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Integrations",
              "item": "https://footprintiq.app/integrations"
            }
          ]
        }}
      />
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading integrations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <SEO 
        title="Integrations - FootprintIQ"
        description="Connect FootprintIQ with your favorite tools and platforms"
      />
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Integrations</h1>
            <p className="text-muted-foreground">
              Connect FootprintIQ with your favorite tools and platforms
            </p>
          </div>

          <Tabs defaultValue="marketplace" className="space-y-6">
            <TabsList>
              <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
              <TabsTrigger value="my-integrations">My Integrations</TabsTrigger>
            </TabsList>

            <TabsContent value="marketplace" className="space-y-6">
              {Object.entries(groupedIntegrations).map(([category, integrations]) => (
                <div key={category}>
                  <h2 className="text-2xl font-semibold mb-4 capitalize">{category}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {integrations.map((integration) => {
                      const Icon = getIcon(integration.category);
                      const connected = isConnected(integration.id);
                      
                      return (
                        <Card key={integration.id}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                  <Icon className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                  <CardTitle className="text-lg">{integration.name}</CardTitle>
                                  {connected && (
                                    <Badge variant="default" className="mt-1">
                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                      Connected
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <CardDescription>{integration.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            {!connected ? (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    className="w-full" 
                                    onClick={() => setSelectedIntegration(integration)}
                                  >
                                    Connect
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Connect {integration.name}</DialogTitle>
                                    <DialogDescription>
                                      Configure your {integration.name} integration
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    {integration.configuration_schema?.map((field) => (
                                      <div key={field.name} className="space-y-2">
                                        <Label htmlFor={field.name}>
                                          {field.label}
                                          {field.required && <span className="text-destructive ml-1">*</span>}
                                        </Label>
                                        <Input
                                          id={field.name}
                                          type={field.type}
                                          value={configValues[field.name] || ''}
                                          onChange={(e) => setConfigValues({
                                            ...configValues,
                                            [field.name]: e.target.value
                                          })}
                                          required={field.required}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                  <Button onClick={handleConnect} className="w-full">
                                    Connect Integration
                                  </Button>
                                </DialogContent>
                              </Dialog>
                            ) : (
                              <Button variant="outline" className="w-full" disabled>
                                Already Connected
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="my-integrations" className="space-y-4">
              {userIntegrations.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No integrations connected yet. Visit the marketplace to get started.
                  </CardContent>
                </Card>
              ) : (
                userIntegrations.map((userInt) => {
                  const integration = availableIntegrations.find(i => i.id === userInt.integration_id);
                  if (!integration) return null;
                  
                  const Icon = getIcon(integration.category);
                  
                  return (
                    <Card key={userInt.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Icon className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle>{integration.name}</CardTitle>
                              <CardDescription>
                                {userInt.last_sync_at 
                                  ? `Last synced: ${new Date(userInt.last_sync_at).toLocaleString()}`
                                  : 'Never synced'}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge variant={userInt.is_active ? "default" : "secondary"}>
                              {userInt.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            <Switch
                              checked={userInt.is_active}
                              onCheckedChange={() => toggleIntegration(userInt.id, userInt.is_active)}
                            />
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  );
                })
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Integrations;
