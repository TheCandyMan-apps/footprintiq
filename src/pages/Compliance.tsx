import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Shield, CheckCircle } from "lucide-react";
import { SEO } from "@/components/SEO";

const complianceTemplates = [
  {
    id: "gdpr",
    name: "GDPR Compliance Report",
    regulation: "GDPR",
    description: "EU General Data Protection Regulation compliance documentation"
  },
  {
    id: "ccpa",
    name: "CCPA Compliance Report",
    regulation: "CCPA",
    description: "California Consumer Privacy Act compliance report"
  },
  {
    id: "soc2",
    name: "SOC 2 Audit Trail",
    regulation: "SOC 2",
    description: "Service Organization Control 2 audit documentation"
  },
  {
    id: "hipaa",
    name: "HIPAA Compliance",
    regulation: "HIPAA",
    description: "Health Insurance Portability and Accountability Act compliance"
  }
];

export default function Compliance() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    checkAuth();
    loadReports();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) navigate("/auth");
  };

  const loadReports = async () => {
    try {
      const { data } = await supabase
        .from("compliance_reports")
        .select("*")
        .order("generated_at", { ascending: false });

      setReports(data || []);
    } catch (error) {
      console.error("Error loading reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (templateId: string, regulationType: string) => {
    setGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user's scan data
      const { data: scans } = await supabase
        .from("scans")
        .select("*, data_sources(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      const reportData = {
        user_id: user.id,
        scan_summary: scans?.[0] || {},
        generated_at: new Date().toISOString(),
        regulation_type: regulationType,
      };

      const { data: report, error } = await supabase
        .from("compliance_reports")
        .insert({
          user_id: user.id,
          template_id: templateId,
          report_type: regulationType,
          report_data: reportData,
          status: "completed",
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Compliance report generated",
      });

      loadReports();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const downloadReport = (report: any) => {
    const blob = new Blob([JSON.stringify(report.report_data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.report_type}_report_${report.generated_at}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="container mx-auto py-8">Loading compliance reports...</div>;
  }

  return (
    <>
      <SEO 
        title="Compliance & Reporting — GDPR, CCPA, SOC 2 | FootprintIQ"
        description="Generate compliance reports and audit trails for GDPR, CCPA, SOC 2, and other privacy regulations. Enterprise-grade compliance management."
        canonical="https://footprintiq.app/compliance"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://footprintiq.app/"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Compliance",
              "item": "https://footprintiq.app/compliance"
            }
          ]
        }}
      />
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Compliance & Reporting</h1>
            <p className="text-muted-foreground">
              Generate reports for GDPR, CCPA, SOC 2, and other regulations
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {complianceTemplates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {template.name}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {template.description}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">{template.regulation}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => generateReport(template.id, template.regulation)}
                    disabled={generating}
                    className="w-full"
                  >
                    {generating ? "Generating..." : "Generate Report"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Generated Reports</CardTitle>
              <CardDescription>
                Your compliance reports and audit trails
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reports.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No reports generated yet. Create your first compliance report above.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{report.report_type} Report</p>
                        <p className="text-sm text-muted-foreground">
                          Generated: {new Date(report.generated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={report.status === "completed" ? "default" : "secondary"}>
                          {report.status === "completed" && <CheckCircle className="h-3 w-3 mr-1" />}
                          {report.status}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadReport(report)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
