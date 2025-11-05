import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Shield, TrendingUp, Clock, Zap } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type Scan = Database['public']['Tables']['scans']['Row'];

interface ThreatAlert {
  id: string;
  type: 'high_risk' | 'new_breach' | 'credential_leak' | 'dark_web';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  target: string;
  timestamp: string;
  scanId: string;
}

export function ThreatFeedSidebar() {
  const { open } = useSidebar();
  const [alerts, setAlerts] = useState<ThreatAlert[]>([]);
  const [recentScans, setRecentScans] = useState<Scan[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const initUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        fetchInitialData(session.user.id);
      }
    };
    initUser();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Set up realtime subscription for new scans
    const channel = supabase
      .channel('threat-feed-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'scans',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newScan = payload.new as Scan;
          handleNewScan(newScan);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'scans',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const updatedScan = payload.new as Scan;
          handleScanUpdate(updatedScan);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchInitialData = async (userId: string) => {
    try {
      const { data: scansData, error } = await supabase
        .from('scans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      if (scansData) {
        setRecentScans(scansData);
        generateAlertsFromScans(scansData);
      }
    } catch (error) {
      console.error('Error fetching threat feed data:', error);
    }
  };

  const handleNewScan = (scan: Scan) => {
    setRecentScans(prev => [scan, ...prev].slice(0, 20));
    
    // Generate alert for new high-risk findings
    if ((scan.high_risk_count || 0) > 0) {
      const newAlert: ThreatAlert = {
        id: `alert-${scan.id}-${Date.now()}`,
        type: 'high_risk',
        severity: (scan.high_risk_count || 0) > 5 ? 'critical' : 'high',
        message: `${scan.high_risk_count} high-risk findings detected`,
        target: scan.email || scan.phone || scan.username || 'Unknown',
        timestamp: scan.created_at,
        scanId: scan.id,
      };
      setAlerts(prev => [newAlert, ...prev].slice(0, 50));
    }
  };

  const handleScanUpdate = (scan: Scan) => {
    setRecentScans(prev => 
      prev.map(s => s.id === scan.id ? scan : s)
    );
  };

  const generateAlertsFromScans = (scans: Scan[]) => {
    const newAlerts: ThreatAlert[] = [];
    
    scans.forEach(scan => {
      if ((scan.high_risk_count || 0) > 0) {
        newAlerts.push({
          id: `alert-${scan.id}`,
          type: 'high_risk',
          severity: (scan.high_risk_count || 0) > 5 ? 'critical' : 'high',
          message: `${scan.high_risk_count} high-risk findings`,
          target: scan.email || scan.phone || scan.username || 'Unknown',
          timestamp: scan.created_at,
          scanId: scan.id,
        });
      }
    });

    setAlerts(newAlerts.slice(0, 50));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'high_risk':
        return AlertTriangle;
      case 'new_breach':
        return Shield;
      case 'credential_leak':
        return Zap;
      case 'dark_web':
        return TrendingUp;
      default:
        return AlertTriangle;
    }
  };

  return (
    <Sidebar
      side="right"
      className={open ? "w-80" : "w-16"}
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-border/50 p-4">
        <div className="flex items-center justify-between">
          {open && (
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-destructive/10">
                <Shield className="w-4 h-4 text-destructive" />
              </div>
              <div>
                <h2 className="font-semibold text-sm">Threat Feed</h2>
                <p className="text-xs text-muted-foreground">Live updates</p>
              </div>
            </div>
          )}
          <SidebarTrigger className="ml-auto" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="h-full">
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
              {open && "Recent Alerts"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="space-y-2 p-2">
                {alerts.length === 0 ? (
                  open && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No threats detected</p>
                      <p className="text-xs mt-1">You're all clear!</p>
                    </div>
                  )
                ) : (
                  alerts.map((alert) => {
                    const Icon = getAlertIcon(alert.type);
                    return (
                      <div
                        key={alert.id}
                        className="group relative p-3 rounded-lg border border-border/50 bg-card/50 hover:bg-card hover:border-destructive/30 transition-all duration-300 cursor-pointer animate-fade-in"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-destructive/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                        
                        {!open ? (
                          <div className="flex justify-center">
                            <Icon className="w-5 h-5 text-destructive" />
                          </div>
                        ) : (
                          <div className="relative z-10 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                                <Badge 
                                  variant={getSeverityColor(alert.severity) as any}
                                  className="text-xs"
                                >
                                  {alert.severity}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium mb-1">{alert.message}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                Target: {alert.target}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>

          {open && (
            <SidebarGroup className="mt-4">
              <SidebarGroupLabel>Recent Activity</SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="space-y-2 p-2">
                  {recentScans.slice(0, 5).map((scan) => (
                    <div
                      key={scan.id}
                      className="p-2 rounded-lg border border-border/30 bg-card/30 hover:bg-card/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline" className="text-xs capitalize">
                          {scan.scan_type}
                        </Badge>
                        {(scan.high_risk_count || 0) > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {scan.high_risk_count} risks
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs truncate text-muted-foreground">
                        {scan.email || scan.phone || scan.username}
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        {format(new Date(scan.created_at), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  ))}
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
}
