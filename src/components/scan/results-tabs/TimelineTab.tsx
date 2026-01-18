import { ScanHistoryTimeline } from '@/components/scan/ScanHistoryTimeline';

interface TimelineTabProps {
  scanId: string;
}

export function TimelineTab({ scanId }: TimelineTabProps) {
  return (
    <div className="space-y-4">
      <ScanHistoryTimeline scanId={scanId} />
    </div>
  );
}

export default TimelineTab;
