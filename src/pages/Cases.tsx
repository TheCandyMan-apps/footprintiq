import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Briefcase, 
  Plus, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  ArrowRight,
  Shield,
  Target,
  FileText,
  Users,
  Scale,
  Lock
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CaseTemplates } from "@/components/case/CaseTemplates";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Case {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

const Cases = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [scans, setScans] = useState<any[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [newCase, setNewCase] = useState({
    title: "",
    description: "",
    priority: "medium",
    scanId: "",
  });
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  useEffect(() => {
    checkAuth();
    loadCases();
    loadScans();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const loadCases = async () => {
    try {
      const { data, error } = await supabase
        .from("cases")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCases(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading cases",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadScans = async () => {
    try {
      const { data, error } = await supabase
        .from("scans")
        .select("id, scan_type, created_at")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setScans(data || []);
    } catch (error: any) {
      console.error("Error loading scans:", error);
    }
  };

  const handleCreateCase = async () => {
    if (!newCase.title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a case title",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Prepare case data with template information if selected
      const caseData: any = {
        user_id: user.id,
        title: newCase.title,
        description: newCase.description || selectedTemplate?.description || "",
        priority: selectedTemplate?.priority || newCase.priority,
        scan_id: newCase.scanId || null,
        status: "open",
      };

      // Add template-specific data
      if (selectedTemplate) {
        caseData.tags = selectedTemplate.predefined_tags || [];
        caseData.results = [
          {
            type: "checklist",
            data: selectedTemplate.checklist_items || [],
            timestamp: new Date().toISOString(),
          }
        ];
      }

      const { data, error } = await supabase
        .from("cases")
        .insert([caseData])
        .select()
        .single();

      if (error) {
        // Check if it's a limit error
        if (error.message?.includes('limited to')) {
          toast({
            title: "Case limit reached",
            description: error.message + " Upgrade to Pro for unlimited cases.",
            variant: "destructive",
          });
          // Navigate to pricing after showing toast
          setTimeout(() => navigate('/pricing'), 2000);
          return;
        }
        throw error;
      }

      toast({
        title: "Case created",
        description: "Your bounded investigation case has been created",
      });

      setIsDialogOpen(false);
      setNewCase({ title: "", description: "", priority: "medium", scanId: "" });
      setSelectedTemplate(null);
      loadCases();
    } catch (error: any) {
      toast({
        title: "Error creating case",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "destructive";
      case "high": return "default";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open": return <AlertCircle className="w-4 h-4" />;
      case "in_progress": return <Clock className="w-4 h-4" />;
      case "resolved": return <CheckCircle className="w-4 h-4" />;
      case "closed": return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const ethicalPrinciples = [
    {
      icon: Target,
      title: "Scope Containment",
      description: "Each case defines explicit boundaries for investigation"
    },
    {
      icon: Clock,
      title: "Time-Bounded",
      description: "Investigations have defined start and end points"
    },
    {
      icon: FileText,
      title: "Purpose-Driven",
      description: "Every case requires a documented objective"
    },
    {
      icon: Lock,
      title: "Access Control",
      description: "Evidence is compartmentalised and auditable"
    }
  ];

  return (
    <>
      <SEO
        title="Cases — Ethical Investigation Containment | FootprintIQ"
        description="Cases create boundaries for ethical OSINT investigations. They limit scope, preserve context, and prevent uncontrolled data accumulation."
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1">
          {/* Ethical Framing Header */}
          <section className="bg-muted/30 border-b border-border py-12 px-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Ethical Containment</span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-4 flex items-center justify-center gap-3">
                <Briefcase className="w-8 h-8 text-primary" />
                Cases
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
                Cases exist to create boundaries. They limit scope, preserve context, and prevent uncontrolled data accumulation — which is essential for ethical OSINT work.
              </p>
              
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Cases support journalists, researchers, and security professionals by providing structure, accountability, and clear containment for purpose-driven investigations.
              </p>
            </div>
          </section>

          {/* Ethical Principles */}
          <section className="py-8 px-6 border-b border-border">
            <div className="max-w-5xl mx-auto">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {ethicalPrinciples.map((principle, index) => (
                  <Card key={index} className="border-border/50">
                    <CardContent className="pt-4 pb-4 text-center">
                      <principle.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                      <h3 className="font-semibold text-sm mb-1">{principle.title}</h3>
                      <p className="text-xs text-muted-foreground">{principle.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Cases Management Section */}
          <section className="py-12 px-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Your Cases</h2>
                  <p className="text-muted-foreground text-sm">
                    Time-bounded, purpose-driven investigations with clear scope
                  </p>
                </div>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Case
                </Button>
              </div>

              {/* Cases Grid */}
              {isLoading ? (
                <div className="text-center py-12">Loading cases...</div>
              ) : cases.length === 0 ? (
                <Card className="p-12 text-center border-dashed">
                  <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No cases yet</h3>
                  <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                    Cases provide ethical containment for OSINT investigations. Each case defines clear boundaries, preserves context, and supports accountability.
                  </p>
                  <div className="space-y-3">
                    <Button onClick={() => setIsDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Case
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Cases are designed for bounded, consent-aware investigations
                    </p>
                  </div>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cases.map((caseItem) => (
                    <Card
                      key={caseItem.id}
                      className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => navigate(`/cases/${caseItem.id}`)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(caseItem.status)}
                          <span className="text-sm font-medium capitalize">
                            {caseItem.status.replace("_", " ")}
                          </span>
                        </div>
                        <Badge variant={getPriorityColor(caseItem.priority)}>
                          {caseItem.priority}
                        </Badge>
                      </div>
                      
                      <h3 className="text-lg font-bold mb-2">{caseItem.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {caseItem.description || "No description"}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          Created {new Date(caseItem.created_at).toLocaleDateString()}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Who Uses Cases */}
          <section className="py-12 px-6 bg-muted/30 border-t border-border">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl font-bold mb-6 text-center">Designed For Ethical Use</h2>
              <div className="grid sm:grid-cols-3 gap-6">
                <div className="text-center">
                  <Users className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Journalists</h3>
                  <p className="text-sm text-muted-foreground">
                    Document sources and contain investigations to specific stories with clear boundaries
                  </p>
                </div>
                <div className="text-center">
                  <Scale className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Researchers</h3>
                  <p className="text-sm text-muted-foreground">
                    Maintain ethical standards with documented scope, purpose, and accountability
                  </p>
                </div>
                <div className="text-center">
                  <Shield className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Security Professionals</h3>
                  <p className="text-sm text-muted-foreground">
                    Conduct authorised assessments with auditable evidence and clear containment
                  </p>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Learn more about ethical OSINT principles →{" "}
                  <Link to="/ethical-osint-for-individuals" className="text-primary hover:underline">
                    Ethical OSINT for Individuals
                  </Link>
                </p>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>

      {/* Create Case Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Create New Case</DialogTitle>
            <DialogDescription>
              Define a bounded investigation with clear scope and purpose
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="template" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="template">Choose Template</TabsTrigger>
              <TabsTrigger value="details">Case Details</TabsTrigger>
            </TabsList>
            
            <TabsContent value="template" className="space-y-4">
              <CaseTemplates
                onSelectTemplate={setSelectedTemplate}
                selectedTemplateId={selectedTemplate?.id || null}
              />
              {selectedTemplate && (
                <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                  <div className="font-medium text-sm">Template Preview</div>
                  <p className="text-xs text-muted-foreground">{selectedTemplate.description}</p>
                  {selectedTemplate.checklist_items?.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Includes {selectedTemplate.checklist_items.length} checklist items
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="details" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Case Title *</Label>
                <Input
                  id="title"
                  placeholder={selectedTemplate ? `e.g., ${selectedTemplate.name} - [Subject]` : "Enter case title..."}
                  value={newCase.title}
                  onChange={(e) => setNewCase({ ...newCase, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Purpose & Scope</Label>
                <Textarea
                  id="description"
                  placeholder={selectedTemplate?.description || "Define the investigation purpose and boundaries..."}
                  value={newCase.description}
                  onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Clear scope helps maintain ethical boundaries throughout the investigation
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={selectedTemplate?.priority || newCase.priority} 
                    onValueChange={(value) => setNewCase({ ...newCase, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scan">Link to Scan</Label>
                  <Select value={newCase.scanId} onValueChange={(value) => setNewCase({ ...newCase, scanId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Optional" />
                    </SelectTrigger>
                    <SelectContent>
                      {scans.map((scan) => (
                        <SelectItem key={scan.id} value={scan.id}>
                          {scan.scan_type} - {new Date(scan.created_at).toLocaleDateString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsDialogOpen(false);
              setSelectedTemplate(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleCreateCase}>
              {selectedTemplate ? `Create from ${selectedTemplate.name}` : "Create Case"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Cases;
