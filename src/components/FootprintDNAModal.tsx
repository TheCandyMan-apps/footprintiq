import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingDown, TrendingUp, Minus, Shield, AlertTriangle, Database, Skull, Download, FileText, FileSpreadsheet, Settings } from 'lucide-react';
import { TrendDataPoint } from '@/lib/trends';
import { exportDNAasCSV, exportDNAasPDF, BrandingSettings, PDFTemplate } from '@/lib/dnaExport';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { PDFBrandingSettings } from '@/components/settings/PDFBrandingSettings';

interface FootprintDNAModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trendData: TrendDataPoint[];
  currentScore: number;
}

export const FootprintDNAModal = ({ 
  open, 
  onOpenChange, 
  trendData,
  currentScore 
}: FootprintDNAModalProps) => {
  const { toast } = useToast();
  const [brandingSettings, setBrandingSettings] = useState<BrandingSettings | undefined>();
  const [showBrandingSettings, setShowBrandingSettings] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PDFTemplate>('technical');

  useEffect(() => {
    if (open) {
      loadBrandingSettings();
    }
  }, [open]);

  const loadBrandingSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('pdf_branding_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setBrandingSettings({
          company_name: data.company_name || undefined,
          company_tagline: data.company_tagline || undefined,
          logo_url: data.logo_url,
          primary_color: data.primary_color || undefined,
          secondary_color: data.secondary_color || undefined,
        });
      }
    } catch (error) {
      console.error('Error loading branding settings:', error);
    }
  };
  // Calculate score change
  const getScoreTrend = () => {
    if (trendData.length < 2) return { change: 0, trend: 'stable' as const };
    const first = trendData[0].privacyScore;
    const last = trendData[trendData.length - 1].privacyScore;
    const change = last - first;
    return {
      change: Math.abs(change),
      trend: change < 0 ? 'down' as const : change > 0 ? 'up' as const : 'stable' as const
    };
  };

  const scoreTrend = getScoreTrend();

  // Get score color based on value
  const getScoreColor = (score: number) => {
    if (score < 40) return 'hsl(var(--accent))';
    if (score <= 70) return 'hsl(45 93% 47%)';
    return 'hsl(var(--destructive))';
  };

  // Format chart data
  const chartData = trendData.map(point => ({
    date: point.date,
    score: point.privacyScore,
    breaches: point.highRiskCount,
    exposures: point.mediumRiskCount,
    sources: point.totalSources
  }));

  const handleExportCSV = () => {
    exportDNAasCSV(trendData, currentScore);
    toast({
      title: "Export successful",
      description: "Your DNA report has been downloaded as CSV",
    });
  };

  const handleExportPDF = async () => {
    try {
      await exportDNAasPDF(trendData, currentScore, brandingSettings, selectedTemplate);
      toast({
        title: "Export successful",
        description: `Your ${selectedTemplate} report has been downloaded as PDF`,
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: "Export failed",
        description: "There was an error generating the PDF report",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">Digital DNA Analysis</DialogTitle>
            <div className="flex gap-2 items-center">
              <Select value={selectedTemplate} onValueChange={(value) => setSelectedTemplate(value as PDFTemplate)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="executive">Executive Summary</SelectItem>
                  <SelectItem value="technical">Technical Detail</SelectItem>
                  <SelectItem value="compliance">Compliance Focus</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBrandingSettings(true)}
                className="gap-2"
              >
                <Settings className="w-4 h-4" />
                PDF Settings
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                className="gap-2"
              >
                <FileText className="w-4 h-4" />
                Export PDF
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Score Summary */}
          <Card className="p-6 bg-gradient-to-br from-background via-background to-primary/5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-muted-foreground mb-1">Current Privacy Score</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold" style={{ color: getScoreColor(currentScore) }}>
                    {currentScore}
                  </span>
                  <span className="text-lg text-muted-foreground">/100</span>
                </div>
              </div>
              
              {trendData.length >= 2 && (
                <div className="flex items-center gap-2">
                  {scoreTrend.trend === 'down' && (
                    <>
                      <TrendingDown className="w-8 h-8 text-accent" />
                      <div className="text-right">
                        <div className="text-2xl font-bold text-accent">-{scoreTrend.change}</div>
                        <div className="text-xs text-muted-foreground">Improved</div>
                      </div>
                    </>
                  )}
                  {scoreTrend.trend === 'up' && (
                    <>
                      <TrendingUp className="w-8 h-8 text-destructive" />
                      <div className="text-right">
                        <div className="text-2xl font-bold text-destructive">+{scoreTrend.change}</div>
                        <div className="text-xs text-muted-foreground">Increased Risk</div>
                      </div>
                    </>
                  )}
                  {scoreTrend.trend === 'stable' && (
                    <>
                      <Minus className="w-8 h-8 text-muted-foreground" />
                      <div className="text-right">
                        <div className="text-2xl font-bold text-muted-foreground">No Change</div>
                        <div className="text-xs text-muted-foreground">Stable</div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Historical Charts */}
          <Tabs defaultValue="score" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="score">Privacy Score Trend</TabsTrigger>
              <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
            </TabsList>

            <TabsContent value="score" className="space-y-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Privacy Score Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: '12px' }}
                      domain={[0, 100]}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="score" 
                      stroke="hsl(var(--primary))" 
                      fillOpacity={1}
                      fill="url(#scoreGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>

              {trendData.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No historical data available yet</p>
                  <p className="text-sm">Run more scans to see trends over time</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="metrics" className="space-y-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Risk Metrics Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="breaches" 
                      stroke="hsl(var(--destructive))" 
                      strokeWidth={2}
                      name="High Risk"
                      dot={{ fill: 'hsl(var(--destructive))' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="exposures" 
                      stroke="hsl(45 93% 47%)" 
                      strokeWidth={2}
                      name="Medium Risk"
                      dot={{ fill: 'hsl(45 93% 47%)' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="sources" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      name="Total Sources"
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              {/* Metric Breakdown */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-5 h-5 text-destructive" />
                    <h4 className="font-semibold">Breaches</h4>
                  </div>
                  <p className="text-2xl font-bold text-destructive">
                    {chartData.length > 0 ? chartData[chartData.length - 1].breaches : 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">High risk findings</p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertTriangle className="w-5 h-5" style={{ color: 'hsl(45 93% 47%)' }} />
                    <h4 className="font-semibold">Exposures</h4>
                  </div>
                  <p className="text-2xl font-bold" style={{ color: 'hsl(45 93% 47%)' }}>
                    {chartData.length > 0 ? chartData[chartData.length - 1].exposures : 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Medium risk findings</p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Database className="w-5 h-5 text-primary" />
                    <h4 className="font-semibold">Total Sources</h4>
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    {chartData.length > 0 ? chartData[chartData.length - 1].sources : 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Data points found</p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Skull className="w-5 h-5 text-accent" />
                    <h4 className="font-semibold">Dark Web</h4>
                  </div>
                  <p className="text-2xl font-bold text-accent">0</p>
                  <p className="text-xs text-muted-foreground mt-1">Monitored continuously</p>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
      
      <PDFBrandingSettings 
        open={showBrandingSettings} 
        onOpenChange={(open) => {
          setShowBrandingSettings(open);
          if (!open) loadBrandingSettings(); // Reload settings after closing
        }} 
      />
    </Dialog>
  );
};
