import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Bug, Camera } from 'lucide-react';
import html2canvas from 'html2canvas';

interface BugReporterProps {
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export function BugReporter({ error, errorInfo }: BugReporterProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(error?.message || '');
  const [description, setDescription] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const captureScreenshot = async () => {
    try {
      const canvas = await html2canvas(document.body, {
        allowTaint: true,
        useCORS: true,
        logging: false,
      });
      const screenshotData = canvas.toDataURL('image/png');
      setScreenshot(screenshotData);
      toast({
        title: 'Screenshot captured',
        description: 'Screenshot will be included with your bug report',
      });
    } catch (error) {
      console.error('Screenshot capture failed:', error);
      toast({
        title: 'Screenshot failed',
        description: 'Unable to capture screenshot. You can still submit the report.',
        variant: 'destructive',
      });
    }
  };

  const submitBugReport = async () => {
    if (!title.trim() || !description.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please provide both a title and description',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      let screenshotUrl: string | null = null;
      
      // Upload screenshot if available
      if (screenshot) {
        const fileName = `bug-${Date.now()}.png`;
        const base64Data = screenshot.split(',')[1];
        const blob = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('bug-screenshots')
          .upload(fileName, blob, {
            contentType: 'image/png',
            upsert: false,
          });

        if (uploadError) {
          console.error('Screenshot upload failed:', uploadError);
        } else if (uploadData) {
          const { data: { publicUrl } } = supabase.storage
            .from('bug-screenshots')
            .getPublicUrl(uploadData.path);
          screenshotUrl = publicUrl;
        }
      }

      const { error: insertError } = await supabase
        .from('bugs')
        .insert({
          user_id: user?.id || null,
          title: title.trim(),
          description: description.trim(),
          screenshot_url: screenshotUrl,
          page_url: window.location.href,
          user_agent: navigator.userAgent,
          error_stack: error?.stack || errorInfo?.componentStack || null,
          severity: error ? 'high' : 'medium',
        });

      if (insertError) throw insertError;

      toast({
        title: 'Bug report submitted',
        description: 'Thank you! Our team will investigate this issue.',
      });

      setOpen(false);
      setTitle('');
      setDescription('');
      setScreenshot(null);
    } catch (err) {
      console.error('Bug report submission failed:', err);
      toast({
        title: 'Submission failed',
        description: 'Please email us at support@footprintiq.app',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <Bug className="h-4 w-4" />
        Report Bug
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Report a Bug</DialogTitle>
            <DialogDescription>
              Help us improve by reporting issues you encounter. Include as much detail as possible.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Brief description of the issue"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What happened? What were you trying to do?"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {screenshot && (
              <div>
                <Label>Screenshot Preview</Label>
                <img 
                  src={screenshot} 
                  alt="Bug screenshot" 
                  className="w-full border rounded-md mt-2"
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={captureScreenshot}
                disabled={loading}
                className="gap-2"
              >
                <Camera className="h-4 w-4" />
                {screenshot ? 'Retake Screenshot' : 'Capture Screenshot'}
              </Button>

              <Button
                onClick={submitBugReport}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
