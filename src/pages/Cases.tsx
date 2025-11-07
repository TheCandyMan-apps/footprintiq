import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Briefcase, 
  Plus, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  ArrowRight 
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

      const { data, error } = await supabase
        .from("cases")
        .insert([
          {
            user_id: user.id,
            title: newCase.title,
            description: newCase.description,
            priority: newCase.priority,
            scan_id: newCase.scanId || null,
            status: "open",
          },
        ])
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
        description: "Your investigation case has been created successfully",
      });

      setIsDialogOpen(false);
      setNewCase({ title: "", description: "", priority: "medium", scanId: "" });
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

  return (
    <>
      <SEO
        title="Case Management — FootprintIQ"
        description="Manage investigation cases, collect evidence, and track remediation progress"
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                  <Briefcase className="w-8 h-8 text-primary" />
                  Case Management
                </h1>
                <p className="text-muted-foreground">
                  Track investigations, collect evidence, and manage remediation efforts
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
              <Card className="p-12 text-center">
                <Briefcase className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No cases yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first investigation case to start tracking evidence and remediation
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Case
                </Button>
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
        </main>

        <Footer />
      </div>

      {/* Create Case Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Case</DialogTitle>
            <DialogDescription>
              Start a new investigation case to track evidence and remediation
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Case Title</Label>
              <Input
                id="title"
                placeholder="Enter case title..."
                value={newCase.title}
                onChange={(e) => setNewCase({ ...newCase, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the investigation..."
                value={newCase.description}
                onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={newCase.priority} onValueChange={(value) => setNewCase({ ...newCase, priority: value })}>
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
              <Label htmlFor="scan">Link to Scan (Optional)</Label>
              <Select value={newCase.scanId} onValueChange={(value) => setNewCase({ ...newCase, scanId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a scan..." />
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

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCase}>Create Case</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Cases;