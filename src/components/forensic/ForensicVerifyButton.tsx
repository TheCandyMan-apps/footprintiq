import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle, Loader2 } from 'lucide-react';
import { useForensicVerification, LensVerificationResult } from '@/hooks/useForensicVerification';
import { ForensicModal } from './ForensicModal';
import { cn } from '@/lib/utils';

interface ForensicVerifyButtonProps {
  findingId: string;
  url: string;
  platform: string;
  scanId: string;
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function ForensicVerifyButton({
  findingId,
  url,
  platform,
  scanId,
  className,
  size = 'sm',
}: ForensicVerifyButtonProps) {
  const { verify, isVerifying, verificationResult, reset } = useForensicVerification();
  const [modalOpen, setModalOpen] = useState(false);
  const [localResult, setLocalResult] = useState<LensVerificationResult | null>(null);

  const handleVerify = async () => {
    const result = await verify({ url, platform, scanId, findingId });
    if (result) {
      setLocalResult(result);
      setModalOpen(true);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setModalOpen(open);
    if (!open) {
      // Keep the result for showing the verified state
    }
  };

  const isVerified = localResult !== null || verificationResult !== null;
  const currentResult = localResult || verificationResult;

  return (
    <>
      <Button
        variant={isVerified ? 'secondary' : 'ghost'}
        size={size}
        onClick={isVerified ? () => setModalOpen(true) : handleVerify}
        disabled={isVerifying}
        className={cn(
          'gap-1.5',
          isVerified && 'text-green-600 dark:text-green-400',
          className
        )}
        title={isVerified ? 'View forensic verification' : 'Verify evidence with LENS'}
      >
        {isVerifying ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span className="hidden sm:inline text-xs">Analyzing...</span>
          </>
        ) : isVerified ? (
          <>
            <CheckCircle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-xs">Verified</span>
          </>
        ) : (
          <>
            <Shield className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-xs">Verify</span>
          </>
        )}
      </Button>

      <ForensicModal
        open={modalOpen}
        onOpenChange={handleOpenChange}
        result={currentResult}
        url={url}
        platform={platform}
      />
    </>
  );
}
