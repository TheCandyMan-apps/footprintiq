import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, GitBranch, TrendingUp, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface LinkPrediction {
  id: string;
  entity_a: string;
  entity_b: string;
  probability: number;
  rationale: any; // Json type from database
  status: string; // From database enum
  created_at: string;
}

export default function PersonaResolver() {
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState<LinkPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [comparingEntities, setComparingEntities] = useState<{ a: string; b: string } | null>(null);
  const [isComparing, setIsComparing] = useState(false);

  useEffect(() => {
    loadPredictions();
  }, [selectedFilter]);

  const loadPredictions = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('link_predictions')
        .select('*')
        .order('probability', { ascending: false });

      if (selectedFilter !== 'all') {
        query = query.eq('status', selectedFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setPredictions(data || []);
    } catch (error: any) {
      console.error('Load predictions error:', error);
      toast.error('Failed to load predictions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompare = async () => {
    if (!comparingEntities) return;
    setIsComparing(true);

    try {
      const { data, error } = await supabase.functions.invoke('fusion-compare', {
        body: {
          entityA: comparingEntities.a,
          entityB: comparingEntities.b
        }
      });

      if (error) {
        // Check if it's a vector not found error
        if (error.message?.includes('vectors not found') || error.message?.includes('Entity vectors not found')) {
          toast.error('Entity vectors not found. Build vectors by running a scan first.', {
            description: 'Each entity needs embeddings generated from scan data before comparison.',
            duration: 6000
          });
        } else {
          throw error;
        }
        return;
      }

      toast.success(`Comparison complete: ${data.recommendation}`);
      await loadPredictions();
      setComparingEntities(null);
    } catch (error: any) {
      console.error('Compare error:', error);
      toast.error(error.message || 'Comparison failed', {
        description: 'Check console for details'
      });
    } finally {
      setIsComparing(false);
    }
  };

  const handleUpdateStatus = async (predictionId: string, status: 'confirmed' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('link_predictions')
        .update({ 
          status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', predictionId);

      if (error) throw error;

      toast.success(`Link ${status}`);
      await loadPredictions();
    } catch (error: any) {
      console.error('Update status error:', error);
      toast.error('Failed to update status');
    }
  };

  const getProbabilityColor = (prob: number) => {
    if (prob >= 0.85) return 'bg-red-500';
    if (prob >= 0.6) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getProbabilityLabel = (prob: number) => {
    if (prob >= 0.85) return 'High Confidence';
    if (prob >= 0.6) return 'Moderate';
    return 'Low';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <GitBranch className="h-8 w-8" />
            Persona Resolver
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered entity resolution and identity linkage
          </p>
        </div>
        <Button onClick={() => navigate('/dashboard')} variant="outline">
          Back to Dashboard
        </Button>
      </div>

      {/* Quick Compare Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Quick Compare
          </CardTitle>
          <CardDescription>
            Compare two entities to determine if they're the same person. Note: Entity vectors must be built from scan data first.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Entity A ID</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                placeholder="Enter entity ID"
                value={comparingEntities?.a || ''}
                onChange={(e) => setComparingEntities(prev => ({ ...prev, a: e.target.value, b: prev?.b || '' }))}
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Entity B ID</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                placeholder="Enter entity ID"
                value={comparingEntities?.b || ''}
                onChange={(e) => setComparingEntities(prev => ({ ...prev, b: e.target.value, a: prev?.a || '' }))}
              />
            </div>
            <Button 
              onClick={handleCompare}
              disabled={!comparingEntities?.a || !comparingEntities?.b || isComparing}
            >
              {isComparing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Compare
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Predictions List */}
      <Card>
        <CardHeader>
          <CardTitle>Link Predictions</CardTitle>
          <Tabs value={selectedFilter} onValueChange={setSelectedFilter}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="review">Review</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : predictions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium mb-2">No predictions found</p>
              <p className="text-sm">To compare entities:</p>
              <ol className="text-sm mt-3 space-y-1 text-left max-w-md mx-auto">
                <li>1. Run a scan on usernames/identities</li>
                <li>2. Entity vectors are auto-generated from scan results</li>
                <li>3. Use Quick Compare above with entity IDs (usernames)</li>
              </ol>
            </div>
          ) : (
            <div className="space-y-4">
              {predictions.map((pred) => (
                <div key={pred.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={getProbabilityColor(pred.probability)}>
                          {(pred.probability * 100).toFixed(1)}% Match
                        </Badge>
                        <Badge variant="outline">{getProbabilityLabel(pred.probability)}</Badge>
                        <Badge variant={
                          pred.status === 'confirmed' ? 'default' :
                          pred.status === 'rejected' ? 'destructive' :
                          'secondary'
                        }>
                          {pred.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p><strong>Entity A:</strong> {pred.entity_a}</p>
                        <p><strong>Entity B:</strong> {pred.entity_b}</p>
                      </div>
                    </div>
                    {pred.status === 'review' || pred.status === 'pending' ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleUpdateStatus(pred.id, 'confirmed')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleUpdateStatus(pred.id, 'rejected')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    ) : null}
                  </div>
                  {Array.isArray(pred.rationale) && pred.rationale.length > 0 && (
                    <div className="bg-muted rounded-md p-3">
                      <p className="text-sm font-medium mb-2">Evidence:</p>
                      <ul className="text-sm space-y-1">
                        {pred.rationale.map((reason: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
