import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Share2, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ShareLinkGeneratorProps {
  scanId: string;
}

export function ShareLinkGenerator({ scanId }: ShareLinkGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [expiresInHours, setExpiresInHours] = useState(24);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-share-link", {
        body: { scanId, expiresInHours },
      });

      if (error) throw error;

      setShareUrl(data.shareUrl);
      toast.success(`Share link created (expires in ${expiresInHours}h)`);
    } catch (error: any) {
      console.error("Generate share link error:", error);
      toast.error(error.message || "Failed to generate share link");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share Report
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Report</DialogTitle>
          <DialogDescription>
            Generate a time-limited public link to share this report
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="expires">Expires in (hours)</Label>
            <Input
              id="expires"
              type="number"
              min="1"
              max="168"
              value={expiresInHours}
              onChange={(e) => setExpiresInHours(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              Max 168 hours (7 days)
            </p>
          </div>

          {!shareUrl ? (
            <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
              {isGenerating ? "Generating..." : "Generate Share Link"}
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input value={shareUrl} readOnly />
                <Button onClick={handleCopy} variant="outline" size="icon">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                This link will expire in {expiresInHours} hours
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
