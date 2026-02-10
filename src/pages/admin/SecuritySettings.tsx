import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Shield, 
  Mail, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Loader2,
  Ban,
  Eye,
  ShieldAlert,
  Bot,
  Clock,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface BlockedDomain {
  id: string;
  domain: string;
  category: string;
  reason: string | null;
  is_active: boolean;
  created_at: string;
}

interface BrandPattern {
  id: string;
  pattern: string;
  description: string | null;
  is_regex: boolean;
  is_active: boolean;
  created_at: string;
}

interface RateLimitThreshold {
  id: string;
  metric_type: string;
  threshold_value: number;
  window_minutes: number;
  flag_type: string;
  is_active: boolean;
}

interface AutoFlaggedUser {
  id: string;
  user_id: string;
  flag_type: string;
  reason: string;
  notes: string | null;
  created_at: string;
  profiles?: {
    email: string;
    full_name: string | null;
  };
}

const FLAG_ICONS = {
  suspicious: AlertTriangle,
  watching: Eye,
  high_risk: ShieldAlert,
  abuse: Ban,
  spam: Bot,
};

export default function SecuritySettings() {
  const [loading, setLoading] = useState(true);
  const [blockedDomains, setBlockedDomains] = useState<BlockedDomain[]>([]);
  const [brandPatterns, setBrandPatterns] = useState<BrandPattern[]>([]);
  const [thresholds, setThresholds] = useState<RateLimitThreshold[]>([]);
  const [autoFlaggedUsers, setAutoFlaggedUsers] = useState<AutoFlaggedUser[]>([]);
  
  // Add domain form
  const [newDomain, setNewDomain] = useState('');
  const [newDomainCategory, setNewDomainCategory] = useState('disposable');
  const [newDomainReason, setNewDomainReason] = useState('');
  const [addingDomain, setAddingDomain] = useState(false);
  
  // Add pattern form
  const [newPattern, setNewPattern] = useState('');
  const [newPatternDesc, setNewPatternDesc] = useState('');
  const [newPatternIsRegex, setNewPatternIsRegex] = useState(false);
  const [addingPattern, setAddingPattern] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [domainsRes, patternsRes, thresholdsRes, flaggedRes] = await Promise.all([
        supabase.from('email_domain_blocklist').select('*').order('domain'),
        supabase.from('brand_protection_patterns').select('*').order('pattern'),
        supabase.from('rate_limit_thresholds').select('*').order('metric_type'),
        supabase
          .from('flagged_users')
          .select('*, profiles!flagged_users_user_id_fkey(email, full_name)')
          .eq('is_active', true)
          .ilike('notes', '%Auto-flagged%')
          .order('created_at', { ascending: false })
          .limit(50),
      ]);

      if (domainsRes.data) setBlockedDomains(domainsRes.data);
      if (patternsRes.data) setBrandPatterns(patternsRes.data);
      if (thresholdsRes.data) setThresholds(thresholdsRes.data);
      if (flaggedRes.data) setAutoFlaggedUsers(flaggedRes.data as any);
    } catch (error) {
      console.error('Error fetching security settings:', error);
      toast.error('Failed to load security settings');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDomain = async () => {
    if (!newDomain.trim()) {
      toast.error('Please enter a domain');
      return;
    }

    setAddingDomain(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('email_domain_blocklist')
        .insert({
          domain: newDomain.toLowerCase().trim(),
          category: newDomainCategory,
          reason: newDomainReason.trim() || null,
          added_by: user?.id,
        });

      if (error) throw error;

      toast.success('Domain added to blocklist');
      setNewDomain('');
      setNewDomainReason('');
      fetchAllData();
    } catch (error: any) {
      console.error('Error adding domain:', error);
      toast.error(error.message || 'Failed to add domain');
    } finally {
      setAddingDomain(false);
    }
  };

  const handleToggleDomain = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('email_domain_blocklist')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
      
      setBlockedDomains(prev => 
        prev.map(d => d.id === id ? { ...d, is_active: isActive } : d)
      );
    } catch (error: any) {
      toast.error(error.message || 'Failed to update domain');
    }
  };

  const handleDeleteDomain = async (id: string) => {
    try {
      const { error } = await supabase
        .from('email_domain_blocklist')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setBlockedDomains(prev => prev.filter(d => d.id !== id));
      toast.success('Domain removed from blocklist');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove domain');
    }
  };

  const handleAddPattern = async () => {
    if (!newPattern.trim()) {
      toast.error('Please enter a pattern');
      return;
    }

    setAddingPattern(true);
    try {
      const { error } = await supabase
        .from('brand_protection_patterns')
        .insert({
          pattern: newPattern.toLowerCase().trim(),
          description: newPatternDesc.trim() || null,
          is_regex: newPatternIsRegex,
        });

      if (error) throw error;

      toast.success('Brand pattern added');
      setNewPattern('');
      setNewPatternDesc('');
      setNewPatternIsRegex(false);
      fetchAllData();
    } catch (error: any) {
      console.error('Error adding pattern:', error);
      toast.error(error.message || 'Failed to add pattern');
    } finally {
      setAddingPattern(false);
    }
  };

  const handleTogglePattern = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('brand_protection_patterns')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
      
      setBrandPatterns(prev => 
        prev.map(p => p.id === id ? { ...p, is_active: isActive } : p)
      );
    } catch (error: any) {
      toast.error(error.message || 'Failed to update pattern');
    }
  };

  const handleDeletePattern = async (id: string) => {
    try {
      const { error } = await supabase
        .from('brand_protection_patterns')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setBrandPatterns(prev => prev.filter(p => p.id !== id));
      toast.success('Pattern removed');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove pattern');
    }
  };

  const handleUpdateThreshold = async (id: string, value: number) => {
    try {
      const { error } = await supabase
        .from('rate_limit_thresholds')
        .update({ threshold_value: value })
        .eq('id', id);

      if (error) throw error;
      
      setThresholds(prev => 
        prev.map(t => t.id === id ? { ...t, threshold_value: value } : t)
      );
      toast.success('Threshold updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update threshold');
    }
  };

  const handleToggleThreshold = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('rate_limit_thresholds')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
      
      setThresholds(prev => 
        prev.map(t => t.id === id ? { ...t, is_active: isActive } : t)
      );
    } catch (error: any) {
      toast.error(error.message || 'Failed to update threshold');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <AdminBreadcrumb currentPage="Security Settings" />
      <div>
        <h1 className="text-3xl font-bold">Security Settings</h1>
        <p className="text-muted-foreground">
          Manage email blocklists, brand protection, and rate limit alerts
        </p>
      </div>

      {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <Mail className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{blockedDomains.filter(d => d.is_active).length}</p>
                  <p className="text-sm text-muted-foreground">Blocked Domains</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Shield className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{brandPatterns.filter(p => p.is_active).length}</p>
                  <p className="text-sm text-muted-foreground">Brand Patterns</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Activity className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{thresholds.filter(t => t.is_active).length}</p>
                  <p className="text-sm text-muted-foreground">Active Thresholds</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-destructive/10 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{autoFlaggedUsers.length}</p>
                  <p className="text-sm text-muted-foreground">Auto-Flagged Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="blocklist" className="space-y-4">
          <TabsList>
            <TabsTrigger value="blocklist">Email Blocklist</TabsTrigger>
            <TabsTrigger value="brand">Brand Protection</TabsTrigger>
            <TabsTrigger value="rate-limits">Rate Limit Alerts</TabsTrigger>
            <TabsTrigger value="auto-flagged">Auto-Flagged Users</TabsTrigger>
          </TabsList>

          {/* Email Blocklist Tab */}
          <TabsContent value="blocklist">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Domain Blocklist
                </CardTitle>
                <CardDescription>
                  Block signups from disposable and suspicious email domains
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Domain Form */}
                <div className="flex gap-2 p-4 bg-muted/30 rounded-lg">
                  <Input
                    placeholder="domain.com"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    className="flex-1"
                  />
                  <Select value={newDomainCategory} onValueChange={setNewDomainCategory}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="disposable">Disposable</SelectItem>
                      <SelectItem value="temporary">Temporary</SelectItem>
                      <SelectItem value="suspicious">Suspicious</SelectItem>
                      <SelectItem value="spam">Spam</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Reason (optional)"
                    value={newDomainReason}
                    onChange={(e) => setNewDomainReason(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleAddDomain} disabled={addingDomain}>
                    {addingDomain ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  </Button>
                </div>

                {/* Domains Table */}
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Domain</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Active</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {blockedDomains.map((domain) => (
                        <TableRow key={domain.id}>
                          <TableCell className="font-mono">{domain.domain}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{domain.category}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {domain.reason || '-'}
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={domain.is_active}
                              onCheckedChange={(checked) => handleToggleDomain(domain.id, checked)}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteDomain(domain.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Brand Protection Tab */}
          <TabsContent value="brand">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Brand Protection Patterns
                </CardTitle>
                <CardDescription>
                  Detect and flag accounts with brand-mimicking usernames
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Pattern Form */}
                <div className="flex gap-2 p-4 bg-muted/30 rounded-lg items-center">
                  <Input
                    placeholder="Pattern to detect"
                    value={newPattern}
                    onChange={(e) => setNewPattern(e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Description"
                    value={newPatternDesc}
                    onChange={(e) => setNewPatternDesc(e.target.value)}
                    className="flex-1"
                  />
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={newPatternIsRegex}
                      onCheckedChange={setNewPatternIsRegex}
                    />
                    <Label className="text-sm">Regex</Label>
                  </div>
                  <Button onClick={handleAddPattern} disabled={addingPattern}>
                    {addingPattern ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  </Button>
                </div>

                {/* Patterns Table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pattern</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {brandPatterns.map((pattern) => (
                      <TableRow key={pattern.id}>
                        <TableCell className="font-mono">{pattern.pattern}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {pattern.description || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={pattern.is_regex ? 'secondary' : 'outline'}>
                            {pattern.is_regex ? 'Regex' : 'Contains'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={pattern.is_active}
                            onCheckedChange={(checked) => handleTogglePattern(pattern.id, checked)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePattern(pattern.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rate Limit Alerts Tab */}
          <TabsContent value="rate-limits">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Rate Limit Alert Thresholds
                </CardTitle>
                <CardDescription>
                  Configure thresholds that trigger automatic flagging
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Metric</TableHead>
                      <TableHead>Threshold</TableHead>
                      <TableHead>Window</TableHead>
                      <TableHead>Flag Type</TableHead>
                      <TableHead>Active</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {thresholds.map((threshold) => (
                      <TableRow key={threshold.id}>
                        <TableCell className="font-medium">
                          {threshold.metric_type.replace(/_/g, ' ')}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={threshold.threshold_value}
                            onChange={(e) => handleUpdateThreshold(threshold.id, parseInt(e.target.value, 10))}
                            className="w-24"
                            min="1"
                          />
                        </TableCell>
                        <TableCell>
                          {threshold.window_minutes >= 60 
                            ? `${threshold.window_minutes / 60} hour(s)` 
                            : `${threshold.window_minutes} minutes`}
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive">{threshold.flag_type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={threshold.is_active}
                            onCheckedChange={(checked) => handleToggleThreshold(threshold.id, checked)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Auto-Flagged Users Tab */}
          <TabsContent value="auto-flagged">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Auto-Flagged Users
                </CardTitle>
                <CardDescription>
                  Users automatically flagged by security rules
                </CardDescription>
              </CardHeader>
              <CardContent>
                {autoFlaggedUsers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No auto-flagged users yet
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {autoFlaggedUsers.map((flagged) => {
                        const FlagIcon = FLAG_ICONS[flagged.flag_type as keyof typeof FLAG_ICONS] || AlertTriangle;
                        return (
                          <div
                            key={flagged.id}
                            className="p-4 border rounded-lg space-y-2 bg-destructive/5"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <FlagIcon className="h-5 w-5 text-destructive" />
                                <span className="font-medium">
                                  {flagged.profiles?.email || 'Unknown'}
                                </span>
                                <Badge variant="destructive">{flagged.flag_type}</Badge>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(flagged.created_at), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-sm">{flagged.reason}</p>
                            {flagged.notes && (
                              <p className="text-xs text-muted-foreground">{flagged.notes}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
    </div>
  );
}