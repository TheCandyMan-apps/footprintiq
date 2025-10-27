import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Play, TrendingUp, Award, Zap, AlertTriangle } from "lucide-react";
import { SEO } from "@/components/SEO";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function QualityLab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isRunning, setIsRunning] = useState(false);

  const { data: qualityScores, isLoading: scoresLoading } = useQuery({
    queryKey: ["quality-scores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("provider_quality_scores")
        .select("*")
        .order("avg_f1_score_7d", { ascending: false, nullsFirst: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: recentResults } = useQuery({
    queryKey: ["recent-quality-results"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quality_results")
        .select("*")
        .order("run_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
  });

  const { data: corpus } = useQuery({
    queryKey: ["quality-corpus"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quality_corpus")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const runBenchmark = useMutation({
    mutationFn: async (providerIds: string[]) => {
      const { data, error } = await supabase.functions.invoke("quality-benchmark", {
        body: {
          provider_ids: providerIds,
          corpus_version: "v1.0",
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quality-scores"] });
      queryClient.invalidateQueries({ queryKey: ["recent-quality-results"] });
      toast({
        title: "Benchmark Complete",
        description: "Quality test results have been updated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Benchmark Failed",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsRunning(false);
    },
  });

  const handleRunBenchmark = async () => {
    setIsRunning(true);
    // Get top providers to test
    const testProviders = ["hibp", "hunter", "dehashed", "shodan", "virustotal"];
    runBenchmark.mutate(testProviders);
  };

  const getRankColor = (rank: number | null) => {
    if (!rank) return "secondary";
    if (rank <= 3) return "default";
    if (rank <= 10) return "secondary";
    return "outline";
  };

  const getF1Color = (f1: number | null) => {
    if (!f1) return "text-muted-foreground";
    if (f1 >= 80) return "text-green-600";
    if (f1 >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Provider Quality Lab"
        description="Monitor provider quality, performance, and reliability"
      />
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Provider Quality Lab</h1>
            <p className="text-muted-foreground">
              Continuous benchmarking and quality monitoring
            </p>
          </div>
          
          <Button
            onClick={handleRunBenchmark}
            disabled={isRunning}
          >
            <Play className="w-4 h-4 mr-2" />
            {isRunning ? "Running..." : "Run Benchmark"}
          </Button>
        </div>

        <Tabs defaultValue="leaderboard" className="space-y-6">
          <TabsList>
            <TabsTrigger value="leaderboard">
              <Award className="w-4 h-4 mr-2" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="results">
              <TrendingUp className="w-4 h-4 mr-2" />
              Recent Results
            </TabsTrigger>
            <TabsTrigger value="corpus">
              <Zap className="w-4 h-4 mr-2" />
              Test Corpus
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard">
            <Card>
              <CardHeader>
                <CardTitle>Provider Rankings</CardTitle>
                <CardDescription>
                  Ranked by F1 score, latency, and reliability
                </CardDescription>
              </CardHeader>
              <CardContent>
                {scoresLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading scores...
                  </div>
                ) : qualityScores && qualityScores.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Provider</TableHead>
                        <TableHead>F1 Score (7d)</TableHead>
                        <TableHead>P95 Latency (7d)</TableHead>
                        <TableHead>Error Rate (7d)</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Tested</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {qualityScores.map((score, index) => (
                        <TableRow key={score.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Badge variant={getRankColor(index + 1)}>
                                #{index + 1}
                              </Badge>
                              {score.provider_id}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={getF1Color(score.avg_f1_score_7d)}>
                              {score.avg_f1_score_7d?.toFixed(1) || "—"}
                            </span>
                          </TableCell>
                          <TableCell>
                            {score.avg_p95_latency_7d ? `${score.avg_p95_latency_7d}ms` : "—"}
                          </TableCell>
                          <TableCell>
                            {score.avg_error_rate_7d ? `${score.avg_error_rate_7d.toFixed(1)}%` : "—"}
                          </TableCell>
                          <TableCell>
                            {score.is_degraded ? (
                              <Badge variant="destructive">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Degraded
                              </Badge>
                            ) : (
                              <Badge variant="outline">Healthy</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {score.last_tested_at
                              ? new Date(score.last_tested_at).toLocaleDateString()
                              : "Never"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No quality scores available. Run a benchmark to get started.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results">
            <Card>
              <CardHeader>
                <CardTitle>Recent Test Runs</CardTitle>
                <CardDescription>
                  Last 50 benchmark executions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentResults && recentResults.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Provider</TableHead>
                        <TableHead>Run Time</TableHead>
                        <TableHead>F1 Score</TableHead>
                        <TableHead>P95 Latency</TableHead>
                        <TableHead>Tests</TableHead>
                        <TableHead>Errors</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentResults.map((result) => (
                        <TableRow key={result.id}>
                          <TableCell className="font-medium">
                            {result.provider_id}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(result.run_at).toLocaleString()}
                          </TableCell>
                          <TableCell className={getF1Color(result.f1_score)}>
                            {result.f1_score?.toFixed(1) || "—"}
                          </TableCell>
                          <TableCell>
                            {result.p95_latency_ms ? `${result.p95_latency_ms}ms` : "—"}
                          </TableCell>
                          <TableCell>
                            <span className="text-green-600">{result.test_cases_passed}</span>
                            {" / "}
                            <span className="text-red-600">{result.test_cases_failed}</span>
                          </TableCell>
                          <TableCell>
                            {result.error_rate_pct ? `${result.error_rate_pct.toFixed(1)}%` : "0%"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No test results yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="corpus">
            <Card>
              <CardHeader>
                <CardTitle>Golden Test Corpus</CardTitle>
                <CardDescription>
                  {corpus?.length || 0} active test cases
                </CardDescription>
              </CardHeader>
              <CardContent>
                {corpus && corpus.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Test ID</TableHead>
                        <TableHead>Artifact Type</TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead>Tags</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {corpus.slice(0, 20).map((test) => (
                        <TableRow key={test.id}>
                          <TableCell className="font-mono text-sm">
                            {test.test_case_id}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{test.artifact_type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                test.difficulty === "hard"
                                  ? "destructive"
                                  : test.difficulty === "medium"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {test.difficulty}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              {test.tags?.slice(0, 3).map((tag: string) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No test cases in corpus. Add test cases to begin benchmarking.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
