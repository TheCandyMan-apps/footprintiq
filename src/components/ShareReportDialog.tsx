import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Share2, Copy } from "lucide-react";

interface ShareReportDialogProps {
  scanId: string;
}

export function ShareReportDialog({ scanId }: ShareReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [expiresInDays, setExpiresInDays] = useState("7");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-share-link", {
        body: {
          scanId,
          expiresInDays: parseInt(expiresInDays) || null,
          password: password || null,
        },
      });

      if (error) throw error;

      setShareUrl(data.shareUrl);
      toast({ title: "Success", description: "Share link created" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({ title: "Copied", description: "Link copied to clipboard" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Share2 className="h-4 w-4 mr-2" />
          Share Report
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Report</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {!shareUrl ? (
            <>
              <div>
                <Label>Expires In (Days)</Label>
                <Input
                  type="number"
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(e.target.value)}
                  placeholder="7"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty for no expiration
                </p>
              </div>

              <div>
                <Label>Password (Optional)</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Optional password protection"
                />
              </div>

              <Button onClick={handleShare} disabled={loading} className="w-full">
                {loading ? "Creating..." : "Create Share Link"}
              </Button>
            </>
          ) : (
            <>
              <div>
                <Label>Share URL</Label>
                <div className="flex gap-2">
                  <Input value={shareUrl} readOnly />
                  <Button variant="outline" size="icon" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                This link can be shared with anyone. {expiresInDays && `It will expire in ${expiresInDays} days.`}
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
