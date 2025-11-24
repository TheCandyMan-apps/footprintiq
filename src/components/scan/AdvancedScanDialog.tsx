import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAdvancedScan, AdvancedScanOptions } from '@/hooks/useAdvancedScan';
import { ScanProgressDialog } from './ScanProgressDialog';
import { Loader2, Zap } from 'lucide-react';
import { useWorkspace } from '@/hooks/useWorkspace';

interface AdvancedScanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdvancedScanDialog({ open, onOpenChange }: AdvancedScanDialogProps) {
  const navigate = useNavigate();
  const { startAdvancedScan, isScanning, progress } = useAdvancedScan();
  const { workspace } = useWorkspace();

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    username: '',
  });

  const [options, setOptions] = useState<AdvancedScanOptions>({
    deepWeb: true,
    socialMedia: true,
    faceRecognition: false,
    behavioralAnalysis: true,
    threatForecasting: true,
    correlationEngine: true,
  });

  const [progressOpen, setProgressOpen] = useState(false);
  const [currentScanId, setCurrentScanId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const scan = await startAdvancedScan(formData, options);
      setCurrentScanId(scan.id);
      onOpenChange(false);
      setProgressOpen(true);
    } catch (error) {
      // Error handled in hook
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Advanced Scan
            </DialogTitle>
            <DialogDescription>
              Run comprehensive scans with AI-powered features, deep web monitoring, and behavioral analysis
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
                {/* Input Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="user@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1234567890"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Doe"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="johndoe"
                    />
                  </div>
                </div>

                {/* Advanced Options */}
                <div className="space-y-3 border rounded-lg p-4">
                  <Label className="text-base font-semibold">Advanced Features</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="deepWeb"
                        checked={options.deepWeb}
                        onCheckedChange={(checked) =>
                          setOptions({ ...options, deepWeb: checked as boolean })
                        }
                      />
                      <Label htmlFor="deepWeb" className="text-sm font-normal cursor-pointer">
                        Dark Web Monitoring
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="socialMedia"
                        checked={options.socialMedia}
                        onCheckedChange={(checked) =>
                          setOptions({ ...options, socialMedia: checked as boolean })
                        }
                      />
                      <Label htmlFor="socialMedia" className="text-sm font-normal cursor-pointer">
                        Social Media Deep Scan
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="behavioralAnalysis"
                        checked={options.behavioralAnalysis}
                        onCheckedChange={(checked) =>
                          setOptions({ ...options, behavioralAnalysis: checked as boolean })
                        }
                      />
                      <Label htmlFor="behavioralAnalysis" className="text-sm font-normal cursor-pointer">
                        Behavioral Pattern Analysis
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="correlationEngine"
                        checked={options.correlationEngine}
                        onCheckedChange={(checked) =>
                          setOptions({ ...options, correlationEngine: checked as boolean })
                        }
                      />
                      <Label htmlFor="correlationEngine" className="text-sm font-normal cursor-pointer">
                        Data Correlation Engine
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="threatForecasting"
                        checked={options.threatForecasting}
                        onCheckedChange={(checked) =>
                          setOptions({ ...options, threatForecasting: checked as boolean })
                        }
                      />
                      <Label htmlFor="threatForecasting" className="text-sm font-normal cursor-pointer">
                        Threat Forecasting
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Progress */}
                {isScanning && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{progress.message}</span>
                      <span className="font-medium">{progress.progress}%</span>
                    </div>
                    <Progress value={progress.progress} />
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={isScanning}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isScanning}>
                    {isScanning ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Scanning...
                      </>
                    ) : (
                      'Start Advanced Scan'
                    )}
                  </Button>
                </div>
              </form>
        </DialogContent>
      </Dialog>

      <ScanProgressDialog
        open={progressOpen}
        onOpenChange={setProgressOpen}
        scanId={currentScanId}
        onComplete={() => {
          setProgressOpen(false);
          if (currentScanId) {
            navigate(`/maigret/results/${currentScanId}`);
          }
        }}
      />
    </>
  );
}
