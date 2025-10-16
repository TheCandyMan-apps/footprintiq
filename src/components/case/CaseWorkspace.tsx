import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Case, createCase, saveCase, listCases, deleteCase } from "@/lib/case";
import { useState, useEffect } from "react";
import { Plus, Trash2, FileText, Calendar } from "lucide-react";
import { toast } from "sonner";

interface CaseWorkspaceProps {
  onSelectCase: (caseData: Case) => void;
}

export const CaseWorkspace = ({ onSelectCase }: CaseWorkspaceProps) => {
  const [cases, setCases] = useState<Case[]>([]);
  const [newCaseName, setNewCaseName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadAllCases();
  }, []);

  const loadAllCases = async () => {
    try {
      const allCases = await listCases();
      setCases(allCases.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ));
    } catch (error) {
      console.error("Failed to load cases:", error);
      toast.error("Failed to load cases");
    }
  };

  const handleCreateCase = async () => {
    if (!newCaseName.trim()) {
      toast.error("Please enter a case name");
      return;
    }

    try {
      const newCase = createCase(newCaseName.trim());
      await saveCase(newCase);
      setCases([newCase, ...cases]);
      setNewCaseName("");
      setIsCreating(false);
      toast.success("Case created");
      onSelectCase(newCase);
    } catch (error) {
      console.error("Failed to create case:", error);
      toast.error("Failed to create case");
    }
  };

  const handleDeleteCase = async (caseId: string) => {
    if (!confirm("Delete this case? This cannot be undone.")) return;

    try {
      await deleteCase(caseId);
      setCases(cases.filter((c) => c.id !== caseId));
      toast.success("Case deleted");
    } catch (error) {
      console.error("Failed to delete case:", error);
      toast.error("Failed to delete case");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Analyst Workspace</CardTitle>
          <Button
            size="sm"
            onClick={() => setIsCreating(true)}
            disabled={isCreating}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Case
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isCreating && (
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Case name..."
              value={newCaseName}
              onChange={(e) => setNewCaseName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateCase()}
              autoFocus
            />
            <Button onClick={handleCreateCase}>Create</Button>
            <Button variant="outline" onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
          </div>
        )}

        <ScrollArea className="h-[400px]">
          {cases.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 mb-2 opacity-50" />
              <p>No cases yet. Create one to start organizing findings.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cases.map((caseData) => (
                <div
                  key={caseData.id}
                  className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer group transition-colors"
                  onClick={() => onSelectCase(caseData)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{caseData.name}</h4>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {caseData.pinnedFindingIds.length} findings
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(caseData.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      {caseData.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {caseData.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCase(caseData.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
