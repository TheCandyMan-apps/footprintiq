import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, TrendingUp, TrendingDown, RefreshCw, CheckCircle, XCircle, AlertTriangle, FileDown } from "lucide-react";
import { UsernameScanComparison as ComparisonType, compareUsernameScans } from "@/lib/usernameScanComparison";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { exportComparisonToPDF } from "@/utils/scanComparisonPdfExport";
import { useToast } from "@/hooks/use-toast";

interface ScanJob {
  id: string;
  username: string;
  created_at: string;
  status: string;
}

export const UsernameScanComparison = () => {
  const [scans, setScans] = useState<ScanJob[]>([]);
  const [scan1Id, setScan1Id] = useState<string>("");
  const [scan2Id, setScan2Id] = useState<string>("");
  const [comparison, setComparison] = useState<ComparisonType | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadScans();
  }, []);

  const loadScans = async () => {
    const { data } = await supabase
      .from('scan_jobs')
      .select('id, username, created_at, status')
      .eq('status', 'finished')
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) setScans(data);
  };

  const handleCompare = async () => {
    if (!scan1Id || !scan2Id) return;
    
    setLoading(true);
    try {
      const result = await compareUsernameScans(scan1Id, scan2Id);
      setComparison(result);
      toast({
        title: "Comparison Complete",
        description: "Scan results have been compared successfully",
      });
    } catch (error) {
      console.error('Failed to compare scans:', error);
      toast({
        title: "Comparison Failed",
        description: "Unable to compare the selected scans",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!comparison) return;
    try {
      exportComparisonToPDF(comparison);
      toast({
        title: "PDF Export Started",
        description: "Your comparison report is being downloaded",
      });
    } catch (error) {
      console.error('Failed to export PDF:', error);
      toast({
        title: "Export Failed",
        description: "Unable to generate PDF report",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'found': return 'default';
      case 'claimed': return 'secondary';
      case 'not_found': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'found': return 'text-success';
      case 'claimed': return 'text-info';
      case 'not_found': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl font-semibold">Compare Username Scans</CardTitle>
              <CardDescription>Select two completed scans to compare results side-by-side</CardDescription>
            </div>
            {comparison && (
              <Button onClick={handleExportPDF} variant="outline" size="sm">
                <FileDown className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">First Scan</label>
              <Select value={scan1Id} onValueChange={setScan1Id}>
                <SelectTrigger>
                  <SelectValue placeholder="Select first scan" />
                </SelectTrigger>
                <SelectContent>
                  {scans.map((scan) => (
                    <SelectItem key={scan.id} value={scan.id}>
                      {scan.username} - {new Date(scan.created_at).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Second Scan</label>
              <Select value={scan2Id} onValueChange={setScan2Id}>
                <SelectTrigger>
                  <SelectValue placeholder="Select second scan" />
                </SelectTrigger>
                <SelectContent>
                  {scans.map((scan) => (
                    <SelectItem key={scan.id} value={scan.id}>
                      {scan.username} - {new Date(scan.created_at).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleCompare} 
              disabled={!scan1Id || !scan2Id || loading}
              className="w-full md:w-auto"
            >
              {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
              Compare Scans
            </Button>
          </div>
        </CardContent>
      </Card>

      {comparison && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Scan 1 Stats */}
            <Card className="rounded-2xl shadow-sm">
              <CardHeader className="p-6">
                <CardTitle className="text-lg font-semibold">{comparison.scan1Username}</CardTitle>
                <CardDescription>{new Date(comparison.scan1Date).toLocaleString()}</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Sites</span>
                    <Badge variant="outline">{comparison.scan1Stats.total}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Found</span>
                    <Badge className="bg-success/10 text-success border-success/20">{comparison.scan1Stats.found}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Claimed</span>
                    <Badge className="bg-info/10 text-info border-info/20">{comparison.scan1Stats.claimed}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Not Found</span>
                    <Badge variant="outline">{comparison.scan1Stats.notFound}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scan 2 Stats */}
            <Card className="rounded-2xl shadow-sm">
              <CardHeader className="p-6">
                <CardTitle className="text-lg font-semibold">{comparison.scan2Username}</CardTitle>
                <CardDescription>{new Date(comparison.scan2Date).toLocaleString()}</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Sites</span>
                    <Badge variant="outline">{comparison.scan2Stats.total}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Found</span>
                    <Badge className="bg-success/10 text-success border-success/20">{comparison.scan2Stats.found}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Claimed</span>
                    <Badge className="bg-info/10 text-info border-info/20">{comparison.scan2Stats.claimed}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Not Found</span>
                    <Badge variant="outline">{comparison.scan2Stats.notFound}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Metrics */}
          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="p-6">
              <CardTitle className="text-lg font-semibold">Comparison Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-success/5 border border-success/10">
                  <TrendingUp className="h-5 w-5 text-success" />
                  <div>
                    <div className="text-2xl font-bold text-success">{comparison.newSites.length}</div>
                    <div className="text-xs text-muted-foreground">New Sites</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/5 border border-destructive/10">
                  <TrendingDown className="h-5 w-5 text-destructive" />
                  <div>
                    <div className="text-2xl font-bold text-destructive">{comparison.removedSites.length}</div>
                    <div className="text-xs text-muted-foreground">Removed Sites</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-2xl font-bold text-primary">{comparison.commonSites.length}</div>
                    <div className="text-xs text-muted-foreground">Common Sites</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg bg-warning/5 border border-warning/10">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  <div>
                    <div className="text-2xl font-bold text-warning">{comparison.statusChanges.length}</div>
                    <div className="text-xs text-muted-foreground">Status Changes</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* New Sites */}
          {comparison.newSites.length > 0 && (
            <Card className="rounded-2xl shadow-sm">
              <CardHeader className="p-6">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <TrendingUp className="h-5 w-5 text-success" />
                  New Sites Found
                </CardTitle>
                <CardDescription>Sites that appeared in the second scan</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Site</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>URL</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {comparison.newSites.map((site, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            <Badge variant="outline" className="font-mono text-xs">{site.site}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(site.status)}>{site.status}</Badge>
                          </TableCell>
                          <TableCell className="max-w-md truncate text-sm text-muted-foreground">
                            {site.url || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status Changes */}
          {comparison.statusChanges.length > 0 && (
            <Card className="rounded-2xl shadow-sm">
              <CardHeader className="p-6">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <RefreshCw className="h-5 w-5 text-warning" />
                  Status Changes
                </CardTitle>
                <CardDescription>Sites with different statuses between scans</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Site</TableHead>
                        <TableHead>Previous Status</TableHead>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>New Status</TableHead>
                        <TableHead>URL</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {comparison.statusChanges.map((change: any, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            <Badge variant="outline" className="font-mono text-xs">{change.site}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(change.oldStatus)}>{change.oldStatus}</Badge>
                          </TableCell>
                          <TableCell>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(change.newStatus)}>{change.newStatus}</Badge>
                          </TableCell>
                          <TableCell className="max-w-md truncate text-sm text-muted-foreground">
                            {change.url || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Removed Sites */}
          {comparison.removedSites.length > 0 && (
            <Card className="rounded-2xl shadow-sm">
              <CardHeader className="p-6">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <XCircle className="h-5 w-5 text-destructive" />
                  Removed Sites
                </CardTitle>
                <CardDescription>Sites that were in the first scan but not the second</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Site</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>URL</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {comparison.removedSites.map((site, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            <Badge variant="outline" className="font-mono text-xs">{site.site}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(site.status)}>{site.status}</Badge>
                          </TableCell>
                          <TableCell className="max-w-md truncate text-sm text-muted-foreground">
                            {site.url || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
