import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTierGating } from '@/hooks/useTierGating';
import { BrokerExposureSummary, type BrokerEntry } from './privacy-center/BrokerExposureSummary';
import { RemovalWorkflowModal } from './privacy-center/RemovalWorkflowModal';
import { RemovalTracker } from './privacy-center/RemovalTracker';
import { Lock, Sparkles, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface PrivacyCenterTabProps {
  scanId: string;
}

interface IdentityProfile {
  full_name: string;
  email: string;
  region: string;
  address: string;
}

function LockedPrivacyCenter() {
  return (
    <div className="relative">
      {/* Blurred preview */}
      <div className="filter blur-sm pointer-events-none select-none opacity-60 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[6, 3, 2, 1].map((n, i) => (
            <Card key={i} className="rounded-xl">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{n}</p>
                <p className="text-xs text-muted-foreground">{['Total', 'High', 'Medium', 'Low'][i]} Risk</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="rounded-xl">
          <CardContent className="p-4 space-y-3">
            {['Spokeo', 'BeenVerified', 'Whitepages'].map(name => (
              <div key={name} className="flex items-center justify-between py-2">
                <span className="text-sm">{name}</span>
                <span className="text-xs bg-muted px-2 py-1 rounded">Start Removal</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Overlay CTA */}
      <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-xl">
        <div className="text-center space-y-3 max-w-sm px-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Privacy Center</h3>
          <p className="text-sm text-muted-foreground">
            Manage data broker exposure and generate GDPR removal requests with a Pro plan.
          </p>
          <Button onClick={() => window.location.href = '/pricing'} className="gap-2">
            <Sparkles className="h-4 w-4" /> Upgrade to Pro
          </Button>
        </div>
      </div>
    </div>
  );
}

export function PrivacyCenterTab({ scanId }: PrivacyCenterTabProps) {
  const { isFree, isLoading: tierLoading } = useTierGating();
  const [brokers, setBrokers] = useState<BrokerEntry[]>([]);
  const [removalRequests, setRemovalRequests] = useState<any[]>([]);
  const [identityProfile, setIdentityProfile] = useState<IdentityProfile | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [selectedBroker, setSelectedBroker] = useState<BrokerEntry | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    try {
      // Load data brokers with their removal request status for this scan
      const { data: brokerData } = await supabase
        .from('data_brokers')
        .select('*')
        .order('risk_level', { ascending: false });

      // Load removal requests for this scan
      const { data: requestData } = await supabase
        .from('removal_requests')
        .select('*')
        .eq('scan_id', scanId);

      // Load user identity profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData } = await supabase
          .from('user_identity_profiles')
          .select('*')
          .eq('user_id', user.id)
          .limit(1)
          .maybeSingle();

        if (profileData) {
          setIdentityProfile({
            full_name: profileData.full_name,
            email: profileData.email,
            region: profileData.region || '',
            address: profileData.address || '',
          });
          setProfileId(profileData.id);
        }
      }

      const requestMap = new Map((requestData || []).map(r => [r.broker_id, r]));

      const mergedBrokers: BrokerEntry[] = (brokerData || []).map(b => ({
        id: b.id,
        name: b.name,
        domain: b.domain,
        removal_url: b.removal_url,
        risk_level: b.risk_level,
        category: b.category,
        description: b.description,
        status: requestMap.get(b.id)?.status || 'not_started',
      }));

      // Sort: critical first, then high, medium, low
      const riskOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
      mergedBrokers.sort((a, b) => (riskOrder[a.risk_level] ?? 4) - (riskOrder[b.risk_level] ?? 4));

      setBrokers(mergedBrokers);
      setRemovalRequests(requestData || []);
    } catch (err) {
      console.error('Failed to load privacy center data:', err);
    } finally {
      setLoading(false);
    }
  }, [scanId]);

  useEffect(() => {
    if (!isFree && !tierLoading) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [isFree, tierLoading, loadData]);

  const handleSaveProfile = async (profile: IdentityProfile) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (profileId) {
      await supabase
        .from('user_identity_profiles')
        .update({
          full_name: profile.full_name,
          email: profile.email,
          region: profile.region || null,
          address: profile.address || null,
        })
        .eq('id', profileId);
    } else {
      const { data } = await supabase
        .from('user_identity_profiles')
        .insert({
          user_id: user.id,
          full_name: profile.full_name,
          email: profile.email,
          region: profile.region || null,
          address: profile.address || null,
        })
        .select('id')
        .single();
      if (data) setProfileId(data.id);
    }
    setIdentityProfile(profile);
  };

  const handleMarkSubmitted = async (brokerId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const broker = brokers.find(b => b.id === brokerId);
    if (!broker) return;

    // Check if a removal request already exists
    const existing = removalRequests.find(r => r.broker_id === brokerId);

    if (existing) {
      await supabase
        .from('removal_requests')
        .update({ status: 'submitted' as any, submitted_at: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('removal_requests')
        .insert([{
          user_id: user.id,
          scan_id: scanId,
          broker_id: brokerId,
          source_type: 'data_broker',
          source_id: brokerId,
          source_name: broker.name,
          status: 'submitted' as any,
          submitted_at: new Date().toISOString(),
          identity_profile_id: profileId,
        }]);
    }

    await loadData();
  };

  if (tierLoading || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isFree) {
    return <LockedPrivacyCenter />;
  }

  const activeRequests = removalRequests.filter(r => r.status !== 'not_started');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Shield className="h-5 w-5 text-primary" />
        <h3 className="text-base font-semibold">Privacy Center</h3>
        <span className="text-xs text-muted-foreground">Guided removal toolkit</span>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        Review data brokers that may hold your information. Use the guided workflow to generate GDPR/CCPA removal requests and track their progress. This is a manual, guided process — no automated submissions are made on your behalf.
      </p>

      <BrokerExposureSummary
        brokers={brokers}
        onStartRemoval={(broker) => {
          setSelectedBroker(broker);
          setModalOpen(true);
        }}
      />

      {activeRequests.length > 0 && (
        <RemovalTracker requests={activeRequests} />
      )}

      <RemovalWorkflowModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        broker={selectedBroker}
        existingProfile={identityProfile}
        onSaveProfile={handleSaveProfile}
        onMarkSubmitted={handleMarkSubmitted}
      />
    </div>
  );
}

export default PrivacyCenterTab;
