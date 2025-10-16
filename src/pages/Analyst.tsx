import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CaseWorkspace } from "@/components/case/CaseWorkspace";
import { CaseNotes } from "@/components/case/CaseNotes";
import { CaseExport } from "@/components/case/CaseExport";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Case, pinFindingToCase, unpinFindingFromCase, saveCase } from "@/lib/case";
import { Finding } from "@/lib/ufm";
import { Pin, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function Analyst() {
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [chatInput, setChatInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const handleCaseUpdate = (updatedCase: Case) => {
    setSelectedCase(updatedCase);
  };

  const handlePinFinding = async (finding: Finding) => {
    if (!selectedCase) {
      toast.error("Please select a case first");
      return;
    }

    try {
      const updatedCase = pinFindingToCase(selectedCase, finding);
      await saveCase(updatedCase);
      setSelectedCase(updatedCase);
      toast.success("Finding pinned to case");
    } catch (error) {
      console.error("Failed to pin finding:", error);
      toast.error("Failed to pin finding");
    }
  };

  const handleUnpinFinding = async (findingId: string) => {
    if (!selectedCase) return;

    try {
      const updatedCase = unpinFindingFromCase(selectedCase, findingId);
      await saveCase(updatedCase);
      setSelectedCase(updatedCase);
      toast.success("Finding unpinned");
    } catch (error) {
      console.error("Failed to unpin finding:", error);
      toast.error("Failed to unpin finding");
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !selectedCase) return;

    const userMessage = chatInput.trim();
    setChatInput("");
    setChatMessages([...chatMessages, { role: "user", content: userMessage }]);
    setIsThinking(true);

    // Simulate AI response (in production, this would call your AI backend)
    setTimeout(() => {
      const contextSummary = `Based on your case "${selectedCase.name}" with ${selectedCase.findings.length} findings...`;
      const response = `${contextSummary}\n\nI've analyzed your question "${userMessage}". This is a local-only assistant that only has access to the findings in your current case. For production use, this would connect to an AI model with context awareness.`;
      
      setChatMessages((prev) => [...prev, { role: "assistant", content: response }]);
      setIsThinking(false);
    }, 1500);
  };

  return (
    <>
      <Helmet>
        <title>Analyst Workspace | FootprintIQ</title>
        <meta name="description" content="Professional analyst workspace for OSINT case management, notes, and AI-assisted analysis" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Analyst Workspace</h1>
            <p className="text-muted-foreground">
              Organize findings, add notes, and leverage AI assistance for your investigations
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Case List */}
            <div className="lg:col-span-1">
              <CaseWorkspace onSelectCase={setSelectedCase} />
            </div>

            {/* Middle Column: Case Details & AI Chat */}
            <div className="lg:col-span-1 space-y-6">
              {selectedCase ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>{selectedCase.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {selectedCase.description || "No description"}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Pinned Findings ({selectedCase.findings.length})</h4>
                        <ScrollArea className="h-[200px]">
                          {selectedCase.findings.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                              No pinned findings yet
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {selectedCase.findings.map((finding) => (
                                <div key={finding.id} className="p-2 border rounded-lg flex items-start justify-between">
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">{finding.title}</p>
                                    <Badge variant="outline" className="text-xs mt-1">
                                      {finding.severity}
                                    </Badge>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleUnpinFinding(finding.id)}
                                  >
                                    <Pin className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </ScrollArea>
                      </div>
                    </CardContent>
                  </Card>

                  {/* AI Assistant */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <CardTitle>AI Assistant</CardTitle>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Restricted to in-app findings only
                      </p>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[300px] mb-4 p-3 border rounded-lg">
                        {chatMessages.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground text-sm">
                            Ask questions about your case findings...
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {chatMessages.map((msg, idx) => (
                              <div
                                key={idx}
                                className={`p-3 rounded-lg ${
                                  msg.role === "user"
                                    ? "bg-primary/10 ml-8"
                                    : "bg-muted mr-8"
                                }`}
                              >
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                              </div>
                            ))}
                            {isThinking && (
                              <div className="p-3 rounded-lg bg-muted mr-8">
                                <p className="text-sm text-muted-foreground">Thinking...</p>
                              </div>
                            )}
                          </div>
                        )}
                      </ScrollArea>

                      <div className="flex gap-2">
                        <Input
                          placeholder="Ask about findings..."
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                        />
                        <Button onClick={handleSendMessage} disabled={!chatInput.trim() || isThinking}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center text-muted-foreground">
                      <Pin className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p>Select or create a case to get started</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column: Notes & Export */}
            <div className="lg:col-span-1 space-y-6">
              {selectedCase ? (
                <>
                  <CaseNotes caseData={selectedCase} onUpdate={handleCaseUpdate} />
                  <CaseExport caseData={selectedCase} />
                </>
              ) : (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center text-muted-foreground text-sm">
                      Case tools will appear here
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
