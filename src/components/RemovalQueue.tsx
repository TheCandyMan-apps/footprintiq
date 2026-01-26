import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getAIResponse } from '@/lib/aiRouter';
import { ExternalLink, Trash2, Send, CheckCircle2, Clock, XCircle, Loader2, Database } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface DataBrokerProfile {
  id: string;
  name: string;
  url: string;
  category: string;
  data_found: string[];
  scan_id: string;
}

interface RemovalRequest {
  id: string;
  source_id: string;
  source_name: string;
  status: string;
  requested_at: string;
}

interface RemovalQueueProps {
  scanId?: string;
  userId?: string;
}

export const RemovalQueue = ({ scanId, userId }: RemovalQueueProps) => {
  const { toast } = useToast();
  const [dataBrokers, setDataBrokers] = useState<DataBrokerProfile[]>([]);
  const [removalRequests, setRemovalRequests] = useState<RemovalRequest[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<Set<string>>(new Set());
  const [prioritizing, setPrioritizing] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchDataBrokers();
      fetchRemovalRequests();
    }
  }, [userId, scanId]);

  const prioritise = async (brokers: DataBrokerProfile[]) => {
    if (brokers.length === 0) return brokers;
    
    try {
      setPrioritizing(true);
      const riskScore = brokers.reduce((sum, b) => sum + b.data_found.length, 0);
      const brokerNames = brokers.map(b => b.name);
      
      const { content } = await getAIResponse({
        systemPrompt: "Return ONLY a JSON array of broker names sorted by removal urgency (most urgent first).",
        userPrompt: `Brokers: ${brokerNames.join(", ")}. User risk score: ${riskScore}`,
        preferredModel: "gemini",
      });
      
      const prioritizedNames = JSON.parse(content) as string[];
      
      // Sort brokers based on AI prioritization
      const sortedBrokers = [...brokers].sort((a, b) => {
        const indexA = prioritizedNames.indexOf(a.name);
        const indexB = prioritizedNames.indexOf(b.name);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
      
      return sortedBrokers;
    } catch (error) {
      console.error('AI prioritization failed:', error);
      return brokers; // Fallback to original order
    } finally {
      setPrioritizing(false);
    }
  };

  useEffect(() => {
    if (dataBrokers.length > 0) {
      prioritise(dataBrokers).then(setDataBrokers);
    }
  }, [dataBrokers.length]);

  const fetchDataBrokers = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('data_sources')
        .select('*')
        .or('category.ilike.%broker%,category.ilike.%people%,name.ilike.%broker%');

      if (scanId) {
        query = query.eq('scan_id', scanId);
      } else {
        // Get all scans for this user
        const { data: scans } = await supabase
          .from('scans')
          .select('id')
          .eq('user_id', userId);
        
        if (scans && scans.length > 0) {
          query = query.in('scan_id', scans.map(s => s.id));
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setDataBrokers(data || []);
    } catch (error) {
      console.error('Error fetching data brokers:', error);
      toast({
        title: 'Error loading data brokers',
        description: 'Failed to fetch data broker profiles',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRemovalRequests = async () => {
    try {
      let query = supabase
        .from('removal_requests')
        .select('*');

      if (scanId) {
        query = query.eq('scan_id', scanId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRemovalRequests(data || []);
    } catch (error) {
      console.error('Error fetching removal requests:', error);
    }
  };

  const getRemovalStatus = (brokerId: string): RemovalRequest | undefined => {
    return removalRequests.find(r => r.source_id === brokerId);
  };

  const handleRemovalRequest = async (broker: DataBrokerProfile) => {
    if (!userId || !broker.scan_id) return;

    setSubmitting(prev => new Set(prev).add(broker.id));

    try {
      const { error } = await supabase
        .from('removal_requests')
        .insert({
          user_id: userId!,
          scan_id: broker.scan_id,
          source_id: broker.id,
          source_name: broker.name,
          source_type: 'data_broker',
          status: 'in_progress',
        });

      if (error) throw error;

      // Update removals count for achievements
      const { data: current } = await supabase
        .from('user_achievements')
        .select('total_removals')
        .eq('user_id', userId)
        .maybeSingle();

      if (current) {
        await supabase
          .from('user_achievements')
          .update({ total_removals: (current.total_removals || 0) + 1 })
          .eq('user_id', userId);
      } else {
        await supabase
          .from('user_achievements')
          .insert({ user_id: userId, total_removals: 1 });
      }

      toast({
        title: 'Removal request sent',
        description: `Submitted removal request to ${broker.name}`,
      });

      await fetchRemovalRequests();
    } catch (error: any) {
      console.error('Error submitting removal request:', error);
      toast({
        title: 'Failed to submit request',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(prev => {
        const next = new Set(prev);
        next.delete(broker.id);
        return next;
      });
    }
  };

  const handleBulkSubmit = async () => {
    const selectedBrokers = dataBrokers.filter(b => selectedItems.has(b.id));
    
    for (const broker of selectedBrokers) {
      await handleRemovalRequest(broker);
    }
    
    setSelectedItems(new Set());
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === availableBrokers.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(availableBrokers.map(b => b.id)));
    }
  };

  const toggleItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const getStatusBadge = (status?: string) => {
    if (!status) {
      return <Badge variant="secondary">Not Submitted</Badge>;
    }

    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge className="gap-1 bg-blue-500">
            <Send className="w-3 h-3" />
            In Progress
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="gap-1 bg-green-500">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="w-3 h-3" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const availableBrokers = dataBrokers.filter(broker => {
    const request = getRemovalStatus(broker.id);
    return !request || request.status === 'failed';
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Removal Queue</CardTitle>
          <CardDescription>Loading data broker profiles...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Removal Queue</CardTitle>
            <CardDescription>
              Manage removal requests for data broker profiles ({dataBrokers.length} found)
            </CardDescription>
          </div>
          {/* Bulk removal - disabled until fully implemented */}
          <Button
            disabled
            className="gap-2 cursor-not-allowed opacity-60"
            title="Removal workflow coming soon"
          >
            <Send className="w-4 h-4" />
            Removal guidance (coming soon)
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {dataBrokers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Database className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No data broker profiles found</p>
            <p className="text-sm">Run a scan to find data broker profiles</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedItems.size === availableBrokers.length && availableBrokers.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Site Name</TableHead>
                  <TableHead>Data Found</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataBrokers.map((broker) => {
                  const request = getRemovalStatus(broker.id);
                  const canSubmit = !request || request.status === 'failed';
                  const isSubmitting = submitting.has(broker.id);

                  return (
                    <TableRow key={broker.id}>
                      <TableCell>
                        {canSubmit && (
                          <Checkbox
                            checked={selectedItems.has(broker.id)}
                            onCheckedChange={() => toggleItem(broker.id)}
                          />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{broker.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {broker.data_found.slice(0, 3).map((data, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {data}
                            </Badge>
                          ))}
                          {broker.data_found.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{broker.data_found.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(request?.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(broker.url, '_blank')}
                            className="gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View
                          </Button>
                          {/* Removal guidance - disabled until fully implemented */}
                          <Button
                            size="sm"
                            disabled
                            className="gap-1 cursor-not-allowed opacity-60"
                            title="Removal workflow coming soon"
                          >
                            <Send className="w-3 h-3" />
                            Removal guidance (coming soon)
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
