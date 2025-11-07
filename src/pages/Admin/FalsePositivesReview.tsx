import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  AlertCircle, 
  RefreshCw, 
  Calendar,
  CheckCircle,
  XCircle,
  TrendingUp,
  Brain,
  Filter,
  Search,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { ConfidenceScoreBadge } from '@/components/ConfidenceScoreBadge';

interface FeedbackItem {
  id: string;
  user_id: string;
  scan_id: string;
  item_type: 'data_source' | 'social_profile';
  item_id: string;
  item_name: string;
  confidence_score: number;
  reason: string;
  created_at: string;
  reviewed: boolean;
  reviewer_notes?: string;
}

interface MLTrainingResult {
  success: boolean;
  modelVersion: string;
  accuracy?: number;
  samplesProcessed: number;
  patterns?: {
    commonProviders: string[];
    lowConfidenceThreshold: number;
    categoryPatterns: Record<string, number>;
  };
}

export default function FalsePositivesReview() {
  const { toast } = useToast();
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'data_source' | 'social_profile'>('all');
  const [filterReviewed, setFilterReviewed] = useState<'all' | 'reviewed' | 'pending'>('pending');
  const [isTraining, setIsTraining] = useState(false);
  const [trainingResult, setTrainingResult] = useState<MLTrainingResult | null>(null);

  const { data: feedback, isLoading, refetch } = useQuery({
    queryKey: ['false-positives', filterType, filterReviewed, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('feedback')
        .select('*')
        .eq('reason', 'false_positive')
        .order('created_at', { ascending: false });

      if (filterType !== 'all') {
        query = query.eq('item_type', filterType);
      }

      if (filterReviewed === 'reviewed') {
        query = query.eq('reviewed', true);
      } else if (filterReviewed === 'pending') {
        query = query.eq('reviewed', false);
      }

      if (searchTerm) {
        query = query.ilike('item_name', `%${searchTerm}%`);
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;
      return data as FeedbackItem[];
    },
  });

  // Fetch analytics
  const { data: analytics } = useQuery({
    queryKey: ['feedback-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feedback')
        .select('item_type, confidence_score, reviewed')
        .eq('reason', 'false_positive');

      if (error) throw error;

      const total = data.length;
      const reviewed = data.filter(f => f.reviewed).length;
      const byType = {
        data_source: data.filter(f => f.item_type === 'data_source').length,
        social_profile: data.filter(f => f.item_type === 'social_profile').length,
      };
      const avgConfidence = data.reduce((sum, f) => sum + (f.confidence_score || 0), 0) / total;
      const lowConfidenceCount = data.filter(f => (f.confidence_score || 0) < 50).length;

      return {
        total,
        reviewed,
        pending: total - reviewed,
        byType,
        avgConfidence: Math.round(avgConfidence),
        lowConfidenceCount,
        lowConfidencePercentage: Math.round((lowConfidenceCount / total) * 100)
      };
    },
  });

  const markReviewed = async (feedbackId: string, notes?: string) => {
    const { error } = await supabase
      .from('feedback')
      .update({ 
        reviewed: true,
        reviewer_notes: notes 
      })
      .eq('id', feedbackId);

    if (!error) {
      toast({
        title: "Marked as Reviewed",
        description: "Feedback has been processed.",
      });
      refetch();
      setSelectedFeedback(null);
    } else {
      toast({
        title: "Error",
        description: "Failed to update feedback.",
        variant: "destructive"
      });
    }
  };

  const trainMLModel = async () => {
    setIsTraining(true);
    setTrainingResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('ml-train-feedback', {
        body: { feedbackType: 'false_positive' }
      });

      if (error) throw error;

      setTrainingResult(data as MLTrainingResult);
      toast({
        title: "ML Training Complete",
        description: `Processed ${data.samplesProcessed} samples. Model accuracy: ${data.accuracy?.toFixed(2)}%`,
      });
    } catch (error) {
      console.error('ML training error:', error);
      toast({
        title: "Training Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsTraining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">False Positives Review</h1>
          <p className="text-muted-foreground">
            Review user-flagged false positives and train ML models
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={trainMLModel} 
            disabled={isTraining}
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            <Brain className="w-4 h-4 mr-2" />
            {isTraining ? 'Training...' : 'Train ML Model'}
          </Button>
        </div>
      </div>

      {/* Analytics Stats */}
      {analytics && (
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Flagged</p>
                <p className="text-3xl font-bold">{analytics.total}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-muted-foreground" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending Review</p>
                <p className="text-3xl font-bold text-orange-500">{analytics.pending}</p>
              </div>
              <Filter className="w-8 h-8 text-orange-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Reviewed</p>
                <p className="text-3xl font-bold text-green-500">{analytics.reviewed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Avg Confidence</p>
                <p className="text-3xl font-bold">{analytics.avgConfidence}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-muted-foreground" />
            </div>
          </Card>
        </div>
      )}

      {/* ML Training Results */}
      {trainingResult && (
        <Card className="p-6 mb-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-900">
          <div className="flex items-start gap-4">
            <Brain className="w-8 h-8 text-purple-600 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">ML Model Training Results</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Model Version</p>
                  <p className="font-semibold">{trainingResult.modelVersion}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Samples Processed</p>
                  <p className="font-semibold">{trainingResult.samplesProcessed}</p>
                </div>
                {trainingResult.accuracy !== undefined && (
                  <div>
                    <p className="text-sm text-muted-foreground">Model Accuracy</p>
                    <p className="font-semibold text-green-600">{trainingResult.accuracy.toFixed(2)}%</p>
                  </div>
                )}
              </div>
              {trainingResult.patterns && (
                <div className="mt-4 p-4 bg-background/50 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Detected Patterns:</p>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Common False Positive Providers:</p>
                      <div className="flex flex-wrap gap-2">
                        {trainingResult.patterns.commonProviders.map(provider => (
                          <Badge key={provider} variant="secondary">{provider}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Low Confidence Threshold:</p>
                      <p className="font-semibold">{trainingResult.patterns.lowConfidenceThreshold}%</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by item name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="data_source">Data Sources</SelectItem>
              <SelectItem value="social_profile">Social Profiles</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterReviewed} onValueChange={(value: any) => setFilterReviewed(value)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending Review</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Feedback List and Details */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Flagged Items ({feedback?.length || 0})
          </h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {feedback && feedback.length > 0 ? (
              feedback.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedFeedback(item)}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedFeedback?.id === item.id
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-muted/50'
                  } ${item.reviewed ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant={item.item_type === 'data_source' ? 'default' : 'secondary'}>
                      {item.item_type === 'data_source' ? 'Data Source' : 'Social Profile'}
                    </Badge>
                    <div className="flex gap-2">
                      <ConfidenceScoreBadge 
                        score={item.confidence_score || 0}
                        size="sm"
                        showIcon={false}
                      />
                      {item.reviewed && (
                        <Badge variant="outline" className="gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Reviewed
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <p className="font-semibold mb-1 line-clamp-1">{item.item_name}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(item.created_at), 'MMM d, h:mm a')}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-muted-foreground">No feedback items found</p>
              </div>
            )}
          </div>
        </Card>

        {/* Feedback Details */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Feedback Details</h2>
          {selectedFeedback ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Item Type</p>
                <Badge variant={selectedFeedback.item_type === 'data_source' ? 'default' : 'secondary'}>
                  {selectedFeedback.item_type === 'data_source' ? 'Data Source' : 'Social Profile'}
                </Badge>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-1">Item Name</p>
                <p className="font-semibold">{selectedFeedback.item_name}</p>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-2">Confidence Score</p>
                <ConfidenceScoreBadge score={selectedFeedback.confidence_score || 0} />
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-1">Item ID</p>
                <code className="text-sm bg-muted px-2 py-1 rounded block overflow-x-auto">
                  {selectedFeedback.item_id}
                </code>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-1">Scan ID</p>
                <code className="text-sm bg-muted px-2 py-1 rounded block overflow-x-auto">
                  {selectedFeedback.scan_id}
                </code>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-1">Flagged At</p>
                <p className="text-sm">
                  {format(new Date(selectedFeedback.created_at), 'PPpp')}
                </p>
              </div>

              {selectedFeedback.reviewer_notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Reviewer Notes</p>
                    <p className="text-sm bg-muted p-3 rounded">{selectedFeedback.reviewer_notes}</p>
                  </div>
                </>
              )}

              {!selectedFeedback.reviewed && (
                <div className="pt-4">
                  <Button
                    onClick={() => markReviewed(selectedFeedback.id, 'Reviewed by admin')}
                    className="w-full"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Reviewed
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-96 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Select a feedback item to view details
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
