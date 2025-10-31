import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, FileText, Download, Save } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const WIDGETS = [
  { id: "kpi", label: "KPI Strip", description: "Key metrics at a glance" },
  { id: "trend", label: "Trend Chart", description: "Time-series visualization" },
  { id: "sources", label: "Source Breakdown", description: "Findings by provider" },
  { id: "table", label: "Findings Table", description: "Detailed data table" },
  { id: "ai", label: "AI Summary", description: "Automated insights" },
];

export const ReportComposer = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>(["kpi", "ai"]);
  const [saving, setSaving] = useState(false);

  const toggleWidget = (widgetId: string) => {
    setSelectedWidgets((prev) =>
      prev.includes(widgetId)
        ? prev.filter((id) => id !== widgetId)
        : [...prev, widgetId]
    );
  };

  const saveReport = async () => {
    if (!name) {
      toast.error("Please enter a report name");
      return;
    }

    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const config = {
        dateRange,
        widgets: selectedWidgets,
      };

      const { error } = await supabase.from("saved_reports" as any).insert({
        user_id: userData.user.id,
        name,
        description: description || null,
        config,
      });

      if (error) throw error;
      toast.success("Report saved successfully");
      
      // Reset form
      setName("");
      setDescription("");
      setDateRange({ from: undefined, to: undefined });
      setSelectedWidgets(["kpi", "ai"]);
    } catch (error: any) {
      toast.error("Failed to save report: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const exportReport = async (format: "pdf" | "html") => {
    toast.info(`Exporting as ${format.toUpperCase()}...`);
    // TODO: Implement actual export via Edge Function
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        {/* Report Details */}
        <Card>
          <CardHeader>
            <CardTitle>Report Details</CardTitle>
            <CardDescription>Basic information about your report</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Report Name</Label>
              <Input
                id="name"
                placeholder="Q4 Security Assessment"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Summary of findings and recommendations..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Date Range */}
        <Card>
          <CardHeader>
            <CardTitle>Date Range</CardTitle>
            <CardDescription>Filter findings by date</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label>From</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-2",
                        !dateRange.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? format(dateRange.from, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) =>
                        setDateRange((prev) => ({ ...prev, from: date }))
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex-1">
                <Label>To</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-2",
                        !dateRange.to && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.to ? format(dateRange.to, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) =>
                        setDateRange((prev) => ({ ...prev, to: date }))
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Widgets */}
        <Card>
          <CardHeader>
            <CardTitle>Report Widgets</CardTitle>
            <CardDescription>Choose what to include in your report</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {WIDGETS.map((widget) => (
              <div key={widget.id} className="flex items-start space-x-3">
                <Checkbox
                  id={widget.id}
                  checked={selectedWidgets.includes(widget.id)}
                  onCheckedChange={() => toggleWidget(widget.id)}
                />
                <div className="space-y-1 leading-none">
                  <Label htmlFor={widget.id} className="cursor-pointer">
                    {widget.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {widget.description}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Preview & Actions */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" onClick={saveReport} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Report"}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => exportReport("pdf")}
            >
              <Download className="mr-2 h-4 w-4" />
              Export as PDF
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => exportReport("html")}
            >
              <FileText className="mr-2 h-4 w-4" />
              Export as HTML
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>Report:</strong> {name || "Untitled"}
              </p>
              <p>
                <strong>Widgets:</strong> {selectedWidgets.length} selected
              </p>
              <p>
                <strong>Date Range:</strong>{" "}
                {dateRange.from && dateRange.to
                  ? `${format(dateRange.from, "PP")} - ${format(dateRange.to, "PP")}`
                  : "Not set"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
