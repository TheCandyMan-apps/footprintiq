import type { Finding } from "../ufm";
import { generateFindingId } from "../ufm";

/**
 * Phone-specific finding kinds for UFM
 */
export type PhoneFindingKind =
  | 'phone_presence'
  | 'carrier_intel'
  | 'messaging_presence'
  | 'risk_signal'
  | 'broker_flag';

export interface PhoneFinding {
  kind: PhoneFindingKind;
  value: string; // E.164 phone number
  provider: string;
  confidence: number; // 0.0 - 1.0
  severity?: 'info' | 'warning' | 'risk';
  evidence: {
    source?: string;
    description?: string;
    url?: string;
    [key: string]: unknown;
  };
}

/**
 * Carrier intelligence data structure
 */
export interface CarrierIntelData {
  lineType: 'mobile' | 'landline' | 'voip' | 'unknown';
  carrier?: string;
  country?: string;
  countryCode?: string;
  numberingPlan?: string;
  isDisposable?: boolean;
  isVoip?: boolean;
  isPrepaid?: boolean;
}

/**
 * Messaging presence data structure
 */
export interface MessagingPresenceData {
  whatsapp?: boolean;
  telegram?: boolean;
  signal?: boolean;
  viber?: boolean;
}

/**
 * Risk signal data structure
 */
export interface RiskSignalData {
  fraudScore?: number;
  spamScore?: number;
  isSpammer?: boolean;
  isScam?: boolean;
  isBurner?: boolean;
  recentAbuse?: boolean;
  leaked?: boolean;
}

/**
 * Normalize carrier intelligence to UFM Finding
 */
export function normalizeCarrierIntel(
  phone: string,
  data: CarrierIntelData,
  provider: string
): Finding {
  const severity = data.isDisposable || data.isVoip ? 'low' : 'info';
  
  return {
    id: generateFindingId(provider, 'carrier_intel', phone),
    type: 'phone_intelligence' as const,
    title: `Carrier: ${data.carrier || 'Unknown'} (${data.lineType})`,
    description: `Phone number is a ${data.lineType} line${data.carrier ? ` on ${data.carrier}` : ''} in ${data.country || 'unknown country'}.`,
    severity,
    confidence: 0.85,
    provider,
    providerCategory: 'Carrier Intelligence',
    evidence: [
      { key: 'Phone', value: phone },
      { key: 'Line Type', value: data.lineType },
      { key: 'Carrier', value: data.carrier || 'Unknown' },
      { key: 'Country', value: data.country || 'Unknown' },
      { key: 'Country Code', value: data.countryCode || 'Unknown' },
      { key: 'Is VoIP', value: String(data.isVoip ?? false) },
      { key: 'Is Disposable', value: String(data.isDisposable ?? false) },
      { key: 'Is Prepaid', value: String(data.isPrepaid ?? false) },
    ],
    impact: data.isDisposable 
      ? 'Disposable/temporary number may indicate privacy-conscious or fraudulent usage'
      : 'Phone number carrier and type identified for verification',
    remediation: data.isDisposable 
      ? ['Verify identity through additional channels', 'Request alternative contact method']
      : [],
    tags: ['phone', 'carrier', data.lineType],
    observedAt: new Date().toISOString(),
  };
}

/**
 * Normalize messaging presence to UFM Finding
 */
export function normalizeMessagingPresence(
  phone: string,
  data: MessagingPresenceData,
  provider: string
): Finding {
  const platforms: string[] = [];
  if (data.whatsapp) platforms.push('WhatsApp');
  if (data.telegram) platforms.push('Telegram');
  if (data.signal) platforms.push('Signal');
  if (data.viber) platforms.push('Viber');

  const hasPresence = platforms.length > 0;

  return {
    id: generateFindingId(provider, 'messaging_presence', phone),
    type: 'phone_intelligence' as const,
    title: hasPresence 
      ? `Messaging: ${platforms.join(', ')}`
      : 'No Messaging Presence Detected',
    description: hasPresence
      ? `Phone number is registered on ${platforms.length} messaging platform(s): ${platforms.join(', ')}.`
      : 'Phone number not found on common messaging platforms.',
    severity: 'info',
    confidence: hasPresence ? 0.9 : 0.7,
    provider,
    providerCategory: 'Messaging Presence',
    evidence: [
      { key: 'Phone', value: phone },
      { key: 'WhatsApp', value: String(data.whatsapp ?? false) },
      { key: 'Telegram', value: String(data.telegram ?? false) },
      { key: 'Signal', value: String(data.signal ?? false) },
      { key: 'Platforms Found', value: String(platforms.length) },
    ],
    impact: hasPresence 
      ? 'Phone number actively used for messaging - owner likely reachable'
      : 'Phone number may be inactive or privacy-protected',
    remediation: [],
    tags: ['phone', 'messaging', ...platforms.map(p => p.toLowerCase())],
    observedAt: new Date().toISOString(),
  };
}

/**
 * Normalize risk signals to UFM Finding
 */
