import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, AlertTriangle, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";
import { toast } from "sonner";

interface ThreatForecast {
  id: string;
  forecast_type: string;
  prediction_data: any;
  confidence_intervals: any;
  model_used: string;
  forecast_horizon_days: number;
  created_at: string;
  valid_until: string;
}

export default function ThreatForecast() {
  const navigate = useNavigate();
  const [forecasts, setForecasts] = useState<ThreatForecast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedForecast, setSelectedForecast] = useState<ThreatForecast | null>(null);

  useEffect(() => {
    loadForecasts();
  }, []);

  const loadForecasts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('threat_forecasts')
        .select('*')
        .gte('valid_until', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      if (!data || data.length === 0) {
        // Generate initial forecast if none exists
        toast.info('Generating initial forecast...');
        const { error: generateError } = await supabase.functions.invoke('threat-forecast-generator');
        if (!generateError) {
          // Reload after generation
          setTimeout(() => loadForecasts(), 2000);
          return;
        }
      }
      
      setForecasts(data || []);
      if (data && data.length > 0) {
        setSelectedForecast(data[0]);
      }
    } catch (error: any) {
      console.error('Load forecasts error:', error);
      toast.error('Failed to load forecasts');
    } finally {
      setIsLoading(false);
    }
  };

  const getChartData = (forecast: ThreatForecast | null) => {
    if (!forecast?.prediction_data) return [];
    
    const data = forecast.prediction_data;
    if (Array.isArray(data.predictions)) {
      return data.predictions.map((pred: any, idx: number) => ({
        day: `Day ${idx + 1}`,
        value: pred.value || pred,
        lower: data.confidence_intervals?.lower?.[idx],
        upper: data.confidence_intervals?.upper?.[idx]
      }));
    }
    return [];
  };

  const getSummaryStats = (forecast: ThreatForecast | null) => {
    if (!forecast?.prediction_data) return null;
    
    const data = forecast.prediction_data;
    const predictions = Array.isArray(data.predictions) ? data.predictions : [];
    
    if (predictions.length === 0) return null;
    
    const values = predictions.map((p: any) => typeof p === 'object' ? p.value : p);
    const avg = values.reduce((sum: number, v: number) => sum + v, 0) / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const trend = values[values.length - 1] - values[0];
    
    return { avg, max, min, trend };
  };

  const chartData = getChartData(selectedForecast);
  const stats = getSummaryStats(selectedForecast);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8" />
            Threat Forecast Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered predictive analytics for threat detection
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={async () => {
              toast.info('Generating new forecast...');
              const { error } = await supabase.functions.invoke('threat-forecast-generator');
              if (!error) {
                toast.success('Forecast generated');
                loadForecasts();
              }
            }} 
            variant="outline"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Generate Forecast
          </Button>
          <Button onClick={() => navigate('/dashboard')} variant="outline">
            Back to Dashboard
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : forecasts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium">No active forecasts</p>
            <p className="text-sm text-muted-foreground mt-2">
              Forecasts will appear here once threat models are trained
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Average
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stats.avg.toFixed(2)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Peak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stats.max.toFixed(2)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Minimum
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stats.min.toFixed(2)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <TrendingUp className={`h-5 w-5 ${stats.trend > 0 ? 'text-red-500' : 'text-green-500'}`} />
                    <p className="text-2xl font-bold">{stats.trend > 0 ? '+' : ''}{stats.trend.toFixed(2)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>7-Day Forecast</CardTitle>
                  <CardDescription>
                    {selectedForecast?.forecast_type} - Model: {selectedForecast?.model_used}
                  </CardDescription>
                </div>
                <Badge variant="outline">
                  Horizon: {selectedForecast?.forecast_horizon_days} days
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="upper" 
                      stackId="1"
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary) / 0.2)" 
                      name="Upper Bound"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stackId="2"
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary) / 0.4)" 
                      name="Prediction"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="lower" 
                      stackId="3"
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary) / 0.2)" 
                      name="Lower Bound"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No chart data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Forecast List */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Forecasts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {forecasts.map((forecast) => (
                  <div
                    key={forecast.id}
                    onClick={() => setSelectedForecast(forecast)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedForecast?.id === forecast.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{forecast.forecast_type}</p>
                        <p className="text-sm text-muted-foreground">
                          Model: {forecast.model_used} · {forecast.forecast_horizon_days} days
                        </p>
                      </div>
                      <Badge variant="outline">
                        {new Date(forecast.created_at).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
