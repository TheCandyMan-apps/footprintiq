import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Filter, Brain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface FilterLog {
  id: string;
  provider: string;
  original_count: number;
  filtered_count: number;
  removed_count: number;
  confidence_improvement: number;
  created_at: string;
}

export const AIFilteringStats = ({ scanId }: { scanId?: string }) => {
  const [logs, setLogs] = useState<FilterLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        let query = supabase
          .from('ai_filter_logs')
          .select('*')
          .order('created_at', { ascending: false });

        if (scanId) {
          query = query.eq('scan_id', scanId);
        }

        const { data, error } = await query.limit(10);

        if (error) throw error;
        setLogs(data || []);
      } catch (error) {
        console.error('Error fetching AI filter logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [scanId]);

  if (loading) return null;
  if (logs.length === 0) return null;

  const totalRemoved = logs.reduce((sum, log) => sum + log.removed_count, 0);
  const avgConfidenceImprovement = logs.reduce((sum, log) => sum + log.confidence_improvement, 0) / logs.length;
  const grokUsage = logs.filter(l => l.provider === 'grok').length;
  const openaiUsage = logs.filter(l => l.provider === 'openai').length;

  const chartData = logs.slice(0, 7).reverse().map(log => ({
    date: new Date(log.created_at).toLocaleDateString(),
    improvement: log.confidence_improvement,
    removed: log.removed_count
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Brain className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">AI Filtering Performance</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-card">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="w-4 h-4 text-accent" />
            <span className="text-sm text-muted-foreground">Filtered</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{totalRemoved}</p>
          <p className="text-xs text-muted-foreground">False positives removed</p>
        </Card>

        <Card className="p-4 bg-gradient-card">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Accuracy</span>
          </div>
          <p className="text-2xl font-bold text-primary">+{avgConfidenceImprovement.toFixed(1)}%</p>
          <p className="text-xs text-muted-foreground">Avg confidence boost</p>
        </Card>

        <Card className="p-4 bg-gradient-card">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Grok</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{grokUsage}</p>
          <p className="text-xs text-muted-foreground">Times used</p>
        </Card>

        <Card className="p-4 bg-gradient-card">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="text-xs">OpenAI</Badge>
          </div>
          <p className="text-2xl font-bold text-foreground">{openaiUsage}</p>
          <p className="text-xs text-muted-foreground">Fallback uses</p>
        </Card>
      </div>

      {chartData.length > 1 && (
        <Card className="p-4 bg-gradient-card">
          <h4 className="text-sm font-semibold mb-4">Confidence Improvement Trend</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="improvement" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
};
