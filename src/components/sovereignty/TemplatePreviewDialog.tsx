import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { SovereigntyRequest } from '@/hooks/useSovereignty';
import { generateErasureTemplate } from '@/lib/sovereignty/templates';
import { format } from 'date-fns';
import { Copy, Download, Check, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface TemplatePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: SovereigntyRequest | null;
  userName?: string;
  userEmail?: string;
}

export function TemplatePreviewDialog({ open, onOpenChange, request, userName, userEmail }: TemplatePreviewDialogProps) {
  const [copied, setCopied] = useState(false);

  if (!request) return null;

  const templateText = generateErasureTemplate({
    targetEntity: request.target_entity,
    targetUrl: request.target_url || undefined,
    jurisdiction: request.jurisdiction,
    requestType: request.request_type,
    userName,
    userEmail,
    date: format(new Date(), 'MMMM d, yyyy'),
  });

  const handleCopy = async () => {
    await navigator.clipboard.writeText(templateText);
    setCopied(true);
    toast.success('Template copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([templateText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `erasure-request-${request.target_entity.toLowerCase().replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Template downloaded');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Erasure Request Template
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            Pre-filled for <Badge variant="outline">{request.target_entity}</Badge>
            <Badge variant="secondary" className="text-xs">{request.jurisdiction.toUpperCase()}</Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-auto">
          <Textarea
            value={templateText}
            readOnly
            className="font-mono text-xs min-h-[300px] resize-none"
            rows={20}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={handleDownload} className="gap-2">
            <Download className="h-4 w-4" />
            Download .txt
          </Button>
          <Button onClick={handleCopy} className="gap-2">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
