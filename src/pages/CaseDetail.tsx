import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { CaseWorkspace } from "@/components/case/CaseWorkspace";
import { CaseExport } from "@/components/case/CaseExport";
import { LiveComments } from "@/components/workspace/LiveComments";
import { TaskBoard } from "@/components/workspace/TaskBoard";
import { SharedNotes } from "@/components/workspace/SharedNotes";
import { AssetUploader } from "@/components/workspace/AssetUploader";
import { AITeamAssist } from "@/components/workspace/AITeamAssist";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const CaseDetail = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

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
        .select("id")
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
              <CaseExport caseId={caseId!} />
            </div>
            <Tabs defaultValue="workspace" className="w-full">
              <TabsList>
                <TabsTrigger value="workspace">Workspace</TabsTrigger>
                <TabsTrigger value="comments">Comments</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="assets">Assets</TabsTrigger>
                <TabsTrigger value="ai">AI Assist</TabsTrigger>
              </TabsList>
              <TabsContent value="workspace">
                <CaseWorkspace onSelectCase={(caseData) => console.log("Case selected:", caseData)} />
              </TabsContent>
              <TabsContent value="comments">
                <LiveComments caseId={caseId!} />
              </TabsContent>
              <TabsContent value="tasks">
                <TaskBoard caseId={caseId!} />
              </TabsContent>
              <TabsContent value="notes">
                <SharedNotes caseId={caseId!} />
              </TabsContent>
              <TabsContent value="assets">
                <AssetUploader caseId={caseId!} />
              </TabsContent>
              <TabsContent value="ai">
                <AITeamAssist caseId={caseId!} />
              </TabsContent>
            </Tabs>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default CaseDetail;