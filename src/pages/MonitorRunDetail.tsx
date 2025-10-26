import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MonitorDiffViewer } from "@/components/MonitorDiffViewer";
import { Clock, CheckCircle, XCircle, ArrowLeft, Briefcase } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MonitorRun {
  id: string;
  schedule_id: string;
  started_at: string;
  finished_at: string | null;
  status: string;
  new_findings_count: number;
  diff_hash: string | null;
  metadata: any;
}

const MonitorRunDetail = () => {
  const { runId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [run, setRun] = useState<MonitorRun | null>(null);
  const [diff, setDiff] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cases, setCases] = useState<any[]>([]);
  const [attachCaseId, setAttachCaseId] = useState("");
  const [showAttachDialog, setShowAttachDialog] = useState(false);

  useEffect(() => {
    checkAuth();
    loadRunDetails();
    loadCases();
  }, [runId]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const loadRunDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("monitor_runs")
        .select("*")
        .eq("id", runId)
        .single();

      if (error) throw error;

      setRun(data);
      
      // Extract diff from metadata
      if (data.metadata && typeof data.metadata === 'object' && 'diff' in data.metadata) {
        setDiff((data.metadata as any).diff);
      }
    } catch (error: any) {
      toast({
        title: "Error loading run",
        description: error.message,
        variant: "destructive",
      });
      navigate("/monitoring");
    } finally {
      setIsLoading(false);
    }
  };

  const loadCases = async () => {
    try {
      const { data, error } = await supabase
        .from("cases")
        .select("id, title, status")
        .eq("status", "open")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCases(data || []);
    } catch (error: any) {
      console.error("Error loading cases:", error);
    }
  };

  const handleAttachToCase = async () => {
    if (!attachCaseId || !run || !diff) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Store the diff as case note
      const { error } = await supabase
        .from("case_notes")
        .insert({
          user_id: user.id,
          case_id: attachCaseId,
          content: `# Monitoring Diff Report - ${new Date(run.started_at).toLocaleDateString()}

## Summary
- **New Findings:** ${diff.summary.totalNew}
- **Removed:** ${diff.summary.totalRemoved}
- **Changed:** ${diff.summary.totalChanged}
- **Severity Increases:** ${diff.summary.severityChanges.increased}

## Details
Run ID: ${run.id}
Status: ${run.status}

See monitoring run details for full diff analysis.`,
          is_important: true,
        });

      if (error) throw error;

      toast({
        title: "Diff attached",
        description: "Monitoring diff attached to case successfully",
      });
      setShowAttachDialog(false);
    } catch (error: any) {
      toast({
        title: "Failed to attach",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "success": return "default";
      case "failed": return "destructive";
      default: return "secondary";
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading monitor run...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!run) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <Card className="p-12 text-center">
            <XCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
            <h3 className="text-xl font-semibold mb-2">Run Not Found</h3>
            <p className="text-muted-foreground mb-6">
              The requested monitor run does not exist or you don't have access
            </p>
            <Button onClick={() => navigate("/monitoring")}>
              Back to Monitoring
            </Button>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SEO
        title="Monitor Run Details — FootprintIQ"
        description="View monitoring run details and changes detected"
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <Button variant="outline" onClick={() => navigate("/monitoring")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Monitoring
              </Button>
            </div>

            {/* Run Header */}
            <Card className="p-6 mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(run.status)}
                    <h1 className="text-2xl font-bold">Monitor Run</h1>
                    <Badge variant={getStatusVariant(run.status)}>
                      {run.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Started: {new Date(run.started_at).toLocaleString()}</p>
                    {run.finished_at && (
                      <p>Finished: {new Date(run.finished_at).toLocaleString()}</p>
                    )}
                    <p>New Findings: {run.new_findings_count}</p>
                  </div>
                </div>
                
                {diff && (
                  <Button onClick={() => setShowAttachDialog(true)}>
                    <Briefcase className="w-4 h-4 mr-2" />
                    Attach to Case
                  </Button>
                )}
              </div>
            </Card>

            {/* Diff Viewer */}
            {diff ? (
              <MonitorDiffViewer diff={diff} />
            ) : (
              <Card className="p-12 text-center">
                <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Diff Data</h3>
                <p className="text-muted-foreground">
                  {run.status === "running" 
                    ? "Monitor run is still in progress"
                    : "No comparison data available for this run"
                  }
                </p>
              </Card>
            )}
          </div>
        </main>

        <Footer />
      </div>

      {/* Attach to Case Dialog */}
      <Dialog open={showAttachDialog} onOpenChange={setShowAttachDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Attach Diff to Case</DialogTitle>
            <DialogDescription>
              Select a case to attach this monitoring diff as evidence
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Select value={attachCaseId} onValueChange={setAttachCaseId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a case..." />
              </SelectTrigger>
              <SelectContent>
                {cases.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAttachDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAttachToCase} disabled={!attachCaseId}>
              Attach Diff
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MonitorRunDetail;
