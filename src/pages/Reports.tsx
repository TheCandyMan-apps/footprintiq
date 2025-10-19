import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Download, Calendar, Eye } from "lucide-react";
import { generateComprehensiveReport } from "@/lib/exports";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Reports = () => {
  const [scans, setScans] = useState<any[]>([]);
  const [selectedScan, setSelectedScan] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    loadScans();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const loadScans = async () => {
    try {
      const { data, error } = await supabase
        .from("scans")
        .select(`
          *,
          data_sources(*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setScans(data || []);
      if (data && data.length > 0) {
        setSelectedScan(data[0].id);
      }
    } catch (error: any) {
      toast({
        title: "Error loading scans",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedScan) {
      toast({
        title: "No scan selected",
        description: "Please select a scan to generate a report",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const scan = scans.find(s => s.id === selectedScan);
      if (!scan) throw new Error("Scan not found");

      await generateComprehensiveReport(scan, scan.data_sources || []);

      toast({
        title: "Report generated",
        description: "Your comprehensive report has been downloaded",
      });
    } catch (error: any) {
      toast({
        title: "Error generating report",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <SEO
        title="Reports & Export — FootprintIQ"
        description="Generate comprehensive PDF reports with executive summaries and detailed findings"
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 py-12 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <FileText className="w-8 h-8 text-primary" />
                Reports & Export
              </h1>
              <p className="text-muted-foreground">
                Generate comprehensive PDF reports with executive summaries and detailed analysis
              </p>
            </div>

            {/* Report Generator */}
            <Card className="p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">Generate Report</h2>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Scan</label>
                  <Select value={selectedScan} onValueChange={setSelectedScan}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a scan..." />
                    </SelectTrigger>
                    <SelectContent>
                      {scans.map((scan) => (
                        <SelectItem key={scan.id} value={scan.id}>
                          <div className="flex items-center gap-2">
                            <span className="capitalize">{scan.scan_type}</span>
                            <span className="text-muted-foreground">
                              • {new Date(scan.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedScan && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold mb-2">Report Contents:</h3>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Executive Summary</li>
                      <li>• Risk Assessment & Privacy Score</li>
                      <li>• Detailed Findings by Category</li>
                      <li>• Data Exposure Analysis</li>
                      <li>• Remediation Recommendations</li>
                      <li>• Timeline of Exposures</li>
                      <li>• Technical Details & Evidence</li>
                    </ul>
                  </div>
                )}

                <Button 
                  onClick={handleGenerateReport} 
                  disabled={!selectedScan || isGenerating}
                  className="w-full"
                  size="lg"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isGenerating ? "Generating..." : "Generate PDF Report"}
                </Button>
              </div>
            </Card>

            {/* Report History */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">Recent Scans</h2>
              
              {scans.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No scans available</h3>
                  <p className="text-muted-foreground mb-6">
                    Run a scan first to generate reports
                  </p>
                  <Button onClick={() => navigate("/scan")}>
                    Start New Scan
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {scans.slice(0, 10).map((scan) => (
                    <div
                      key={scan.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <FileText className="w-8 h-8 text-primary" />
                        <div>
                          <h3 className="font-semibold capitalize">{scan.scan_type} Scan</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(scan.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/results/${scan.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedScan(scan.id);
                            setTimeout(() => handleGenerateReport(), 100);
                          }}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Reports;