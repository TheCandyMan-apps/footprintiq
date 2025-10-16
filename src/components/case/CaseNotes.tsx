import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Case, CaseNote, addNoteToCase, saveCase } from "@/lib/case";
import { Finding } from "@/lib/ufm";
import { useState } from "react";
import { Plus, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";

interface CaseNotesProps {
  caseData: Case;
  onUpdate: (updatedCase: Case) => void;
}

export const CaseNotes = ({ caseData, onUpdate }: CaseNotesProps) => {
  const [noteContent, setNoteContent] = useState("");
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);

  const handleAddNote = async () => {
    if (!noteContent.trim()) {
      toast.error("Please enter note content");
      return;
    }

    if (!selectedFindingId) {
      toast.error("Please select a finding");
      return;
    }

    try {
      const updatedCase = addNoteToCase(caseData, selectedFindingId, noteContent.trim());
      await saveCase(updatedCase);
      onUpdate(updatedCase);
      setNoteContent("");
      setSelectedFindingId(null);
      toast.success("Note added");
    } catch (error) {
      console.error("Failed to add note:", error);
      toast.error("Failed to add note");
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const updatedCase = {
        ...caseData,
        notes: caseData.notes.filter((n) => n.id !== noteId),
        updatedAt: new Date().toISOString(),
      };
      await saveCase(updatedCase);
      onUpdate(updatedCase);
      toast.success("Note deleted");
    } catch (error) {
      console.error("Failed to delete note:", error);
      toast.error("Failed to delete note");
    }
  };

  const getFindingTitle = (findingId: string): string => {
    const finding = caseData.findings.find((f) => f.id === findingId);
    return finding ? finding.title : "Unknown Finding";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Case Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Add Note Form */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Finding</label>
            <select
              className="w-full p-2 border rounded-md bg-background"
              value={selectedFindingId || ""}
              onChange={(e) => setSelectedFindingId(e.target.value)}
            >
              <option value="">-- Select a finding --</option>
              {caseData.findings.map((finding) => (
                <option key={finding.id} value={finding.id}>
                  {finding.title}
                </option>
              ))}
            </select>

            <Textarea
              placeholder="Add your analysis notes here..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              rows={4}
            />
            <Button onClick={handleAddNote} disabled={!selectedFindingId || !noteContent.trim()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Note
            </Button>
          </div>

          {/* Notes List */}
          <ScrollArea className="h-[300px]">
            {caseData.notes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No notes yet. Add your first analysis note above.
              </div>
            ) : (
              <div className="space-y-3">
                {caseData.notes
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((note) => (
                    <div key={note.id} className="p-3 border rounded-lg group hover:bg-muted/50">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {getFindingTitle(note.findingId)}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                          onClick={() => handleDeleteNote(note.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(note.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};
