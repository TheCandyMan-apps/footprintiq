import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, TrendingDown, ArrowRight, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

interface Scan {
  id: string;
  created_at: string;
  email: string | null;
  username: string | null;
  artifact_type: string;
}

interface ComparisonMetrics {
  totalFindings: number;
  criticalFindings: number;
  highFindings: number;
  mediumFindings: number;
  lowFindings: number;
  riskScore: number;
}

export function ComparativeAnalysis() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [scan1Id, setScan1Id] = useState<string>("");
  const [scan2Id, setScan2Id] = useState<string>("");
  const [scan1Metrics, setScan1Metrics] = useState<ComparisonMetrics | null>(null);
  const [scan2Metrics, setScan2Metrics] = useState<ComparisonMetrics | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadScans();
  }, []);

  useEffect(() => {
    if (scan1Id && scan2Id) {
      compareScans();
    }
  }, [scan1Id, scan2Id]);

  const loadScans = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data } = await supabase
        .from("scans")
        .select("id, created_at, email, username")
        .eq("user_id", user.user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (data) setScans(data.map(s => ({
        ...s,
        artifact_type: 'email'
      })));
    } catch (error) {
      console.error("Error loading scans:", error);
    }
  };

  const loadMetrics = async (scanId: string): Promise<ComparisonMetrics> => {
    // Simplified metrics calculation
    // In production, this would query actual findings data
    const mockFindings = {
      critical: Math.floor(Math.random() * 5),
      high: Math.floor(Math.random() * 10),
      medium: Math.floor(Math.random() * 15),
      low: Math.floor(Math.random() * 20)
    };

    const total = mockFindings.critical + mockFindings.high + mockFindings.medium + mockFindings.low;
    const riskScore = Math.min(100, (mockFindings.critical * 25) + (mockFindings.high * 10) + (mockFindings.medium * 5) + (mockFindings.low * 1));

    return {
      totalFindings: total,
      criticalFindings: mockFindings.critical,
      highFindings: mockFindings.high,
      mediumFindings: mockFindings.medium,
      lowFindings: mockFindings.low,
      riskScore: Math.round(riskScore)
    };
  };

  const compareScans = async () => {
    setLoading(true);
    try {
      const [metrics1, metrics2] = await Promise.all([
        loadMetrics(scan1Id),
        loadMetrics(scan2Id)
      ]);

      setScan1Metrics(metrics1);
      setScan2Metrics(metrics2);
    } catch (error) {
      console.error("Error comparing scans:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDifference = (val1: number, val2: number) => {
    const diff = val2 - val1;
    const isIncrease = diff > 0;
    return { diff: Math.abs(diff), isIncrease };
  };

  const getPercentageChange = (val1: number, val2: number) => {
    if (val1 === 0) return val2 > 0 ? 100 : 0;
    return Math.round(((val2 - val1) / val1) * 100);
  };

  const comparisonData = scan1Metrics && scan2Metrics ? [
    {
      metric: 'Critical',
      scan1: scan1Metrics.criticalFindings,
      scan2: scan2Metrics.criticalFindings
    },
    {
      metric: 'High',
      scan1: scan1Metrics.highFindings,
      scan2: scan2Metrics.highFindings
    },
    {
      metric: 'Medium',
      scan1: scan1Metrics.mediumFindings,
      scan2: scan2Metrics.mediumFindings
    },
    {
      metric: 'Low',
      scan1: scan1Metrics.lowFindings,
      scan2: scan2Metrics.lowFindings
    }
  ] : [];

  const radarData = scan1Metrics && scan2Metrics ? [
    {
      category: 'Critical',
      scan1: scan1Metrics.criticalFindings,
      scan2: scan2Metrics.criticalFindings
    },
    {
      category: 'High',
      scan1: scan1Metrics.highFindings,
      scan2: scan2Metrics.highFindings
    },
    {
      category: 'Medium',
      scan1: scan1Metrics.mediumFindings,
      scan2: scan2Metrics.mediumFindings
    },
    {
      category: 'Low',
      scan1: scan1Metrics.lowFindings,
      scan2: scan2Metrics.lowFindings
    },
    {
      category: 'Risk',
      scan1: scan1Metrics.riskScore / 10,
      scan2: scan2Metrics.riskScore / 10
    }
  ] : [];

  return (
    <div className="space-y-6">
      {/* Scan Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Scans to Compare</CardTitle>
          <CardDescription>Choose two scans to analyze differences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div>
              <label className="text-sm font-medium mb-2 block">Scan 1 (Baseline)</label>
              <Select value={scan1Id} onValueChange={setScan1Id}>
                <SelectTrigger>
                  <SelectValue placeholder="Select first scan" />
                </SelectTrigger>
                <SelectContent>
                  {scans.map((scan) => (
                    <SelectItem key={scan.id} value={scan.id}>
                      {scan.email || scan.username || 'Unknown'} - {new Date(scan.created_at).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Scan 2 (Comparison)</label>
              <Select value={scan2Id} onValueChange={setScan2Id}>
                <SelectTrigger>
                  <SelectValue placeholder="Select second scan" />
                </SelectTrigger>
                <SelectContent>
                  {scans.map((scan) => (
                    <SelectItem key={scan.id} value={scan.id}>
                      {scan.email || scan.username || 'Unknown'} - {new Date(scan.created_at).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Results */}
      {scan1Metrics && scan2Metrics && (
        <>
          {/* Key Metrics Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Findings</p>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{scan1Metrics.totalFindings}</div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    <div className="text-2xl font-bold">{scan2Metrics.totalFindings}</div>
                  </div>
                  <div className="flex items-center text-sm">
                    {getDifference(scan1Metrics.totalFindings, scan2Metrics.totalFindings).isIncrease ? (
                      <TrendingUp className="h-4 w-4 text-destructive mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-green-600 mr-1" />
                    )}
                    <span>
                      {getDifference(scan1Metrics.totalFindings, scan2Metrics.totalFindings).diff} 
                      ({getPercentageChange(scan1Metrics.totalFindings, scan2Metrics.totalFindings)}%)
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Critical Findings</p>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-destructive">{scan1Metrics.criticalFindings}</div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    <div className="text-2xl font-bold text-destructive">{scan2Metrics.criticalFindings}</div>
                  </div>
                  <div className="flex items-center text-sm">
                    {getDifference(scan1Metrics.criticalFindings, scan2Metrics.criticalFindings).isIncrease ? (
                      <>
                        <AlertCircle className="h-4 w-4 text-destructive mr-1" />
                        <span className="text-destructive">
                          +{getDifference(scan1Metrics.criticalFindings, scan2Metrics.criticalFindings).diff} more critical
                        </span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-4 w-4 text-green-600 mr-1" />
                        <span className="text-green-600">
                          -{getDifference(scan1Metrics.criticalFindings, scan2Metrics.criticalFindings).diff} fewer critical
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Risk Score</p>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{scan1Metrics.riskScore}</div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    <div className="text-2xl font-bold">{scan2Metrics.riskScore}</div>
                  </div>
                  <div className="flex items-center text-sm">
                    {getDifference(scan1Metrics.riskScore, scan2Metrics.riskScore).isIncrease ? (
                      <TrendingUp className="h-4 w-4 text-destructive mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-green-600 mr-1" />
                    )}
                    <span>
                      {getDifference(scan1Metrics.riskScore, scan2Metrics.riskScore).diff} points
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Findings by Severity</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metric" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="scan1" fill="#8b5cf6" name="Scan 1" />
                    <Bar dataKey="scan2" fill="#3b82f6" name="Scan 2" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Profile Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis />
                    <Radar name="Scan 1" dataKey="scan1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                    <Radar name="Scan 2" dataKey="scan2" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {!scan1Metrics && !scan2Metrics && scan1Id && scan2Id && loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Loading comparison data...</p>
          </CardContent>
        </Card>
      )}

      {!scan1Id || !scan2Id && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Select two scans to compare</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
