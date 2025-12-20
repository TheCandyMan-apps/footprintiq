import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PhoneProviderStatuses {
  success: number;
  failed: number;
  skipped: number;
  notConfigured: number;
  tierRestricted: number;
  limitExceeded: number;
  total: number;
}

// Phone provider IDs to filter from scan_events
const PHONE_PROVIDER_IDS = new Set([
  'abstract_phone',
  'numverify', 
  'ipqs_phone',
  'twilio_lookup',
  'whatsapp_check',
  'telegram_check',
  'signal_check',
  'phone_osint',
  'truecaller',
  'phone_reputation',
  'callerhint',
  // Legacy names that might appear
  'phone-intel',
  'phone_intel',
]);

export function usePhoneProviderStatuses(scanId: string | undefined) {
  const [statuses, setStatuses] = useState<PhoneProviderStatuses>({
    success: 0,
    failed: 0,
    skipped: 0,
    notConfigured: 0,
    tierRestricted: 0,
    limitExceeded: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!scanId) {
      setLoading(false);
      return;
    }

    const fetchStatuses = async () => {
      try {
        const { data: events, error } = await supabase
          .from('scan_events')
          .select('provider, stage, status, error_message')
          .eq('scan_id', scanId);

        if (error) {
          console.error('[usePhoneProviderStatuses] Error fetching events:', error);
          setLoading(false);
          return;
        }

        const counts: PhoneProviderStatuses = {
          success: 0,
          failed: 0,
          skipped: 0,
          notConfigured: 0,
          tierRestricted: 0,
          limitExceeded: 0,
          total: 0,
        };

        // Track unique providers to avoid double-counting
        const seenProviders = new Map<string, string>();

        events?.forEach(event => {
          const provider = event.provider?.toLowerCase() || '';
          
          // Only process phone-related providers
          if (!PHONE_PROVIDER_IDS.has(provider) && !provider.includes('phone')) {
            return;
          }

          // Use the most recent/final status for each provider
          const status = event.status?.toLowerCase() || event.stage?.toLowerCase() || '';
          
          // Skip if we've already seen a terminal status for this provider
          const existingStatus = seenProviders.get(provider);
          if (existingStatus && ['success', 'completed'].includes(existingStatus)) {
            return;
          }
          
          seenProviders.set(provider, status);
        });

        // Count final statuses
        seenProviders.forEach((status) => {
          counts.total++;
          
          if (status === 'success' || status === 'completed') {
            counts.success++;
          } else if (status === 'not_configured') {
            counts.notConfigured++;
          } else if (status === 'tier_restricted') {
            counts.tierRestricted++;
          } else if (status === 'limit_exceeded') {
            counts.limitExceeded++;
          } else if (status === 'skipped') {
            counts.skipped++;
          } else if (status === 'failed' || status === 'error') {
            counts.failed++;
          }
        });

        setStatuses(counts);
      } catch (err) {
        console.error('[usePhoneProviderStatuses] Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatuses();
  }, [scanId]);

  return { statuses, loading };
}
