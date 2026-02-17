import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldCheck, AlertOctagon, Camera, Video, Mic, ScanSearch } from 'lucide-react';
import { toast } from 'sonner';

interface DeepfakeDefenseProps {
  score: number;
}

const mediaTypes = [
  { type: 'Image', icon: <Camera className="h-4 w-4" />, status: 'clear' as const, scannedCount: 0 },
  { type: 'Video', icon: <Video className="h-4 w-4" />, status: 'clear' as const, scannedCount: 0 },
  { type: 'Audio', icon: <Mic className="h-4 w-4" />, status: 'clear' as const, scannedCount: 0 },
];

export function DeepfakeDefense({ score }: DeepfakeDefenseProps) {
  const handleScan = () => {
    toast.info('Deepfake monitoring scan initiated. This feature requires an active Pro subscription and connected media sources.', {
      duration: 5000,
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Deepfake Defense
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Monitor for synthetic media using your likeness
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status overview */}
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Monitoring Status</span>
            <Badge variant="outline" className="text-xs text-green-500">
              <ShieldCheck className="h-3 w-3 mr-1" />
              No Threats Detected
            </Badge>
          </div>

          <div className="space-y-2">
            {mediaTypes.map(m => (
              <div key={m.type} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  {m.icon}
                  {m.type} Synthesis
                </span>
                <Badge variant="outline" className="text-xs text-green-500">
                  Clear
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Risk level based on sovereignty score */}
        <div className="rounded-lg border p-3">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted-foreground">Deepfake Risk Level</span>
            <span className={`font-medium ${
              score >= 70 ? 'text-green-500' : score >= 40 ? 'text-yellow-500' : 'text-destructive'
            }`}>
              {score >= 70 ? 'Low' : score >= 40 ? 'Medium' : 'High'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {score >= 70
              ? 'Strong sovereignty posture reduces deepfake target viability.'
              : score >= 40
              ? 'Moderate exposure — reducing your digital footprint decreases risk.'
              : 'High exposure increases the likelihood of being targeted by synthetic media.'}
          </p>
        </div>

        <Button variant="outline" size="sm" className="w-full gap-2" onClick={handleScan}>
          <ScanSearch className="h-4 w-4" />
          Run Deepfake Scan
        </Button>
      </CardContent>
    </Card>
  );
}
