import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LensVerificationResult } from '@/hooks/useForensicVerification';

type ClaimType = 'me' | 'not_me';

interface EntityClaim {
  id: string;
  finding_id: string;
  claim_type: ClaimType;
}

interface InvestigationContextType {
  // Focus entity
  focusedEntityId: string | null;
  setFocusedEntity: (id: string | null) => void;
  
  // Entity claims
  claimedEntities: Map<string, ClaimType>;
  setClaim: (findingId: string, claim: ClaimType | null) => Promise<void>;
  isClaimLoading: boolean;
  
  // Verification results (cached from evidence_ledger)
  verifiedEntities: Map<string, LensVerificationResult>;
  setVerification: (findingId: string, result: LensVerificationResult) => void;
  
  // Scan context
  scanId: string;
}

const InvestigationContext = createContext<InvestigationContextType | null>(null);

export function useInvestigation() {
  const context = useContext(InvestigationContext);
  if (!context) {
    throw new Error('useInvestigation must be used within an InvestigationProvider');
  }
  return context;
}

interface InvestigationProviderProps {
  scanId: string;
  children: ReactNode;
}

export function InvestigationProvider({ scanId, children }: InvestigationProviderProps) {
  const [focusedEntityId, setFocusedEntityId] = useState<string | null>(null);
  const [claimedEntities, setClaimedEntities] = useState<Map<string, ClaimType>>(new Map());
  const [verifiedEntities, setVerifiedEntities] = useState<Map<string, LensVerificationResult>>(new Map());
  const [isClaimLoading, setIsClaimLoading] = useState(false);
  const { toast } = useToast();

  // Load existing claims from database
  useEffect(() => {
    async function loadClaims() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('entity_claims')
          .select('finding_id, claim_type')
          .eq('scan_id', scanId)
          .eq('user_id', user.id);

        if (error) throw error;

        const claimsMap = new Map<string, ClaimType>();
        data?.forEach(claim => {
          claimsMap.set(claim.finding_id, claim.claim_type as ClaimType);
        });
        setClaimedEntities(claimsMap);
      } catch (err) {
        console.error('Failed to load entity claims:', err);
      }
    }

    loadClaims();
  }, [scanId]);

  // Load existing verifications from evidence_ledger
  useEffect(() => {
    async function loadVerifications() {
      try {
        const { data, error } = await supabase
          .from('evidence_ledger')
          .select('finding_id, verification_hash, confidence_score, verified_at, source_age, ssl_status, platform_consistency, hashed_content')
          .eq('scan_id', scanId);

        if (error) throw error;

        const verificationsMap = new Map<string, LensVerificationResult>();
        data?.forEach(entry => {
          if (entry.finding_id && entry.confidence_score !== null) {
            verificationsMap.set(entry.finding_id, {
              cached: true,
              confidenceScore: entry.confidence_score,
              hashedContent: entry.hashed_content || '',
              verificationHash: entry.verification_hash || '',
              providerCount: 1,
              urlVerified: true,
              metadata: {
                sourceAge: entry.source_age || 'unknown',
                sslStatus: entry.ssl_status || 'unknown',
                platformConsistency: entry.platform_consistency || 'unknown',
                analysisMethod: 'LENS Standard',
              },
              verifiedAt: entry.verified_at || new Date().toISOString(),
            });
          }
        });
        setVerifiedEntities(verificationsMap);
      } catch (err) {
        console.error('Failed to load verifications:', err);
      }
    }

    loadVerifications();
  }, [scanId]);

  const setFocusedEntity = useCallback((id: string | null) => {
    setFocusedEntityId(id);
  }, []);

  const setClaim = useCallback(async (findingId: string, claim: ClaimType | null) => {
    setIsClaimLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Authentication Required',
          description: 'Please sign in to claim entities',
          variant: 'destructive',
        });
        return;
      }

      if (claim === null) {
        // Delete the claim
        const { error } = await supabase
          .from('entity_claims')
          .delete()
          .eq('finding_id', findingId)
          .eq('user_id', user.id);

        if (error) throw error;

        setClaimedEntities(prev => {
          const next = new Map(prev);
          next.delete(findingId);
          return next;
        });

        toast({
          title: 'Claim Removed',
          description: 'Entity claim has been removed',
        });
      } else {
        // Upsert the claim
        const { error } = await supabase
          .from('entity_claims')
          .upsert({
            finding_id: findingId,
            scan_id: scanId,
            user_id: user.id,
            claim_type: claim,
          }, {
            onConflict: 'finding_id,user_id',
          });

        if (error) throw error;

        setClaimedEntities(prev => {
          const next = new Map(prev);
          next.set(findingId, claim);
          return next;
        });

        toast({
          title: claim === 'me' ? 'Marked as You' : 'Marked as Not You',
          description: claim === 'me' 
            ? 'This account is linked to your identity'
            : 'This account is excluded from your identity',
        });
      }
    } catch (err: any) {
      console.error('Failed to set claim:', err);
      toast({
        title: 'Failed to Save Claim',
        description: err.message || 'Could not save your claim',
        variant: 'destructive',
      });
    } finally {
      setIsClaimLoading(false);
    }
  }, [scanId, toast]);

  const setVerification = useCallback((findingId: string, result: LensVerificationResult) => {
    setVerifiedEntities(prev => {
      const next = new Map(prev);
      next.set(findingId, result);
      return next;
    });
  }, []);

  return (
    <InvestigationContext.Provider
      value={{
        focusedEntityId,
        setFocusedEntity,
        claimedEntities,
        setClaim,
        isClaimLoading,
        verifiedEntities,
        setVerification,
        scanId,
      }}
    >
      {children}
    </InvestigationContext.Provider>
  );
}
