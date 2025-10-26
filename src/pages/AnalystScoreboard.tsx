import { useState, useEffect } from "react";
import { Trophy, Award, TrendingUp, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AnalystMetric {
  id: string;
  user_id: string;
  scans_completed: number;
  findings_verified: number;
  false_positives_flagged: number;
  avg_resolution_time_ms: number;
  last_activity_at: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

export default function AnalystScoreboard() {
  const [metrics, setMetrics] = useState<AnalystMetric[]>([]);
  const [currentUserMetrics, setCurrentUserMetrics] = useState<AnalystMetric | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Load all analyst metrics with profiles
      const { data, error } = await supabase
        .from('analyst_metrics')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .order('scans_completed', { ascending: false })
        .limit(50) as any;

      if (error) throw error;

      setMetrics(data || []);

      // Find current user's metrics
      if (user) {
        const userMetric = data?.find(m => m.user_id === user.id);
        setCurrentUserMetrics(userMetric || null);
      }
    } catch (error: any) {
      console.error('Load metrics error:', error);
      toast({
        title: "Load Failed",
        description: error.message || "Unable to load scoreboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
    return `${(ms / 3600000).toFixed(1)}h`;
  };

  const calculateScore = (metric: AnalystMetric): number => {
    // Weighted scoring: scans (50%), verifications (30%), accuracy (20%)
    const scanScore = metric.scans_completed * 50;
    const verificationScore = metric.findings_verified * 30;
    const accuracyScore = metric.false_positives_flagged > 0
      ? (metric.findings_verified / (metric.findings_verified + metric.false_positives_flagged)) * 20
      : 20;
    
    return Math.round(scanScore + verificationScore + accuracyScore);
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return { icon: Trophy, color: "text-yellow-500", label: "🥇 1st" };
    if (index === 1) return { icon: Trophy, color: "text-gray-400", label: "🥈 2nd" };
    if (index === 2) return { icon: Trophy, color: "text-amber-600", label: "🥉 3rd" };
    return { icon: Award, color: "text-muted-foreground", label: `#${index + 1}` };
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-8 w-8 text-primary" />
            Analyst Scoreboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Team performance metrics and leaderboard
          </p>
        </div>

        {/* Current User Stats */}
        {currentUserMetrics && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Performance</CardTitle>
              <CardDescription>Personal analytics and ranking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Scans</span>
                  </div>
                  <div className="text-2xl font-bold">{currentUserMetrics.scans_completed}</div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Award className="h-4 w-4" />
                    <span>Verified</span>
                  </div>
                  <div className="text-2xl font-bold">{currentUserMetrics.findings_verified}</div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    <span>False Positives</span>
                  </div>
                  <div className="text-2xl font-bold">{currentUserMetrics.false_positives_flagged}</div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Avg Resolution</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {formatTime(currentUserMetrics.avg_resolution_time_ms)}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Overall Score</span>
                  <Badge variant="default" className="text-lg px-4 py-1">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    {calculateScore(currentUserMetrics).toLocaleString()}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Team Leaderboard</CardTitle>
            <CardDescription>Top performers ranked by activity</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading scoreboard...
              </div>
            ) : metrics.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No analyst activity yet
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Rank</TableHead>
                    <TableHead>Analyst</TableHead>
                    <TableHead className="text-right">Scans</TableHead>
                    <TableHead className="text-right">Verified</TableHead>
                    <TableHead className="text-right">False +</TableHead>
                    <TableHead className="text-right">Avg Time</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.map((metric, index) => {
                    const rank = getRankBadge(index);
                    const RankIcon = rank.icon;
                    const isCurrentUser = currentUserMetrics?.user_id === metric.user_id;

                    return (
                      <TableRow 
                        key={metric.id}
                        className={isCurrentUser ? "bg-primary/5" : ""}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <RankIcon className={`h-5 w-5 ${rank.color}`} />
                            <span className="font-medium">{rank.label}</span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {metric.profiles?.full_name?.charAt(0) || 
                                 metric.profiles?.email?.charAt(0) || 
                                 "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {metric.profiles?.full_name || "Unknown"}
                                {isCurrentUser && (
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    You
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {metric.profiles?.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell className="text-right font-medium">
                          {metric.scans_completed}
                        </TableCell>
                        
                        <TableCell className="text-right font-medium">
                          {metric.findings_verified}
                        </TableCell>
                        
                        <TableCell className="text-right font-medium">
                          {metric.false_positives_flagged}
                        </TableCell>
                        
                        <TableCell className="text-right font-mono text-sm">
                          {formatTime(metric.avg_resolution_time_ms)}
                        </TableCell>
                        
                        <TableCell className="text-right">
                          <Badge variant="secondary" className="font-bold">
                            {calculateScore(metric).toLocaleString()}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}