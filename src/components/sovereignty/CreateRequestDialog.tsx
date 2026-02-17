import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CreateRequestInput, Jurisdiction, RequestType } from '@/hooks/useSovereignty';
import { Shield, FileText, Globe } from 'lucide-react';

interface CreateRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CreateRequestInput) => void;
  isSubmitting: boolean;
}

const JURISDICTION_INFO: Record<Jurisdiction, { label: string; icon: React.ReactNode; deadline: string; description: string }> = {
  gdpr: {
    label: 'GDPR (EU/EEA)',
    icon: <Globe className="h-4 w-4" />,
    deadline: '30 days',
    description: 'General Data Protection Regulation — applies to EU/EEA residents',
  },
  ccpa: {
    label: 'CCPA (California)',
    icon: <Shield className="h-4 w-4" />,
    deadline: '45 days',
    description: 'California Consumer Privacy Act — applies to California residents',
  },
  uk_sds: {
    label: 'UK SDS',
    icon: <FileText className="h-4 w-4" />,
    deadline: '30 days',
    description: 'UK Subject Data Access — applies to UK residents post-Brexit',
  },
};

export function CreateRequestDialog({ open, onOpenChange, onSubmit, isSubmitting }: CreateRequestDialogProps) {
  const [entity, setEntity] = useState('');
  const [url, setUrl] = useState('');
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>('gdpr');
  const [requestType, setRequestType] = useState<RequestType>('erasure');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entity.trim()) return;
    onSubmit({
      target_entity: entity.trim(),
      target_url: url.trim() || undefined,
      jurisdiction,
      request_type: requestType,
      notes: notes.trim() || undefined,
    });
    // Reset
    setEntity('');
    setUrl('');
    setNotes('');
    onOpenChange(false);
  };

  const selectedJurisdiction = JURISDICTION_INFO[jurisdiction];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            New Erasure Request
          </DialogTitle>
          <DialogDescription>
            Create a right-to-erasure request to track removal of your data from a broker or platform.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="entity">Platform / Data Broker *</Label>
            <Input
              id="entity"
              placeholder="e.g. Spokeo, BeenVerified, MyLife"
              value={entity}
              onChange={e => setEntity(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Listing URL (optional)</Label>
            <Input
              id="url"
              placeholder="https://..."
              value={url}
              onChange={e => setUrl(e.target.value)}
              type="url"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Jurisdiction</Label>
              <Select value={jurisdiction} onValueChange={(v) => setJurisdiction(v as Jurisdiction)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(JURISDICTION_INFO).map(([key, info]) => (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        {info.icon}
                        {info.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Request Type</Label>
              <Select value={requestType} onValueChange={(v) => setRequestType(v as RequestType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="erasure">Right to Erasure</SelectItem>
                  <SelectItem value="access">Data Access</SelectItem>
                  <SelectItem value="rectification">Rectification</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Jurisdiction info card */}
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="flex items-center gap-2 text-sm font-medium mb-1">
              {selectedJurisdiction.icon}
              {selectedJurisdiction.label}
              <Badge variant="outline" className="text-xs ml-auto">
                {selectedJurisdiction.deadline} deadline
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{selectedJurisdiction.description}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional context..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!entity.trim() || isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
