import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Download, Eye, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SavedReport {
  id: string;
  name: string;
  description: string | null;
  config: any;
  created_at: string;
}

const ReportsList = () => {
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from("saved_reports" as any)
        .select("*")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReports((data as unknown) as SavedReport[]);
    } catch (error: any) {
      toast.error("Failed to load reports: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = async (id: string) => {
    if (!confirm("Delete this report?")) return;

    try {
      const { error } = await supabase
        .from("saved_reports" as any)
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Report deleted");
      loadReports();
    } catch (error: any) {
      toast.error("Failed to delete: " + error.message);
    }
  };

  return (
    <>
      <SEO
        title="Saved Reports — FootprintIQ"
        description="Access your saved reports and exports"
        canonical="https://footprintiq.app/reports"
      />
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Saved Reports</h1>
              <p className="text-muted-foreground">
                Manage your custom reports and exports
              </p>
            </div>
            <Link to="/reports/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Report
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading reports...
            </div>
          ) : reports.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No reports yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first custom report to get started
                </p>
                <Link to="/reports/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Report
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {reports.map((report) => (
                <Card key={report.id}>
                  <CardHeader>
                    <CardTitle className="flex items-start justify-between">
                      <span className="line-clamp-1">{report.name}</span>
                      <Badge variant="outline">
                        {new Date(report.created_at).toLocaleDateString()}
                      </Badge>
                    </CardTitle>
                    {report.description && (
                      <CardDescription className="line-clamp-2">
                        {report.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteReport(report.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default ReportsList;
