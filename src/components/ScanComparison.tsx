import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, Minus, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";
import { ScanComparison as ComparisonType, compareTwoScans } from "@/lib/comparison";

interface ScanComparisonProps {
  previousScanId: string;
  currentScanId: string;
}

export const ScanComparison = ({ previousScanId, currentScanId }: ScanComparisonProps) => {
  const [comparison, setComparison] = useState<ComparisonType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadComparison = async () => {
      try {
        const result = await compareTwoScans(previousScanId, currentScanId);
        setComparison(result);
      } catch (error) {
        console.error('Failed to load comparison:', error);
      } finally {
        setLoading(false);
      }
    };

    loadComparison();
  }, [previousScanId, currentScanId]);

  if (loading) {
    return <Card><CardContent className="p-6">Loading comparison...</CardContent></Card>;
  }

  if (!comparison) {
    return <Card><CardContent className="p-6">Failed to load comparison</CardContent></Card>;
  }

  const getRiskScoreIcon = () => {
    if (comparison.riskScoreChange > 0) return <TrendingUp className="h-5 w-5 text-green-500" />;
    if (comparison.riskScoreChange < 0) return <TrendingDown className="h-5 w-5 text-red-500" />;
    return <Minus className="h-5 w-5 text-gray-400" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Scan Comparison</CardTitle>
          <CardDescription>Changes detected between scans</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              {comparison.newSources > 0 ? (
                <ArrowUp className="h-5 w-5 text-red-500" />
              ) : (
                <Minus className="h-5 w-5 text-gray-400" />
              )}
              <div>
                <div className="text-2xl font-bold">{comparison.newSources}</div>
                <div className="text-sm text-muted-foreground">New Exposures</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {comparison.removedSources > 0 ? (
                <ArrowDown className="h-5 w-5 text-green-500" />
              ) : (
                <Minus className="h-5 w-5 text-gray-400" />
              )}
              <div>
                <div className="text-2xl font-bold">{comparison.removedSources}</div>
                <div className="text-sm text-muted-foreground">Removed</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {getRiskScoreIcon()}
              <div>
                <div className="text-2xl font-bold">
                  {comparison.riskScoreChange > 0 ? '+' : ''}{comparison.riskScoreChange}
                </div>
                <div className="text-sm text-muted-foreground">Score Change</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {comparison.improvements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Improvements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {comparison.improvements.map((improvement, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {improvement}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {comparison.concerns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Concerns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {comparison.concerns.map((concern, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    {concern}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