export function normalizeRiskSignal(
  phone: string,
  data: RiskSignalData,
  provider: string
): Finding {
  const riskFactors: string[] = [];
  if (data.isSpammer) riskFactors.push('Known Spammer');
  if (data.isScam) riskFactors.push('Scam Associated');
  if (data.isBurner) riskFactors.push('Burner/Disposable');
  if (data.recentAbuse) riskFactors.push('Recent Abuse');
  if (data.leaked) riskFactors.push('Found in Data Leak');

  const severity = data.fraudScore && data.fraudScore > 75 
    ? 'high' 
    : riskFactors.length > 0 
      ? 'medium' 
      : 'low';

  return {
    id: generateFindingId(provider, 'risk_signal', phone),
    type: 'phone_intelligence' as const,
    title: riskFactors.length > 0 
      ? `Risk: ${riskFactors.slice(0, 2).join(', ')}${riskFactors.length > 2 ? '...' : ''}`
      : 'Low Risk Phone Number',
    description: riskFactors.length > 0
      ? `Phone number has ${riskFactors.length} risk indicator(s): ${riskFactors.join(', ')}.`
      : 'Phone number shows no significant risk indicators.',
    severity,
    confidence: data.fraudScore ? 0.8 : 0.65,
    provider,
    providerCategory: 'Risk Intelligence',
    evidence: [
      { key: 'Phone', value: phone },
      { key: 'Fraud Score', value: String(data.fraudScore ?? 'N/A') },
      { key: 'Spam Score', value: String(data.spamScore ?? 'N/A') },
      { key: 'Is Spammer', value: String(data.isSpammer ?? false) },
      { key: 'Is Scam', value: String(data.isScam ?? false) },
      { key: 'Is Burner', value: String(data.isBurner ?? false) },
      { key: 'Recent Abuse', value: String(data.recentAbuse ?? false) },
      { key: 'Leaked', value: String(data.leaked ?? false) },
      { key: 'Risk Factors', value: String(riskFactors.length) },
    ],
    impact: severity === 'high'
      ? 'High-risk phone number - proceed with caution in any interaction'
      : severity === 'medium'
        ? 'Phone number has some risk indicators - verify through additional channels'
        : 'Phone number appears low-risk based on available intelligence',
    remediation: severity !== 'low' ? [
      'Enable additional verification for communications',
      'Do not share sensitive information via this number',
      'Consider alternative contact methods',
    ] : [],
    tags: ['phone', 'risk', ...riskFactors.map(r => r.toLowerCase().replace(/\s+/g, '-'))],
    observedAt: new Date().toISOString(),
  };
}

/**
 * Normalize phone presence (public OSINT mentions)
 */
export function normalizePhonePresence(
  phone: string,
  source: string,
  url: string | undefined,
  description: string,
  provider: string
): Finding {
  return {
    id: generateFindingId(provider, 'phone_presence', `${phone}_${source}`),
    type: 'phone_intelligence' as const,
    title: `Found on ${source}`,
    description,
    severity: 'info',
    confidence: 0.75,
    provider,
    providerCategory: 'Phone OSINT',
    evidence: [
      { key: 'Phone', value: phone },
      { key: 'Source', value: source },
      { key: 'URL', value: url || 'N/A' },
    ],
    impact: 'Phone number publicly accessible - may be used for identity verification or social engineering',
    remediation: [
      'Consider removing number from public listings if possible',
      'Monitor for unsolicited contact',
    ],
    tags: ['phone', 'osint', 'public-exposure'],
    observedAt: new Date().toISOString(),
    url,
  };
}

/**
 * Normalize data broker flag
 */
export function normalizeBrokerFlag(
  phone: string,
  broker: string,
  dataTypes: string[],
  provider: string
): Finding {
  return {
    id: generateFindingId(provider, 'broker_flag', `${phone}_${broker}`),
    type: 'phone_intelligence' as const,
    title: `Listed on ${broker}`,
    description: `Phone number found in ${broker} database with associated data: ${dataTypes.join(', ')}.`,
    severity: 'medium',
    confidence: 0.8,
    provider,
    providerCategory: 'Data Broker',
    evidence: [
      { key: 'Phone', value: phone },
      { key: 'Broker', value: broker },
      { key: 'Data Types', value: dataTypes.join(', ') },
    ],
    impact: 'Phone number listed with data broker - personal information may be commercially available',
    remediation: [
      `Submit opt-out request to ${broker}`,
      'Monitor other data broker listings',
      'Consider using privacy services',
    ],
    tags: ['phone', 'data-broker', broker.toLowerCase().replace(/\s+/g, '-')],
    observedAt: new Date().toISOString(),
  };
}

/**
 * Aggregate multiple phone findings into a summary
 */
export function createPhoneSummary(findings: Finding[]): {
  totalFindings: number;
  riskLevel: 'low' | 'medium' | 'high';
  hasMessaging: boolean;
  lineType: string;
  carrierKnown: boolean;
  brokerCount: number;
  riskSignals: number;
} {
  const riskFindings = findings.filter(f => 
    f.severity === 'high' || f.severity === 'medium' || f.severity === 'critical'
  );
  
  const messagingFinding = findings.find(f => 
    f.providerCategory === 'Messaging Presence'
  );
  
  const carrierFinding = findings.find(f => 
    f.providerCategory === 'Carrier Intelligence'
  );
  
  const brokerFindings = findings.filter(f => 
    f.providerCategory === 'Data Broker'
  );

  const riskLevel = riskFindings.length > 2 ? 'high' 
    : riskFindings.length > 0 ? 'medium' 
    : 'low';

  return {
    totalFindings: findings.length,
    riskLevel,
    hasMessaging: messagingFinding?.evidence?.some(e => e.value === 'true') ?? false,
    lineType: carrierFinding?.evidence?.find(e => e.key === 'Line Type')?.value as string || 'unknown',
    carrierKnown: !!carrierFinding?.evidence?.find(e => e.key === 'Carrier' && e.value !== 'Unknown'),
    brokerCount: brokerFindings.length,
    riskSignals: riskFindings.length,
  };
}
