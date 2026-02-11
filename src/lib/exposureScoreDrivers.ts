import type { ScanResultRow } from '@/hooks/useRealtimeResults';

export interface ExposureDriver {
  label: string;
  category: string;
}

/**
 * Generate human-readable exposure drivers from scan result rows.
 * Uses only existing data — no invented signals.
 */
export function generateExposureDrivers(rows: ScanResultRow[]): ExposureDriver[] {
  if (!rows || rows.length === 0) {
    return [{
      label: 'No public exposure signals detected from available sources.',
      category: 'none',
    }];
  }

  const drivers: ExposureDriver[] = [];

  // 1. Count profiles found
  const profileRows = rows.filter(
    r => r.kind === 'profile_presence' && r.status === 'found'
  );
  if (profileRows.length > 0) {
    const platforms = [...new Set(profileRows.map(r => r.site).filter(Boolean))];
    const preview = platforms.slice(0, 3).join(', ');
    const suffix = platforms.length > 3 ? ` and ${platforms.length - 3} more` : '';
    drivers.push({
      label: `Active profiles found on ${profileRows.length} platform${profileRows.length !== 1 ? 's' : ''} (${preview}${suffix})`,
      category: 'public_profiles',
    });
  }

  // 2. Breach associations
  const breachKeywords = ['breach', 'hibp', 'leak', 'pwned', 'compromised', 'exposure'];
  const noBreachPatterns = ['breach.none', 'no_breach', 'not found', 'clean'];
  const breachRows = rows.filter(r => {
    const kind = (r.kind || '').toLowerCase();
    if (noBreachPatterns.some(p => kind.includes(p))) return false;
    const provider = (r.provider || '').toLowerCase();
    return breachKeywords.some(k => kind.includes(k) || provider.includes(k));
  });
  if (breachRows.length > 0) {
    drivers.push({
      label: `Associated with ${breachRows.length} known data breach${breachRows.length !== 1 ? 'es' : ''}`,
      category: 'breach_association',
    });
  }

  // 3. High-severity findings
  const highSeverity = rows.filter(
    r => r.severity === 'high' || r.severity === 'critical'
  );
  if (highSeverity.length > 0) {
    drivers.push({
      label: `${highSeverity.length} high-severity signal${highSeverity.length !== 1 ? 's' : ''} requiring attention`,
      category: 'high_risk',
    });
  }

  // 4. Cross-platform identifier reuse
  const uniqueProviders = new Set(
    profileRows.map(r => r.provider).filter(Boolean)
  );
  if (uniqueProviders.size >= 3) {
    drivers.push({
      label: `Identifier reused across ${uniqueProviders.size} independent sources`,
      category: 'identifier_reuse',
    });
  }

  // 5. Metadata / infrastructure signals
  const metaKinds = ['ip_exposure', 'domain_reputation', 'dns_history', 'domain_tech'];
  const metaRows = rows.filter(r => metaKinds.includes(r.kind));
  if (metaRows.length > 0) {
    drivers.push({
      label: `${metaRows.length} infrastructure or metadata signal${metaRows.length !== 1 ? 's' : ''} detected`,
      category: 'metadata_signals',
    });
  }

  // 6. Phone intelligence
  const phoneRows = rows.filter(r => r.kind === 'phone_intelligence' || (r.provider || '').toLowerCase().includes('phone'));
  if (phoneRows.length > 0) {
    drivers.push({
      label: 'Phone number linked to public data sources',
      category: 'data_broker',
    });
  }

  // Fallback if nothing matched
  if (drivers.length === 0) {
    drivers.push({
      label: 'Minimal public exposure detected across scanned sources.',
      category: 'low',
    });
  }

  return drivers;
}
