import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { summarizeInvestigation, AnalystResponse } from "@/lib/ai/orchestrator";
import { indexUserGraph } from "@/lib/ai/indexer";
import {
  Brain,
  FileText,
  Download,
  Briefcase,
  Loader2,
  AlertCircle,
  CheckCircle,
  Link2,
  Sparkles,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EntityOption {
  id: string;
  type: string;
  value: string;
}

const AIAnalyst = () => {
  const [entities, setEntities] = useState<EntityOption[]>([]);
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  const [questions, setQuestions] = useState("");
  const [objective, setObjective] = useState("");
  const [report, setReport] = useState<AnalystResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [cases, setCases] = useState<any[]>([]);
  const [attachCaseId, setAttachCaseId] = useState("");
  const [showAttachDialog, setShowAttachDialog] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    loadEntities();
    loadCases();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const loadEntities = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Load only the current user's scans for analysis
      const { data, error } = await supabase
        .from("scans")
        .select("id, email, phone, username, privacy_score, high_risk_count, created_at")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      setEntities((data || []).map(scan => {
        const type = scan.email ? "email" : scan.phone ? "phone" : scan.username ? "username" : "unknown";
        const value = scan.email || scan.phone || scan.username || "unknown";
        return {
          id: scan.id,
          type,
          value,
        };
      }));
    } catch (error: any) {
      console.error("Error loading entities:", error);
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

  const handleIndex = async () => {
    setIsIndexing(true);
    try {
      const result = await indexUserGraph();
      toast({
        title: "Index updated",
        description: `Created ${result.chunksCreated} RAG chunks from your graph`,
      });
    } catch (error: any) {
      toast({
        title: "Indexing failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsIndexing(false);
    }
  };

  const handleAnalyze = async () => {
    if (selectedEntities.length === 0) {
      toast({
        title: "Select entities",
        description: "Please select at least one entity to analyze",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const questionList = questions
        .split("\n")
        .map(q => q.trim())
        .filter(q => q.length > 0);

      const response = await summarizeInvestigation({
        entityIds: selectedEntities,
        questions: questionList.length > 0 ? questionList : undefined,
        objective: objective || undefined,
      });

      setReport(response);
      toast({
        title: "Analysis complete",
        description: "AI analyst report generated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Analysis failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAttachToCase = async () => {
    if (!attachCaseId || !report) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Store the report as case note
      const { error } = await supabase
        .from("case_notes")
        .insert({
          user_id: user.id,
          case_id: attachCaseId,
          content: `# AI Analyst Report

## Overview
${report.overview}

## Key Signals
${report.keySignals.map(s => `- ${s}`).join('\n')}

## Correlations
${report.correlations.map(c => `- ${c}`).join('\n')}

## Risks
${report.risks.map(r => `- ${r}`).join('\n')}

## Recommendations
${report.recommendations.map(r => `- ${r}`).join('\n')}

**Confidence:** ${Math.round(report.confidence * 100)}%
**Sources:** ${report.provenance.providers.join(', ')}`,
          is_important: true,
        });

      if (error) throw error;

      toast({
        title: "Report attached",
        description: "AI analyst report attached to case successfully",
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

  const handleExportPDF = () => {
    if (!report) return;
    
    // Create text representation
    const content = `
AI ANALYST REPORT
Generated: ${new Date().toISOString()}

OVERVIEW
${report.overview}

KEY SIGNALS
${report.keySignals.map(s => `• ${s}`).join("\n")}

CORRELATIONS
${report.correlations.map(c => `• ${c}`).join("\n")}

RISKS
${report.risks.map(r => `• ${r}`).join("\n")}

GAPS IN INTELLIGENCE
${report.gaps.map(g => `• ${g}`).join("\n")}

RECOMMENDATIONS
${report.recommendations.map(r => `• ${r}`).join("\n")}

CONFIDENCE: ${Math.round(report.confidence * 100)}%

SOURCES
Providers: ${report.provenance.providers.join(", ")}
Entity Types: ${report.provenance.entityTypes.join(", ")}
Finding References: ${report.provenance.findingIds.length} findings cited
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-analyst-report-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Report exported",
      description: "AI analyst report downloaded",
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600";
    if (confidence >= 0.6) return "text-blue-600";
    return "text-yellow-600";
  };

  return (
    <>
      <SEO
        title="AI Analyst — FootprintIQ"
        description="AI-powered intelligence analysis with correlation and risk assessment"
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                  <Brain className="w-8 h-8 text-primary" />
                  AI Analyst
                </h1>
                <p className="text-muted-foreground">
                  RAG-powered intelligence analysis with correlation and explainability
                </p>
              </div>
              <Button onClick={handleIndex} disabled={isIndexing} variant="outline">
                {isIndexing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Indexing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Update Index
                  </>
                )}
              </Button>
            </div>

            <div className="mb-6 flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-foreground mb-1">First time here? Update your index first</p>
                <p className="text-muted-foreground">
                  Click <strong>"Update Index"</strong> above before generating analysis. This indexes your scan data so the AI can reference it. You should re-index after running new scans.
                </p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Left: Configuration */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Investigation Scope</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label>Select Entities to Analyze</Label>
                    <Select
                      onValueChange={(value) => {
                        if (!selectedEntities.includes(value)) {
                          setSelectedEntities([...selectedEntities, value]);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Add entity to scope..." />
                      </SelectTrigger>
                      <SelectContent>
                        {entities
                          .filter(e => !selectedEntities.includes(e.id))
                          .map((entity) => (
                            <SelectItem key={entity.id} value={entity.id}>
                              {entity.type}: {entity.value.substring(0, 40)}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedEntities.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedEntities.map((id) => {
                        const entity = entities.find(e => e.id === id);
                        if (!entity) return null;
                        return (
                          <Badge key={id} variant="secondary" className="gap-1">
                            {entity.type}: {entity.value.substring(0, 20)}...
                            <button
                              onClick={() => setSelectedEntities(selectedEntities.filter(e => e !== id))}
                              className="ml-1 hover:text-destructive"
                            >
                              ×
                            </button>
                          </Badge>
                        );
                      })}
                    </div>
                  )}

                  <div>
                    <Label>Analysis Objective (Optional)</Label>
                    <Textarea
                      placeholder="E.g., 'Identify connections between username and domain', 'Assess data breach risk'..."
                      value={objective}
                      onChange={(e) => setObjective(e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label>Specific Questions (Optional, one per line)</Label>
                    <Textarea
                      placeholder="E.g., 'Is this username associated with any breaches?'&#10;'What domains are linked to this email?'"
                      value={questions}
                      onChange={(e) => setQuestions(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || selectedEntities.length === 0}
                    className="w-full"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" />
                        Generate Analysis
                      </>
                    )}
                  </Button>
                </div>
              </Card>

              {/* Right: Report */}
              <Card className="p-6">
                {!report ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No Report Generated</h3>
                    <p className="text-muted-foreground">
                      Select entities and generate an analysis to view the AI analyst report
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold">Analyst Report</h2>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setShowAttachDialog(true)}>
                          <Briefcase className="w-4 h-4 mr-2" />
                          Attach to Case
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleExportPDF}>
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getConfidenceColor(report.confidence)}>
                        Confidence: {Math.round(report.confidence * 100)}%
                      </Badge>
                      <Badge variant="outline">
                        {report.provenance.providers.length} Provider{report.provenance.providers.length > 1 ? 's' : ''}
                      </Badge>
                      <Badge variant="outline">
                        {report.provenance.findingIds.length} Finding{report.provenance.findingIds.length > 1 ? 's' : ''}
                      </Badge>
                    </div>

                    <Tabs defaultValue="overview">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="findings">Findings</TabsTrigger>
                        <TabsTrigger value="actions">Actions</TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview" className="space-y-4">
                        <Card className="p-4">
                          <h3 className="font-semibold mb-2">Executive Summary</h3>
                          <p className="text-sm">{report.overview}</p>
                        </Card>

                        {report.keySignals.length > 0 && (
                          <Card className="p-4">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                              <AlertCircle className="w-4 h-4" />
                              Key Signals
                            </h3>
                            <ul className="text-sm space-y-1">
                              {report.keySignals.map((signal, idx) => (
                                <li key={idx}>• {signal}</li>
                              ))}
                            </ul>
                          </Card>
                        )}
                      </TabsContent>

                      <TabsContent value="findings" className="space-y-4">
                        {report.correlations.length > 0 && (
                          <Card className="p-4">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                              <Link2 className="w-4 h-4" />
                              Correlations
                            </h3>
                            <ul className="text-sm space-y-1">
                              {report.correlations.map((corr, idx) => (
                                <li key={idx}>• {corr}</li>
                              ))}
                            </ul>
                          </Card>
                        )}

                        {report.risks.length > 0 && (
                          <Card className="p-4 border-destructive/50">
                            <h3 className="font-semibold mb-2 flex items-center gap-2 text-destructive">
                              <AlertCircle className="w-4 h-4" />
                              Risk Assessment
                            </h3>
                            <ul className="text-sm space-y-1">
                              {report.risks.map((risk, idx) => (
                                <li key={idx}>• {risk}</li>
                              ))}
                            </ul>
                          </Card>
                        )}

                        {report.gaps.length > 0 && (
                          <Card className="p-4">
                            <h3 className="font-semibold mb-2">Intelligence Gaps</h3>
                            <ul className="text-sm space-y-1 text-muted-foreground">
                              {report.gaps.map((gap, idx) => (
                                <li key={idx}>• {gap}</li>
                              ))}
                            </ul>
                          </Card>
                        )}
                      </TabsContent>

                      <TabsContent value="actions" className="space-y-4">
                        {report.recommendations.length > 0 && (
                          <Card className="p-4">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              Recommendations
                            </h3>
                            <ul className="text-sm space-y-1">
                              {report.recommendations.map((rec, idx) => (
                                <li key={idx}>• {rec}</li>
                              ))}
                            </ul>
                          </Card>
                        )}

                        <Card className="p-4">
                          <h3 className="font-semibold mb-2">Data Sources</h3>
                          <div className="text-sm space-y-2">
                            <p>
                              <strong>Providers:</strong> {report.provenance.providers.join(", ")}
                            </p>
                            <p>
                              <strong>Entity Types:</strong> {report.provenance.entityTypes.join(", ")}
                            </p>
                            <p className="text-muted-foreground">
                              Analysis based on {report.provenance.findingIds.length} intelligence findings
                            </p>
                          </div>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </main>

        <Footer />
      </div>

      {/* Attach to Case Dialog */}
      <Dialog open={showAttachDialog} onOpenChange={setShowAttachDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Attach Report to Case</DialogTitle>
            <DialogDescription>
              Select a case to attach this AI analyst report as evidence
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
              Attach Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AIAnalyst;
