import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { CasesViewer } from "@/components/case/CasesViewer";
import { Button } from "@/components/ui/button";
import { CaseWorkspace } from "@/components/case/CaseWorkspace";
import { CaseExport } from "@/components/case/CaseExport";
import { LiveComments } from "@/components/workspace/LiveComments";
import { TaskBoard } from "@/components/workspace/TaskBoard";
import { SharedNotes } from "@/components/workspace/SharedNotes";
import { AssetUploader } from "@/components/workspace/AssetUploader";
import { AITeamAssist } from "@/components/workspace/AITeamAssist";
import { CreateTemplateDialog } from "@/components/case/CreateTemplateDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BookmarkPlus } from "lucide-react";

const CaseDetail = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [caseData, setCaseData] = useState<any>(null);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Verify case exists and user has access
      const { data, error } = await supabase
        .from("cases")
        .select("*")
        .eq("id", caseId)
        .single();

      if (error || !data) {
        toast({
          title: "Case not found",
          description: "The requested case does not exist or you don't have access",
          variant: "destructive",
        });
        navigate("/cases");
        return;
      }

      setCaseData(data);
      setIsLoading(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      navigate("/cases");
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading case...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SEO
        title="Case Details — FootprintIQ"
        description="View and manage investigation case details, evidence, and notes"
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <Button variant="outline" onClick={() => navigate("/cases")}>
                ← Back to Cases
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsTemplateDialogOpen(true)}
                >
                  <BookmarkPlus className="w-4 h-4 mr-2" />
                  Save as Template
                </Button>
                <CaseExport caseId={caseId!} />
              </div>
            </div>
            <Tabs defaultValue="timeline" className="w-full">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="workspace">Workspace</TabsTrigger>
                <TabsTrigger value="comments">Comments</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="assets">Assets</TabsTrigger>
                <TabsTrigger value="ai">AI Assist</TabsTrigger>
              </TabsList>
              <TabsContent value="timeline" className="mt-6">
                <CasesViewer caseId={caseId!} />
              </TabsContent>
              <TabsContent value="workspace" className="mt-6">
                <CaseWorkspace onSelectCase={(caseData) => console.log("Case selected:", caseData)} />
              </TabsContent>
              <TabsContent value="comments" className="mt-6">
                <LiveComments caseId={caseId!} />
              </TabsContent>
              <TabsContent value="tasks" className="mt-6">
                <TaskBoard caseId={caseId!} />
              </TabsContent>
              <TabsContent value="notes" className="mt-6">
                <SharedNotes caseId={caseId!} />
              </TabsContent>
              <TabsContent value="assets" className="mt-6">
                <AssetUploader caseId={caseId!} />
              </TabsContent>
              <TabsContent value="ai" className="mt-6">
                <AITeamAssist caseId={caseId!} />
              </TabsContent>
            </Tabs>
          </div>
        </main>
        <Footer />
      </div>

      <CreateTemplateDialog
        open={isTemplateDialogOpen}
        onOpenChange={setIsTemplateDialogOpen}
        onTemplateCreated={() => {
          toast({
            title: "Template saved",
            description: "You can now use this template when creating new cases",
          });
        }}
        existingCase={caseData ? {
          title: caseData.title,
          description: caseData.description,
          priority: caseData.priority,
          tags: caseData.tags || [],
        } : undefined}
      />
    </>
  );
};

export default CaseDetail;