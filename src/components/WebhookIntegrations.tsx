import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Send, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  is_active: boolean;
  events: string[];
  connector_type: 'slack' | 'discord' | 'teams' | 'generic';
  created_at: string;
  last_triggered_at: string | null;
  success_count: number;
  failure_count: number;
}

const EVENT_TYPES = [
  { value: 'scan.completed', label: 'Scan Completed' },
  { value: 'scan.failed', label: 'Scan Failed' },
  { value: 'findings.critical', label: 'Critical Findings Detected' },
  { value: 'findings.new', label: 'New Findings' },
];

const WEBHOOK_TYPES = [
  { value: 'slack', label: 'Slack', placeholder: 'https://hooks.slack.com/services/...' },
  { value: 'discord', label: 'Discord', placeholder: 'https://discord.com/api/webhooks/...' },
  { value: 'teams', label: 'Microsoft Teams', placeholder: 'https://outlook.office.com/webhook/...' },
  { value: 'generic', label: 'Generic Webhook', placeholder: 'https://your-server.com/webhook' },
];

export function WebhookIntegrations() {
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isTesting, setIsTesting] = useState<string | null>(null);
  const { toast } = useToast();
  
  // New webhook form state
  const [newWebhook, setNewWebhook] = useState({
    name: '',
    url: '',
    type: 'slack' as 'slack' | 'discord' | 'teams' | 'generic',
    events: ['scan.completed'] as string[],
  });

  useEffect(() => {
    loadWebhooks();
  }, []);

  const loadWebhooks = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('webhook_endpoints')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load webhooks',
        variant: 'destructive',
      });
      console.error(error);
    } else {
      setWebhooks(data || []);
    }
    setIsLoading(false);
  };

  const handleAddWebhook = async () => {
    if (!newWebhook.name || !newWebhook.url) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsAdding(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to add webhooks',
        variant: 'destructive',
      });
      setIsAdding(false);
      return;
    }

    const { error } = await supabase
      .from('webhook_endpoints')
      .insert({
        user_id: user.id,
        name: newWebhook.name,
        url: newWebhook.url,
        connector_type: newWebhook.type,
        events: newWebhook.events,
        is_active: true,
        signing_secret: crypto.randomUUID(), // Generate a signing secret
      });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to add webhook',
        variant: 'destructive',
      });
      console.error(error);
    } else {
      toast({
        title: 'Success',
        description: 'Webhook added successfully',
      });
      setNewWebhook({ name: '', url: '', type: 'slack', events: ['scan.completed'] });
      loadWebhooks();
    }
    
    setIsAdding(false);
  };

  const handleDeleteWebhook = async (id: string) => {
    const { error } = await supabase
      .from('webhook_endpoints')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete webhook',
        variant: 'destructive',
      });
      console.error(error);
    } else {
      toast({
        title: 'Success',
        description: 'Webhook deleted',
      });
      loadWebhooks();
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from('webhook_endpoints')
      .update({ is_active: isActive })
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update webhook',
        variant: 'destructive',
      });
      console.error(error);
    } else {
      toast({
        title: 'Success',
        description: isActive ? 'Webhook enabled' : 'Webhook disabled',
      });
      loadWebhooks();
    }
  };

  const handleTestWebhook = async (webhook: any) => {
    setIsTesting(webhook.id);
    
    try {
      const { error } = await supabase.functions.invoke('webhook-delivery', {
        body: {
          action: 'trigger',
          eventType: 'test.webhook',
          eventId: crypto.randomUUID(),
          webhookId: webhook.id,
          payload: {
            message: 'This is a test webhook from FootprintIQ',
            timestamp: new Date().toISOString(),
            test: true,
          },
        },
      });

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Test webhook sent successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send test webhook',
        variant: 'destructive',
      });
      console.error(error);
    } finally {
      setIsTesting(null);
    }
  };

  const toggleEvent = (event: string) => {
    setNewWebhook(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event]
    }));
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading webhooks...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Webhook Integrations</h2>
        <p className="text-muted-foreground">
          Send real-time scan notifications to Slack, Discord, Microsoft Teams, or custom webhooks
        </p>
      </div>

      <Tabs defaultValue="webhooks" className="w-full">
        <TabsList>
          <TabsTrigger value="webhooks">Active Webhooks</TabsTrigger>
          <TabsTrigger value="add">Add Webhook</TabsTrigger>
        </TabsList>

        <TabsContent value="webhooks" className="space-y-4">
          {webhooks.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <AlertCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p className="text-lg mb-2">No webhooks configured</p>
                  <p className="text-sm">Add your first webhook to start receiving notifications</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {webhooks.map((webhook) => (
                <Card key={webhook.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-lg">{webhook.name}</CardTitle>
                          <Badge variant={webhook.is_active ? 'default' : 'secondary'}>
                            {webhook.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline">{webhook.connector_type}</Badge>
                        </div>
                        <CardDescription className="text-xs break-all">
                          {webhook.url}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={webhook.is_active}
                          onCheckedChange={(checked) => handleToggleActive(webhook.id, checked)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTestWebhook(webhook)}
                          disabled={isTesting === webhook.id}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteWebhook(webhook.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Events: </span>
                        <span className="text-muted-foreground">
                          {webhook.events.join(', ')}
                        </span>
                      </div>
                      <div className="flex gap-4 text-muted-foreground">
                        <span>✓ {webhook.success_count} successful</span>
                        <span>✗ {webhook.failure_count} failed</span>
                        {webhook.last_triggered_at && (
                          <span>Last: {new Date(webhook.last_triggered_at).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="add" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Webhook</CardTitle>
              <CardDescription>
                Configure a new webhook endpoint to receive scan notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-name">Webhook Name</Label>
                <Input
                  id="webhook-name"
                  placeholder="My Slack Channel"
                  value={newWebhook.name}
                  onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhook-type">Type</Label>
                <Select
                  value={newWebhook.type}
                  onValueChange={(value: any) => setNewWebhook({ ...newWebhook, type: value })}
                >
                  <SelectTrigger id="webhook-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WEBHOOK_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input
                  id="webhook-url"
                  type="url"
                  placeholder={WEBHOOK_TYPES.find(t => t.value === newWebhook.type)?.placeholder}
                  value={newWebhook.url}
                  onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Events to Subscribe</Label>
                <div className="grid grid-cols-2 gap-2">
                  {EVENT_TYPES.map((event) => (
                    <div key={event.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={event.value}
                        checked={newWebhook.events.includes(event.value)}
                        onChange={() => toggleEvent(event.value)}
                        className="rounded"
                      />
                      <label htmlFor={event.value} className="text-sm cursor-pointer">
                        {event.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleAddWebhook} 
                disabled={isAdding}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Webhook
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Setup Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold mb-1">Slack</h4>
                <p className="text-muted-foreground">
                  Create an incoming webhook in your Slack workspace settings at api.slack.com/messaging/webhooks
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Discord</h4>
                <p className="text-muted-foreground">
                  Go to Server Settings → Integrations → Webhooks → New Webhook
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Microsoft Teams</h4>
                <p className="text-muted-foreground">
                  In your Teams channel, go to Connectors → Incoming Webhook
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
