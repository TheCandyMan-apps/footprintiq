import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldCheck, RefreshCw } from "lucide-react";

interface TurnstileFailedModalProps {
  open: boolean;
  onClose: () => void;
  onRetry: () => void;
}

export function TurnstileFailedModal({ open, onClose, onRetry }: TurnstileFailedModalProps) {
  const handleRetry = () => {
    onRetry();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-xl">Quick verification</DialogTitle>
          <DialogDescription className="text-muted-foreground pt-2">
            We use a privacy-friendly check to prevent automated abuse. Please try again.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center pt-4">
          <Button onClick={handleRetry} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
