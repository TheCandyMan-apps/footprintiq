// Timeline Intelligence 2.0 - Chronological event analysis with comparison mode
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Download, Play, Pause, Filter, TrendingUp } from "lucide-react";
import { buildEntityTimeline, exportTimelineCSV } from "@/lib/timeline/builder";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Timeline() {
  const [searchParams] = useSearchParams();
  const entityId = searchParams.get("entity");
  const compareId = searchParams.get("compare");
  
  const [timeline, setTimeline] = useState<any[]>([]);
  const [compareTimeline, setCompareTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filters, setFilters] = useState<{
    severity: string;
    type: string;
    startDate: string;
    endDate: string;
  }>({
    severity: "all",
    type: "all",
    startDate: "",
    endDate: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    if (entityId) {
      loadTimeline(entityId, setTimeline);
    }
    if (compareId) {
      loadTimeline(compareId, setCompareTimeline);
    }
  }, [entityId, compareId]);

  useEffect(() => {
    if (!playing) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = prev + 1;
        if (nextIndex >= timeline.length) {
          setPlaying(false);
          return prev;
        }
        return nextIndex;
      });
    }, 2000); // 2 seconds per event

    return () => clearInterval(interval);
  }, [playing, timeline.length]);

  const loadTimeline = async (id: string, setter: (data: any[]) => void) => {
    setLoading(true);
    try {
      // Convert string dates to Date objects and severity/type to arrays
      const timelineFilters: any = {};
      
      if (filters.startDate) {
        timelineFilters.startDate = new Date(filters.startDate);
      }
      if (filters.endDate) {
        timelineFilters.endDate = new Date(filters.endDate);
      }
      if (filters.severity !== "all") {
        timelineFilters.severity = [filters.severity];
      }
      if (filters.type !== "all") {
        timelineFilters.eventTypes = [filters.type];
      }
      
      const events = await buildEntityTimeline(id, timelineFilters);
      setter(events);
    } catch (error: any) {
      console.error("Timeline load error:", error);
      toast({
        title: "Timeline Load Failed",
        description: error.message || "Unable to load timeline",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!entityId) return;
    
    try {
      const csv = exportTimelineCSV(timeline);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `timeline-${entityId}-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Complete",
        description: "Timeline exported to CSV",
      });
    } catch (error: any) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: error.message || "Unable to export timeline",
        variant: "destructive",
      });
    }
  };

  const togglePlay = () => {
    if (currentIndex >= timeline.length - 1) {
      setCurrentIndex(0);
    }
    setPlaying(!playing);
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: "destructive",
      high: "destructive",
      medium: "default",
      low: "secondary",
      info: "outline",
    };
    return colors[severity] || "outline";
  };

  const renderEvent = (event: any, isHighlighted: boolean = false) => (
    <div
      key={event.id}
      className={`p-4 rounded-lg border transition-all ${
        isHighlighted ? "border-primary bg-primary/5 shadow-md" : "border-border bg-card"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {event.type}
            </Badge>
            {event.severity && (
              <Badge variant={getSeverityColor(event.severity) as any} className="text-xs">
                {event.severity}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {format(new Date(event.timestamp), "PPp")}
            </span>
          </div>
          
          <p className="text-sm font-medium">{event.description}</p>
          
          {event.metadata && Object.keys(event.metadata).length > 0 && (
            <div className="text-xs text-muted-foreground space-y-0.5">
              {Object.entries(event.metadata).slice(0, 3).map(([key, value]) => (
                <div key={key}>
                  <span className="font-mono">{key}:</span>{" "}
                  <span>{String(value).slice(0, 50)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {event.confidence && (
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Confidence</div>
            <div className="text-sm font-medium">{Math.round(event.confidence * 100)}%</div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            Timeline Intelligence 2.0
          </h1>
          <p className="text-muted-foreground mt-2">
            Chronological event analysis{compareId ? " with comparison" : ""}
          </p>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={filters.severity} onValueChange={(v) => setFilters({ ...filters, severity: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.type} onValueChange={(v) => setFilters({ ...filters, type: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="scan">Scans</SelectItem>
                  <SelectItem value="monitor">Monitor Runs</SelectItem>
                  <SelectItem value="threat_intel">Threat Intel</SelectItem>
                  <SelectItem value="ai_report">AI Reports</SelectItem>
                  <SelectItem value="darkweb">Dark Web</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                placeholder="Start Date"
              />

              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                placeholder="End Date"
              />
            </div>

            <div className="flex items-center gap-2 mt-4">
              <Button onClick={togglePlay} variant="default" size="sm">
                {playing ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                {playing ? "Pause" : "Play"} Timeline
              </Button>
              
              <Button onClick={handleExport} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>

              <div className="ml-auto text-sm text-muted-foreground">
                {timeline.length} events
                {playing && ` • ${currentIndex + 1}/${timeline.length}`}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline Display */}
        <div className={compareId ? "grid grid-cols-1 lg:grid-cols-2 gap-6" : ""}>
          {/* Primary Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {compareId ? "Primary Entity" : "Timeline"}
              </CardTitle>
              {entityId && (
                <CardDescription className="font-mono text-xs">{entityId}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading timeline...
                </div>
              ) : timeline.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No events found for this entity.
                </div>
              ) : (
                <div className="space-y-3">
                  {timeline.map((event, idx) => renderEvent(event, playing && idx === currentIndex))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Compare Timeline */}
          {compareId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Comparison Entity
                </CardTitle>
                <CardDescription className="font-mono text-xs">{compareId}</CardDescription>
              </CardHeader>
              <CardContent>
                {compareTimeline.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No events found for comparison entity.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {compareTimeline.map((event) => renderEvent(event))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}