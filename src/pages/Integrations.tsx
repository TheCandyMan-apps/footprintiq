import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plug, Shield, Ticket, MessageSquare, Activity, Check, X } from "lucide-react";
import { Header } from "@/components/Header";

interface Integration {
  id: string;
  name: string;
  category: string;
  description: string;
  provider: string;
  config_schema: any;
  logo_url?: string;
}

interface UserIntegration {
  id: string;
  integration_id: string;
  name: string;
  is_active: boolean;
  last_sync: string | null;
  integration_catalog: Integration;
}

const categoryIcons = {
  siem: Shield,
  ticketing: Ticket,
  communication: MessageSquare,
  other: Plug,
};

export default function Integrations() {
  const navigate = useNavigate();
  const [availableIntegrations, setAvailableIntegrations] = useState<Integration[]>([]);
  const [userIntegrations, setUserIntegrations] = useState<UserIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, string>>({});

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Load available integrations
      const { data: catalog, error: catalogError } = await supabase
        .from("integration_catalog")
        .select("*")
        .eq("is_active", true)
        .order("category", { ascending: true });

      if (catalogError) throw catalogError;
      setAvailableIntegrations(catalog || []);

      // Load user's integrations
      const { data: userInts, error: userError } = await supabase
        .from("user_integrations")
        .select(`
          *,
          integration_catalog (*)
        `)
        .eq("user_id", user.id);

      if (userError) throw userError;
      setUserIntegrations(userInts || []);
    } catch (error: any) {
      toast.error("Failed to load integrations");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!selectedIntegration) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("user_integrations")
        .insert({
          user_id: user.id,
          integration_id: selectedIntegration.id,
          name: `${selectedIntegration.name} Integration`,
          config: configValues,
          is_active: true,
        });

      if (error) throw error;

      toast.success(`${selectedIntegration.name} connected successfully`);
      setSelectedIntegration(null);
      setConfigValues({});
      loadIntegrations();
    } catch (error: any) {
      toast.error("Failed to connect integration");
      console.error(error);
    }
  };

  const toggleIntegration = async (integrationId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("user_integrations")
        .update({ is_active: !currentStatus })
        .eq("id", integrationId);

      if (error) throw error;

      toast.success(`Integration ${!currentStatus ? "enabled" : "disabled"}`);
      loadIntegrations();
    } catch (error: any) {
      toast.error("Failed to update integration");
      console.error(error);
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
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Integration Marketplace</h1>
            <p className="text-muted-foreground">
              Connect FootprintIQ with your favorite tools and services
            </p>
          </div>

          <Tabs defaultValue="marketplace" className="space-y-6">
            <TabsList>
              <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
              <TabsTrigger value="connected">My Integrations ({userIntegrations.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="marketplace" className="space-y-6">
              {Object.entries(groupedIntegrations).map(([category, integrations]) => {
                const Icon = categoryIcons[category as keyof typeof categoryIcons] || Plug;
                return (
                  <div key={category}>
                    <div className="flex items-center gap-2 mb-4">
                      <Icon className="h-5 w-5" />
                      <h2 className="text-2xl font-bold capitalize">{category}</h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {integrations.map((integration) => (
                        <Card key={integration.id}>
                          <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                              {integration.name}
                              {isConnected(integration.id) && (
                                <Badge variant="secondary">
                                  <Check className="h-3 w-3 mr-1" />
                                  Connected
                                </Badge>
                              )}
                            </CardTitle>
                            <CardDescription>{integration.provider}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                              {integration.description}
                            </p>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  className="w-full" 
                                  variant={isConnected(integration.id) ? "outline" : "default"}
                                  onClick={() => setSelectedIntegration(integration)}
                                  disabled={isConnected(integration.id)}
                                >
                                  {isConnected(integration.id) ? "Already Connected" : "Connect"}
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Connect {integration.name}</DialogTitle>
                                  <DialogDescription>
                                    Configure your {integration.name} integration
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  {Object.keys(integration.config_schema).map((key) => (
                                    <div key={key}>
                                      <Label htmlFor={key} className="capitalize">
                                        {key.replace(/_/g, " ")}
                                      </Label>
                                      <Input
                                        id={key}
                                        type={key.includes("password") || key.includes("token") || key.includes("key") ? "password" : "text"}
                                        value={configValues[key] || ""}
                                        onChange={(e) =>
                                          setConfigValues({ ...configValues, [key]: e.target.value })
                                        }
                                        placeholder={`Enter ${key.replace(/_/g, " ")}`}
                                      />
                                    </div>
                                  ))}
                                  <Button onClick={handleConnect} className="w-full">
                                    Connect Integration
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </TabsContent>

            <TabsContent value="connected" className="space-y-4">
              {userIntegrations.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Plug className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No integrations connected</h3>
                    <p className="text-muted-foreground">
                      Connect your first integration from the marketplace
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {userIntegrations.map((userInt) => {
                    const Icon = categoryIcons[userInt.integration_catalog.category as keyof typeof categoryIcons] || Plug;
                    return (
                      <Card key={userInt.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <Icon className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <CardTitle>{userInt.name}</CardTitle>
                                <CardDescription>
                                  {userInt.integration_catalog.provider}
                                </CardDescription>
                              </div>
                            </div>
                            <Badge variant={userInt.is_active ? "default" : "secondary"}>
                              {userInt.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {userInt.last_sync && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Activity className="h-4 w-4" />
                                Last sync: {new Date(userInt.last_sync).toLocaleString()}
                              </div>
                            )}
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => toggleIntegration(userInt.id, userInt.is_active)}
                            >
                              {userInt.is_active ? (
                                <>
                                  <X className="h-4 w-4 mr-2" />
                                  Disable
                                </>
                              ) : (
                                <>
                                  <Check className="h-4 w-4 mr-2" />
                                  Enable
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
