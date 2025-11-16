import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Shield,
  Zap,
  FolderPlus,
  Download,
  Info,
  Link2,
} from 'lucide-react';

interface ToolResult {
  tool: string;
  status: 'completed' | 'failed' | 'skipped';
  resultCount?: number;
  error?: string;
  data?: any;
}

interface MultiToolResultsProps {
  results: ToolResult[];
  target: string;
  targetType: string;
  workspaceId: string;
  scanId: string;
}

export function MultiToolResults({
  results,
  target,
  targetType,
  workspaceId,
  scanId,
}: MultiToolResultsProps) {
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const completedTools = results.filter(r => r.status === 'completed');
  const failedTools = results.filter(r => r.status === 'failed');
  const skippedTools = results.filter(r => r.status === 'skipped');
  const totalResults = completedTools.reduce((sum, t) => sum + (t.resultCount || 0), 0);

  // Find correlations between results
  const findCorrelations = () => {
    const correlations: Array<{ source1: string; source2: string; correlation: string }> = [];
    
    // Simple correlation logic - can be enhanced
    completedTools.forEach((tool1, i) => {
      completedTools.slice(i + 1).forEach((tool2) => {
        if (tool1.resultCount && tool2.resultCount && tool1.resultCount > 0 && tool2.resultCount > 0) {
          correlations.push({
            source1: tool1.tool,
            source2: tool2.tool,
            correlation: `Both tools found results for ${target}`,
          });
        }
      });
    });

    return correlations;
  };

  const correlations = findCorrelations();

  const handleSaveToCase = async () => {
    setSaving(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const caseName = `Multi-Tool: ${target}`;
      const caseDescription = `Combined results from ${completedTools.length} tools: ${completedTools.map(t => t.tool).join(', ')}`;

      // Create case
      const { data: caseData, error: caseError } = await supabase
        .from('cases')
        .insert({
          user_id: user.id,
          title: caseName,
          description: caseDescription,
          status: 'active',
        })
        .select()
        .single();

      if (caseError) throw caseError;

      toast.success('Saved to Case', {
        description: `Successfully saved multi-tool scan results to case "${caseName}"`,
        action: {
          label: 'View Case',
          onClick: () => window.open(`/cases/${caseData.id}`, '_blank'),
        },
      });
    } catch (error) {
      console.error('Save to case error:', error);
      toast.error('Failed to save', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    const exportData = {
      target,
      targetType,
      scanId,
      timestamp: new Date().toISOString(),
      results,
      summary: {
        total: results.length,
        completed: completedTools.length,
        failed: failedTools.length,
        skipped: skippedTools.length,
        totalResults,
      },
      correlations,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `multi-tool-scan-${target}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Results exported');
  };

  const getToolIcon = (tool: string) => {
    switch (tool) {
      case 'maigret':
        return Search;
      case 'reconng':
        return Zap;
      default:
        return Search;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold mb-2">Multi-Tool Scan Results</h3>
            <p className="text-muted-foreground">
              Target: <span className="font-mono font-semibold">{target}</span> ({targetType})
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExport} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={handleSaveToCase} disabled={saving} size="sm">
              <FolderPlus className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save to Case'}
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 rounded-lg border border-border bg-muted/50">
            <div className="text-2xl font-bold text-primary">{completedTools.length}</div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Completed
            </div>
          </div>
          <div className="p-4 rounded-lg border border-border bg-muted/50">
            <div className="text-2xl font-bold">{totalResults}</div>
            <div className="text-sm text-muted-foreground">Total Results</div>
          </div>
          <div className="p-4 rounded-lg border border-border bg-muted/50">
            <div className="text-2xl font-bold text-destructive">{failedTools.length}</div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <XCircle className="w-3 h-3" />
              Failed
            </div>
          </div>
          <div className="p-4 rounded-lg border border-border bg-muted/50">
            <div className="text-2xl font-bold text-warning">{skippedTools.length}</div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Skipped
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="correlations">
            Correlations
            {correlations.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {correlations.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {results.map((result) => {
            const Icon = getToolIcon(result.tool);
            return (
              <Card key={result.tool} className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${
                    result.status === 'completed' ? 'bg-green-500/10' :
                    result.status === 'failed' ? 'bg-destructive/10' :
                    'bg-warning/10'
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      result.status === 'completed' ? 'text-green-500' :
                      result.status === 'failed' ? 'text-destructive' :
                      'text-warning'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold capitalize">{result.tool}</h4>
                      <Badge variant={
                        result.status === 'completed' ? 'default' :
                        result.status === 'failed' ? 'destructive' :
                        'secondary'
                      }>
                        {result.status}
                      </Badge>
                    </div>
                    {result.status === 'completed' && (
                      <p className="text-sm text-muted-foreground">
                        Found {result.resultCount || 0} results
                      </p>
                    )}
                    {result.status === 'failed' && (
                      <p className="text-sm text-destructive">{result.error}</p>
                    )}
                    {result.status === 'skipped' && (
                      <p className="text-sm text-warning">{result.error}</p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="correlations" className="space-y-4">
          {correlations.length === 0 ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                No correlations found between tool results. This may indicate limited data or non-overlapping coverage.
              </AlertDescription>
            </Alert>
          ) : (
            correlations.map((corr, idx) => (
              <Card key={idx} className="p-4">
                <div className="flex items-start gap-3">
                  <Link2 className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="capitalize">{corr.source1}</Badge>
                      <span className="text-muted-foreground">+</span>
                      <Badge variant="outline" className="capitalize">{corr.source2}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{corr.correlation}</p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {results.map((result) => (
            <Card key={result.tool} className="p-4">
              <h4 className="font-semibold capitalize mb-3">{result.tool} - Raw Data</h4>
              <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
