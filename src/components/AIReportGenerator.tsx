import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, FileText, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from 'react-markdown';

interface AIReportGeneratorProps {
  scanId: string;
}

export const AIReportGenerator = ({ scanId }: AIReportGeneratorProps) => {
  const [reportType, setReportType] = useState<'executive' | 'technical'>('executive');
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const { toast } = useToast();

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-report-generator', {
        body: { scanId, reportType }
      });

      if (error) throw error;

      setReport(data.report);
      toast({
        title: "Success",
        description: "AI report generated successfully",
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI report",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = () => {
    if (!report) return;

    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `footprintiq-${reportType}-report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded",
      description: "Report downloaded successfully",
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            AI Report Generator
          </CardTitle>
          <CardDescription>
            Generate comprehensive AI-powered reports from your scan data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Report Type</label>
            <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="executive">Executive Summary</SelectItem>
                <SelectItem value="technical">Technical Report</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {reportType === 'executive' 
                ? 'High-level overview for decision makers'
                : 'Detailed technical analysis with remediation steps'}
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={generateReport} 
              disabled={isGenerating}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
            {report && (
              <Button onClick={downloadReport} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {report && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{report}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
