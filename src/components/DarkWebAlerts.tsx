import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getAIResponse } from '@/lib/aiRouter';
import { AlertTriangle, Loader2, Shield, Eye, EyeOff } from 'lucide-react';

interface DarkWebAlert {
  id: string;
  scan_id: string;
  source_name: string;
  threat_level: string;
  description: string;
  discovered_at: string;
  raw_data: any;
}

interface DarkWebAlertsProps {
  scanId?: string;
  userId?: string;
}

export const DarkWebAlerts = ({ scanId, userId }: DarkWebAlertsProps) => {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<DarkWebAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const [summarizing, setSummarizing] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (userId) {
      fetchAlerts();
    }
  }, [userId, scanId]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('dark_web_findings')
        .select('*')
        .order('discovered_at', { ascending: false });

      if (scanId) {
        query = query.eq('scan_id', scanId);
      } else if (userId) {
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
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching dark web alerts:', error);
      toast({
        title: 'Error loading alerts',
        description: 'Failed to fetch dark web alerts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const summarise = async (alert: DarkWebAlert) => {
    try {
      setSummarizing(prev => new Set(prev).add(alert.id));
      
      const { content } = await getAIResponse({
        systemPrompt: "Summarise the threat in 2 sentences + one immediate action.",
        userPrompt: JSON.stringify(alert),
        preferredModel: "gemini",
      });
      
      setSummaries(prev => ({ ...prev, [alert.id]: content }));
      return content;
    } catch (error) {
      console.error('AI summarization failed:', error);
      toast({
        title: 'Summarization failed',
        description: 'Could not generate AI summary',
        variant: 'destructive',
      });
      return null;
    } finally {
      setSummarizing(prev => {
        const next = new Set(prev);
        next.delete(alert.id);
        return next;
      });
    }
  };

  const getThreatBadge = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'critical':
        return <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="w-3 h-3" />
          Critical
        </Badge>;
      case 'high':
        return <Badge className="gap-1 bg-orange-500">
          <AlertTriangle className="w-3 h-3" />
          High
        </Badge>;
      case 'medium':
        return <Badge className="gap-1 bg-yellow-500">
          Medium
        </Badge>;
      case 'low':
        return <Badge variant="outline">
          Low
        </Badge>;
      default:
        return <Badge variant="secondary">{level}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Dark Web Alerts
          </CardTitle>
          <CardDescription>Loading dark web monitoring data...</CardDescription>
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
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Dark Web Alerts
        </CardTitle>
        <CardDescription>
          {alerts.length} {alerts.length === 1 ? 'threat' : 'threats'} detected from dark web monitoring
        </CardDescription>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No dark web alerts found</p>
            <p className="text-sm">Your information appears safe</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => {
              const isSummarizing = summarizing.has(alert.id);
              const hasSummary = summaries[alert.id];
              
              return (
                <Card key={alert.id} className="border-l-4 border-l-destructive">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base">{alert.source_name}</CardTitle>
                          {getThreatBadge(alert.threat_level)}
                        </div>
                        <CardDescription>
                          Discovered {new Date(alert.discovered_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => summarise(alert)}
                        disabled={isSummarizing}
                        className="gap-2"
                      >
                        {isSummarizing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : hasSummary ? (
                          <>
                            <Eye className="w-4 h-4" />
                            Refresh Summary
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-4 h-4" />
                            AI Summary
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{alert.description}</p>
                    
                    {hasSummary && (
                      <div className="mt-3 p-3 bg-muted/50 rounded-lg border border-border">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                          <div className="text-sm whitespace-pre-wrap">{hasSummary}</div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
