import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Save, Play } from "lucide-react";

interface ReportSection {
  id: string;
  type: 'metrics' | 'chart' | 'table' | 'text';
  title: string;
  config: any;
}

export function ReportBuilder() {
  const [reportName, setReportName] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportType, setReportType] = useState("custom");
  const [sections, setSections] = useState<ReportSection[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const { toast } = useToast();

  const availableMetrics = [
    { id: 'total_scans', label: 'Total Scans', category: 'Activity' },
    { id: 'total_findings', label: 'Total Findings', category: 'Security' },
    { id: 'critical_findings', label: 'Critical Findings', category: 'Security' },
    { id: 'risk_score', label: 'Risk Score', category: 'Risk' },
    { id: 'compliance_score', label: 'Compliance Score', category: 'Compliance' },
    { id: 'active_monitors', label: 'Active Monitors', category: 'Monitoring' },
    { id: 'data_breaches', label: 'Data Breaches', category: 'Security' },
    { id: 'dark_web_mentions', label: 'Dark Web Mentions', category: 'Threat Intel' },
  ];

  const chartTypes = [
    { value: 'line', label: 'Line Chart' },
    { value: 'bar', label: 'Bar Chart' },
    { value: 'pie', label: 'Pie Chart' },
    { value: 'area', label: 'Area Chart' },
  ];

  const addSection = (type: ReportSection['type']) => {
    const newSection: ReportSection = {
      id: crypto.randomUUID(),
      type,
      title: `New ${type} section`,
      config: {}
    };
    setSections([...sections, newSection]);
  };

  const removeSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
  };

  const updateSection = (id: string, updates: Partial<ReportSection>) => {
    setSections(sections.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const saveReport = async () => {
    if (!reportName) {
      toast({ title: "Error", description: "Please enter a report name", variant: "destructive" });
      return;
    }

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const { data, error } = await supabase.from("custom_reports").insert([{
        user_id: user.user.id,
        name: reportName,
        description: reportDescription,
        report_type: reportType,
        config: JSON.parse(JSON.stringify({
          sections,
          metrics: selectedMetrics
        }))
      }]).select();

      if (error) throw error;

      toast({ title: "Success", description: "Report saved successfully" });
      setReportName("");
      setReportDescription("");
      setSections([]);
      setSelectedMetrics([]);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const generateReport = async () => {
    toast({ title: "Generating", description: "Your report is being generated..." });
    // This would call a backend function to generate the report
  };

  return (
    <div className="space-y-6">
      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
          <CardDescription>Set up your custom report</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="reportName">Report Name</Label>
            <Input
              id="reportName"
              placeholder="Monthly Executive Summary"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="reportDescription">Description</Label>
            <Textarea
              id="reportDescription"
              placeholder="Comprehensive overview of security metrics..."
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="reportType">Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger id="reportType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="executive">Executive Summary</SelectItem>
                <SelectItem value="detailed">Detailed Analysis</SelectItem>
                <SelectItem value="comparison">Comparison Report</SelectItem>
                <SelectItem value="custom">Custom Report</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Metrics</CardTitle>
          <CardDescription>Choose which metrics to include</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {availableMetrics.map((metric) => (
              <div key={metric.id} className="flex items-center space-x-2">
                <Checkbox
                  id={metric.id}
                  checked={selectedMetrics.includes(metric.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedMetrics([...selectedMetrics, metric.id]);
                    } else {
                      setSelectedMetrics(selectedMetrics.filter(m => m !== metric.id));
                    }
                  }}
                />
                <label htmlFor={metric.id} className="text-sm cursor-pointer">
                  {metric.label}
                  <Badge variant="outline" className="ml-2 text-xs">
                    {metric.category}
                  </Badge>
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Sections */}
      <Card>
        <CardHeader>
          <CardTitle>Report Sections</CardTitle>
          <CardDescription>Build your report layout</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => addSection('metrics')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Metrics
            </Button>
            <Button variant="outline" size="sm" onClick={() => addSection('chart')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Chart
            </Button>
            <Button variant="outline" size="sm" onClick={() => addSection('table')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Table
            </Button>
            <Button variant="outline" size="sm" onClick={() => addSection('text')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Text
            </Button>
          </div>

          {/* Section List */}
          <div className="space-y-3">
            {sections.map((section, idx) => (
              <div key={section.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">#{idx + 1}</span>
                    <Badge>{section.type}</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSection(section.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <Input
                  placeholder="Section title"
                  value={section.title}
                  onChange={(e) => updateSection(section.id, { title: e.target.value })}
                />

                {section.type === 'chart' && (
                  <Select
                    value={section.config.chartType || 'line'}
                    onValueChange={(value) => 
                      updateSection(section.id, { 
                        config: { ...section.config, chartType: value }
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select chart type" />
                    </SelectTrigger>
                    <SelectContent>
                      {chartTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ))}

            {sections.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No sections added yet. Click the buttons above to add sections to your report.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={saveReport}>
          <Save className="h-4 w-4 mr-2" />
          Save Report Template
        </Button>
        <Button variant="outline" onClick={generateReport}>
          <Play className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>
    </div>
  );
}
