import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, CheckCircle, Clock, XCircle, FolderPlus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { createCase, saveCase } from '@/lib/case';

interface ReconNgScan {
  id: string;
  target: string;
  target_type: string;
  modules: string[];
  status: string;
  total_results: number;
  results: any[];
  correlations: any[];
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export function ReconNgResults({ workspaceId }: { workspaceId: string }) {
  const [scans, setScans] = useState<ReconNgScan[]>([]);
  const [selectedScan, setSelectedScan] = useState<ReconNgScan | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadScans();
  }, [workspaceId]);

  const loadScans = async () => {
    try {
      const { data, error } = await supabase
        .from('recon_ng_scans')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScans((data || []) as ReconNgScan[]);
      if (data && data.length > 0) {
        setSelectedScan(data[0] as ReconNgScan);
      }
    } catch (error) {
      console.error('Error loading scans:', error);
      toast({
        title: 'Error',
        description: 'Failed to load scan results',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { icon: any; variant: any; label: string }> = {
      completed: { icon: CheckCircle, variant: 'default', label: 'Completed' },
      running: { icon: Clock, variant: 'secondary', label: 'Running' },
      failed: { icon: XCircle, variant: 'destructive', label: 'Failed' },
      pending: { icon: AlertCircle, variant: 'outline', label: 'Pending' },
    };

    const { icon: Icon, variant, label } = config[status] || config.pending;

    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const handleSaveToCase = async () => {
    if (!selectedScan) return;

    setSaving(true);
    try {
      const caseName = `Recon-ng: ${selectedScan.target}`;
      const caseDescription = `Recon-ng scan of ${selectedScan.target_type} - ${selectedScan.total_results} results found`;

      const newCase = createCase(caseName, caseDescription);

      // Add correlations as notes
      if (selectedScan.correlations && selectedScan.correlations.length > 0) {
        selectedScan.correlations.forEach((corr: any) => {
          const noteContent = `**${corr.module}**\n${corr.description}\nConfidence: ${corr.confidence}\nResults: ${corr.count}`;
          const now = new Date().toISOString();
          newCase.notes.push({
            id: crypto.randomUUID(),
            findingId: selectedScan.id,
            content: noteContent,
            createdAt: now,
            updatedAt: now,
          });
        });
      }

      // Add scan metadata
      const metadataNote = `**Recon-ng Scan Details:**
- Target: ${selectedScan.target}
- Type: ${selectedScan.target_type}
- Status: ${selectedScan.status}
- Total Results: ${selectedScan.total_results}
- Modules: ${selectedScan.modules.join(', ')}
- Scan ID: ${selectedScan.id}
- Created: ${new Date(selectedScan.created_at).toLocaleString()}
${selectedScan.completed_at ? `- Completed: ${new Date(selectedScan.completed_at).toLocaleString()}` : ''}`;

      const now = new Date().toISOString();
      newCase.notes.push({
        id: crypto.randomUUID(),
        findingId: selectedScan.id,
        content: metadataNote,
        createdAt: now,
        updatedAt: now,
      });

      await saveCase(newCase);

      toast({
        title: 'Case Created',
        description: `Successfully saved Recon-ng scan to case "${caseName}"`,
      });

      navigate('/analyst');
    } catch (error) {
      console.error('Error saving to case:', error);
      toast({
        title: 'Error',
        description: 'Failed to create case. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (scans.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">No Recon-ng scans yet. Start your first scan above!</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Scan List */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Scans</h3>
        <ScrollArea className="h-[200px]">
          <div className="space-y-2">
            {scans.map((scan) => (
              <div
                key={scan.id}
                onClick={() => setSelectedScan(scan)}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedScan?.id === scan.id
                    ? 'bg-accent border-primary'
                    : 'hover:bg-accent/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{scan.target}</p>
                    <p className="text-sm text-muted-foreground">
                      {scan.target_type} • {scan.modules.length} modules
                    </p>
                  </div>
                  {getStatusBadge(scan.status)}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Selected Scan Details */}
      {selectedScan && (
        <>
          {/* Save to Case Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSaveToCase}
              disabled={saving || selectedScan.status === 'running'}
              className="gap-2"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FolderPlus className="w-4 h-4" />
              )}
              {saving ? 'Saving...' : 'Save to Case'}
            </Button>
          </div>

          {/* Correlations */}
          {selectedScan.correlations && selectedScan.correlations.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Correlations</h3>
              <div className="space-y-3">
                {selectedScan.correlations.map((corr: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg bg-accent/50 border">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{corr.module}</p>
                        <p className="text-sm text-muted-foreground">{corr.description}</p>
                      </div>
                      <Badge variant="outline">{corr.confidence}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Results */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Results ({selectedScan.total_results})
            </h3>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {selectedScan.results && selectedScan.results.length > 0 ? (
                  selectedScan.results.map((result: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-lg bg-accent/30 border">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Module:</span>{' '}
                          <span className="font-medium">{result.module}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Type:</span>{' '}
                          <span className="font-medium">{result.type}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Value:</span>{' '}
                          <span className="font-medium">{result.value}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No results yet</p>
                )}
              </div>
            </ScrollArea>
          </Card>
        </>
      )}
    </div>
  );
}
