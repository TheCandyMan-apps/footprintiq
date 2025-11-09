import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/useWorkspace";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingDown,
  Zap,
  Target,
  AlertCircle,
  DollarSign,
  Download,
  FileText,
  Table,
} from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Papa from "papaparse";

interface SpendingData {
  date: string;
  spent: number;
}

interface FeatureUsage {
  feature: string;
  count: number;
  totalCost: number;
}

interface Recommendation {
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  icon: any;
}

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

export function CreditsAnalyticsDashboard() {
  const { workspace } = useWorkspace();
  const [loading, setLoading] = useState(true);
  const [spendingOverTime, setSpendingOverTime] = useState<SpendingData[]>([]);
  const [featureUsage, setFeatureUsage] = useState<FeatureUsage[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [avgCostPerScan, setAvgCostPerScan] = useState(0);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    if (workspace?.id) {
      loadAnalytics();
    }
  }, [workspace?.id]);

  const loadAnalytics = async () => {
    if (!workspace?.id) return;

    setLoading(true);
    try {
      // Fetch all credit ledger entries for the workspace
      const { data: ledgerData, error } = await supabase
        .from("credits_ledger")
        .select("*")
        .eq("workspace_id", workspace.id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Process spending over time (group by day)
      const spendingByDay = new Map<string, number>();
      let totalDeductions = 0;
      const featureMap = new Map<string, { count: number; totalCost: number }>();

      ledgerData?.forEach((entry) => {
        const date = new Date(entry.created_at).toLocaleDateString();
        
        // Only count deductions (negative deltas)
        if (entry.delta < 0) {
          const spent = Math.abs(entry.delta);
          totalDeductions += spent;
          
          // Aggregate by day
          spendingByDay.set(date, (spendingByDay.get(date) || 0) + spent);

          // Extract feature from reason
          const feature = extractFeature(entry.reason);
          const existing = featureMap.get(feature) || { count: 0, totalCost: 0 };
          featureMap.set(feature, {
            count: existing.count + 1,
            totalCost: existing.totalCost + spent,
          });
        }
      });

      // Convert to arrays for charts
      const spendingData: SpendingData[] = Array.from(spendingByDay.entries())
        .map(([date, spent]) => ({ date, spent }))
        .slice(-30); // Last 30 days

      const featureData: FeatureUsage[] = Array.from(featureMap.entries()).map(
        ([feature, data]) => ({
          feature,
          count: data.count,
          totalCost: data.totalCost,
        })
      );

      setSpendingOverTime(spendingData);
      setFeatureUsage(featureData);
      setTotalSpent(totalDeductions);

      // Calculate average cost per scan
      const scanFeatures = featureData.filter(f => 
        f.feature.includes("Scan") || f.feature.includes("Analysis") || f.feature.includes("Enrichment")
      );
      const totalScans = scanFeatures.reduce((sum, f) => sum + f.count, 0);
      const avgCost = totalScans > 0 ? totalDeductions / totalScans : 0;
      setAvgCostPerScan(avgCost);

      // Generate recommendations
      const recs = generateRecommendations(featureData, totalDeductions, avgCost);
      setRecommendations(recs);

    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const extractFeature = (reason: string): string => {
    if (reason.includes("Quick Analysis")) return "Quick Analysis";
    if (reason.includes("Deep Enrichment")) return "Deep Enrichment";
    if (reason.includes("Export")) return "Export Report";
    if (reason.includes("Basic")) return "Basic Scan";
    if (reason.includes("Advanced")) return "Advanced Scan";
    if (reason.includes("Dark Web")) return "Dark Web Scan";
    if (reason.includes("Dating")) return "Dating Scan";
    return "Other";
  };

  const generateRecommendations = (
    features: FeatureUsage[],
    total: number,
    avgPerScan: number
  ): Recommendation[] => {
    const recs: Recommendation[] = [];

    // Find most expensive feature
    const mostExpensive = features.reduce((prev, curr) => 
      curr.totalCost > prev.totalCost ? curr : prev
    , features[0] || { feature: "", totalCost: 0 });

    if (mostExpensive.totalCost > total * 0.5) {
      recs.push({
        title: `Optimize ${mostExpensive.feature} Usage`,
        description: `${mostExpensive.feature} accounts for ${Math.round((mostExpensive.totalCost / total) * 100)}% of your spending. Consider using lighter alternatives for routine checks.`,
        impact: "high",
        icon: Target,
      });
    }

    // Check for high export usage
    const exportUsage = features.find(f => f.feature === "Export Report");
    if (exportUsage && exportUsage.count > 5) {
      recs.push({
        title: "Batch Your Export Reports",
        description: `You've generated ${exportUsage.count} reports. Consider batching multiple findings into a single export to save ${exportUsage.count * 5} credits.`,
        impact: "medium",
        icon: TrendingDown,
      });
    }

    // Check for enrichment vs quick analysis ratio
    const enrichment = features.find(f => f.feature === "Deep Enrichment");
    const quickAnalysis = features.find(f => f.feature === "Quick Analysis");
    
    if (enrichment && (!quickAnalysis || enrichment.count > quickAnalysis.count * 2)) {
      recs.push({
        title: "Use Quick Analysis First",
        description: `Quick Analysis costs 2 credits vs 5 for Deep Enrichment. Try Quick Analysis first to identify which findings need deeper investigation.`,
        impact: "high",
        icon: Zap,
      });
    }

    // Cost efficiency check
    if (avgPerScan > 7) {
      recs.push({
        title: "Review Scan Depth",
        description: `Your average cost per operation is ${avgPerScan.toFixed(1)} credits. Consider using basic scans for initial checks and advanced features only when needed.`,
        impact: "medium",
        icon: DollarSign,
      });
    }

    // If no specific recommendations
    if (recs.length === 0) {
      recs.push({
        title: "Efficient Usage Pattern",
        description: "Your credit usage is well-balanced. Keep using the right tools for each task to maintain cost efficiency.",
        impact: "low",
        icon: Target,
      });
    }

    return recs;
  };

  const exportToCSV = () => {
    try {
      // Prepare data for CSV
      const csvData = [
        ["Credit Usage Analytics Report"],
        ["Generated:", new Date().toLocaleString()],
        ["Workspace:", workspace?.name || workspace?.id || ""],
        [],
        ["Summary"],
        ["Total Credits Spent", totalSpent],
        ["Average Cost Per Operation", avgCostPerScan.toFixed(2)],
        ["Total Operations", featureUsage.reduce((sum, f) => sum + f.count, 0)],
        [],
        ["Spending Over Time"],
        ["Date", "Credits Spent"],
        ...spendingOverTime.map(d => [d.date, d.spent]),
        [],
        ["Feature Usage"],
        ["Feature", "Uses", "Total Cost"],
        ...featureUsage.map(f => [f.feature, f.count, f.totalCost]),
        [],
        ["Optimization Recommendations"],
        ["Impact", "Title", "Description"],
        ...recommendations.map(r => [r.impact, r.title, r.description]),
      ];

      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `credits-analytics-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Analytics report exported to CSV");
    } catch (error) {
      console.error("CSV export error:", error);
      toast.error("Failed to export CSV report");
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Title
      doc.setFontSize(20);
      doc.text("Credit Usage Analytics Report", pageWidth / 2, 20, { align: "center" });

      // Metadata
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
      doc.text(`Workspace: ${workspace?.name || workspace?.id || ""}`, 14, 36);

      // Summary Section
      doc.setFontSize(14);
      doc.text("Summary", 14, 48);
      
      (doc as any).autoTable({
        startY: 52,
        head: [["Metric", "Value"]],
        body: [
          ["Total Credits Spent", `${totalSpent} credits`],
          ["Average Cost Per Operation", `${avgCostPerScan.toFixed(2)} credits`],
          ["Total Operations", featureUsage.reduce((sum, f) => sum + f.count, 0)],
        ],
        theme: "grid",
        headStyles: { fillColor: [99, 102, 241] },
      });

      // Feature Usage Section
      let finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.text("Feature Usage", 14, finalY);

      (doc as any).autoTable({
        startY: finalY + 4,
        head: [["Feature", "Uses", "Total Cost"]],
        body: featureUsage.map(f => [f.feature, f.count, `${f.totalCost} credits`]),
        theme: "grid",
        headStyles: { fillColor: [99, 102, 241] },
      });

      // Spending Over Time Section
      finalY = (doc as any).lastAutoTable.finalY + 10;
      
      // Check if we need a new page
      if (finalY > 250) {
        doc.addPage();
        finalY = 20;
      }

      doc.setFontSize(14);
      doc.text("Recent Spending (Last 30 Days)", 14, finalY);

      const recentSpending = spendingOverTime.slice(-10); // Last 10 days for PDF
      (doc as any).autoTable({
        startY: finalY + 4,
        head: [["Date", "Credits Spent"]],
        body: recentSpending.map(d => [d.date, `${d.spent} credits`]),
        theme: "grid",
        headStyles: { fillColor: [99, 102, 241] },
      });

      // Recommendations Section
      finalY = (doc as any).lastAutoTable.finalY + 10;
      
      if (finalY > 250) {
        doc.addPage();
        finalY = 20;
      }

      doc.setFontSize(14);
      doc.text("Optimization Recommendations", 14, finalY);

      (doc as any).autoTable({
        startY: finalY + 4,
        head: [["Impact", "Title", "Description"]],
        body: recommendations.map(r => [
          r.impact.toUpperCase(),
          r.title,
          r.description,
        ]),
        theme: "grid",
        headStyles: { fillColor: [99, 102, 241] },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 50 },
          2: { cellWidth: 'auto' },
        },
      });

      doc.save(`credits-analytics-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("Analytics report exported to PDF");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export PDF report");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[300px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (spendingOverTime.length === 0) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No Usage Data Yet</h3>
        <p className="text-muted-foreground">
          Start using credits to see analytics and recommendations here.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Export Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Overview</h2>
          <p className="text-sm text-muted-foreground">
            Track your credit spending and optimize usage
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={exportToCSV}>
              <Table className="h-4 w-4 mr-2" />
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportToPDF}>
              <FileText className="h-4 w-4 mr-2" />
              Export as PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <p className="text-3xl font-bold">{totalSpent}</p>
              <p className="text-xs text-muted-foreground mt-1">credits</p>
            </div>
            <DollarSign className="h-10 w-10 text-muted-foreground/20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Cost/Operation</p>
              <p className="text-3xl font-bold">{avgCostPerScan.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground mt-1">credits</p>
            </div>
            <Target className="h-10 w-10 text-muted-foreground/20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Operations</p>
              <p className="text-3xl font-bold">
                {featureUsage.reduce((sum, f) => sum + f.count, 0)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">actions</p>
            </div>
            <Zap className="h-10 w-10 text-muted-foreground/20" />
          </div>
        </Card>
      </div>

      {/* Spending Over Time */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Spending Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={spendingOverTime}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip 
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="spent" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              name="Credits Spent"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Feature Usage Bar Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Feature Usage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={featureUsage}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="feature" 
                stroke="hsl(var(--muted-foreground))"
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Legend />
              <Bar dataKey="count" fill="hsl(var(--primary))" name="Uses" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Cost Distribution Pie Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Cost Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={featureUsage}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.feature}: ${entry.totalCost}c`}
                outerRadius={80}
                fill="hsl(var(--primary))"
                dataKey="totalCost"
              >
                {featureUsage.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Optimization Recommendations</h3>
        <div className="space-y-4">
          {recommendations.map((rec, index) => {
            const Icon = rec.icon;
            return (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  rec.impact === "high"
                    ? "bg-destructive/5 border-destructive/20"
                    : rec.impact === "medium"
                    ? "bg-primary/5 border-primary/20"
                    : "bg-muted/50 border-border"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    rec.impact === "high"
                      ? "bg-destructive/10"
                      : rec.impact === "medium"
                      ? "bg-primary/10"
                      : "bg-muted"
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{rec.title}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        rec.impact === "high"
                          ? "bg-destructive/20 text-destructive"
                          : rec.impact === "medium"
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {rec.impact} impact
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{rec.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
