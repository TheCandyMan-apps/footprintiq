import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock, Lock } from "lucide-react";
import { format as formatDate } from "date-fns";
import { cn } from "@/lib/utils";
import { notify } from "@/lib/notifications";
import { useResultsGating } from "@/components/billing/GatedContent";
import { useNavigate } from "react-router-dom";

interface ScheduledExportDialogProps {
  onSchedule?: (config: ScheduleConfig) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface ScheduleConfig {
  frequency: "daily" | "weekly" | "monthly";
  time: string;
  format: "json" | "csv" | "pdf";
  startDate: Date;
  email: string;
}

export function ScheduledExportDialog({ onSchedule, open: externalOpen, onOpenChange: externalOnOpenChange }: ScheduledExportDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [time, setTime] = useState("09:00");
  const [format, setFormat] = useState<"json" | "csv" | "pdf">("pdf");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [email, setEmail] = useState("");
  const { canExportDetails } = useResultsGating();
  const navigate = useNavigate();

  // Use external state if provided, otherwise use internal state
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setIsOpen = externalOnOpenChange || setInternalOpen;

  const handleSchedule = () => {
    if (!email) {
      notify.error({
        title: "Email required",
        description: "Please enter an email address for delivery",
      });
      return;
    }

    const config: ScheduleConfig = {
      frequency,
      time,
      format,
      startDate,
      email,
    };

    notify.success({
      title: "Export Scheduled",
      description: `${frequency.charAt(0).toUpperCase() + frequency.slice(1)} exports will be sent to ${email}`,
    });

    onSchedule?.(config);
    setIsOpen(false);
  };

  // Show gated button for free users
  if (!canExportDetails) {
    return (
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => navigate("/settings/billing")}
        className="gap-2 text-muted-foreground"
      >
        <Lock className="h-4 w-4" />
        Schedule Export
        <span className="text-xs text-primary ml-1">Pro</span>
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!externalOpen && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Clock className="h-4 w-4 mr-2" />
            Schedule Export
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Schedule Automated Exports</DialogTitle>
          <DialogDescription>
            Set up recurring exports of your findings and reports
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select value={frequency} onValueChange={(v: any) => setFrequency(v)}>
              <SelectTrigger id="frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="format">Export Format</Label>
            <Select value={format} onValueChange={(v: any) => setFormat(v)}>
              <SelectTrigger id="format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="pdf">PDF Report</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? formatDate(startDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => date && setStartDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Delivery Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="reports@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSchedule}>Schedule Export</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
