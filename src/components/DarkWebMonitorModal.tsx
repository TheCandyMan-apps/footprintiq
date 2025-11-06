import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, Clock, ExternalLink, Bell, BellOff, Skull, Shield } from 'lucide-react';
import { format } from 'date-fns';

interface DarkWebFinding {
  id: string;
  user_id: string;
  finding_type: string;
  data_exposed: string[];
  source_url: string | null;
  severity: string;
  discovered_at: string;
  is_verified: boolean;
  provider: string;
  url: string;
  is_new: boolean;
  notified_at: string | null;
}

interface DarkWebMonitorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onClearNew: () => void;
}

export const DarkWebMonitorModal = ({ open, onOpenChange, userId, onClearNew }: DarkWebMonitorModalProps) => {
  const { toast } = useToast();
  const [findings, setFindings] = useState<DarkWebFinding[]>([]);
  const [loading, setLoading] = useState(true);
  const [snoozedUntil, setSnoozedUntil] = useState<Date | null>(null);

  useEffect(() => {
    if (open && userId) {
      fetchFindings();
      checkSnoozeStatus();
    }
  }, [open, userId]);

  useEffect(() => {
    if (!open || !userId) return;

    // Mark findings as notified when modal is opened
    markAsNotified();
    onClearNew();
  }, [open, userId]);

  const fetchFindings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('darkweb_findings')
        .select('*')
        .eq('user_id', userId)
        .order('discovered_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setFindings(data || []);
    } catch (error) {
      console.error('Error fetching dark web findings:', error);
      toast({
        title: 'Error loading findings',
        description: 'Failed to fetch dark web monitoring data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const checkSnoozeStatus = async () => {
    const snoozed = localStorage.getItem(`darkweb_snooze_${userId}`);
    if (snoozed) {
      const snoozeDate = new Date(snoozed);
      if (snoozeDate > new Date()) {
        setSnoozedUntil(snoozeDate);
      } else {
        localStorage.removeItem(`darkweb_snooze_${userId}`);
      }
    }
  };

  const markAsNotified = async () => {
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('darkweb_findings')
        .update({ is_new: false, notified_at: now })
        .eq('user_id', userId)
        .eq('is_new', true);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking findings as notified:', error);
    }
  };

  const handleSnooze = () => {
    const snoozeDate = new Date();
    snoozeDate.setDate(snoozeDate.getDate() + 7);
    localStorage.setItem(`darkweb_snooze_${userId}`, snoozeDate.toISOString());
    setSnoozedUntil(snoozeDate);
    
    toast({
      title: 'Notifications snoozed',
      description: 'Dark web alerts muted for 7 days',
    });
    
    onOpenChange(false);
  };

  const handleUnsnooze = () => {
    localStorage.removeItem(`darkweb_snooze_${userId}`);
    setSnoozedUntil(null);
    
    toast({
      title: 'Notifications enabled',
      description: 'Dark web alerts are now active',
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'high':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'low':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
      case 'high':
        return <Skull className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <div className="relative">
                <Skull className="w-6 h-6 text-destructive animate-pulse" />
                <div className="absolute inset-0 bg-destructive/20 rounded-full blur-xl animate-pulse" />
              </div>
              Dark Web Monitor
            </DialogTitle>
            <div className="flex items-center gap-2">
              {snoozedUntil ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUnsnooze}
                  className="gap-2"
                >
                  <Bell className="w-4 h-4" />
                  Enable Alerts
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSnooze}
                  className="gap-2"
                >
                  <BellOff className="w-4 h-4" />
                  Snooze 7 Days
                </Button>
              )}
            </div>
          </div>
          {snoozedUntil && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 p-2 rounded-md mt-2">
              <Clock className="w-4 h-4" />
              Notifications snoozed until {format(snoozedUntil, 'MMM d, yyyy')}
            </div>
          )}
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-destructive border-t-transparent rounded-full animate-spin" />
          </div>
        ) : findings.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="w-16 h-16 mx-auto mb-4 text-accent opacity-50" />
            <h3 className="text-lg font-semibold mb-2">All Clear!</h3>
            <p className="text-sm text-muted-foreground">
              No dark web findings detected for your account
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {findings.map((finding) => (
                <Card
                  key={finding.id}
                  className={`p-4 border-l-4 transition-all hover:shadow-lg ${
                    finding.severity === 'critical' || finding.severity === 'high'
                      ? 'border-l-destructive bg-destructive/5'
                      : 'border-l-border'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={getSeverityColor(finding.severity)}>
                          {getSeverityIcon(finding.severity)}
                          <span className="ml-1">{finding.severity.toUpperCase()}</span>
                        </Badge>
                        {finding.is_new && (
                          <Badge className="bg-destructive text-white animate-pulse">
                            NEW
                          </Badge>
                        )}
                        {finding.is_verified && (
                          <Badge variant="outline" className="gap-1">
                            <Shield className="w-3 h-3" />
                            Verified
                          </Badge>
                        )}
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm mb-1">{finding.finding_type}</h4>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(finding.discovered_at), 'MMM d, yyyy - h:mm a')}
                        </p>
                      </div>

                      {finding.data_exposed && finding.data_exposed.length > 0 && (
                        <div>
                          <p className="text-xs font-medium mb-1">Data Exposed:</p>
                          <div className="flex flex-wrap gap-1">
                            {finding.data_exposed.map((data, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {data}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Source: {finding.provider || 'Unknown'}</span>
                      </div>
                    </div>

                    {(finding.source_url || finding.url) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(finding.source_url || finding.url, '_blank')}
                        className="gap-1 shrink-0"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};
