/**
 * Scan Type Metadata
 * Single source of truth for scan type information, help tips, accepted formats,
 * and worker mappings for the Advanced Scan UI.
 */

import { type ScanType, getProvidersForScanType } from '@/lib/providers/registry';

export interface ScanTypeMeta {
  id: ScanType;
  label: string;
  description: string;
  acceptedFormats: string[];
  normalisationInfo?: string;
  privacyNotice?: string;
  /** Worker names for WorkerStatusBanner (empty = uses API providers only) */
  workerNames: string[];
  /** Placeholder text for input */
  placeholder: string;
}

export const SCAN_TYPE_META: Record<ScanType, ScanTypeMeta> = {
  username: {
    id: 'username',
    label: 'Username',
    description: 'Search across 500+ platforms for matching usernames including social media, forums, and gaming sites.',
    acceptedFormats: ['john_doe', 'johndoe123', 'JohnDoe'],
    placeholder: 'Enter username (e.g., john_doe)',
    workerNames: ['maigret', 'sherlock', 'gosearch'],
  },
  email: {
    id: 'email',
    label: 'Email Address',
    description: 'Check for data breaches, account registrations, and digital exposure.',
    acceptedFormats: ['user@example.com', 'name+alias@domain.co.uk'],
    placeholder: 'Enter email address',
    workerNames: ['holehe'],
  },
  phone: {
    id: 'phone',
    label: 'Phone Number',
    description: 'Carrier intel, messaging app presence, risk signals, and public mentions.',
    acceptedFormats: ['+447700900123', '07700 900123', '+1 555 123 4567'],
    normalisationInfo: 'Automatically normalised to E.164 format for accurate results.',
    placeholder: 'Enter phone number (e.g., +447700900123)',
    workerNames: [], // Phone uses API providers, not workers
  },
  domain: {
    id: 'domain',
    label: 'Domain',
    description: 'DNS records, SSL certificates, threat intelligence, and security analysis.',
    acceptedFormats: ['example.com', 'subdomain.example.com'],
    placeholder: 'Enter domain (e.g., example.com)',
    workerNames: ['urlscan', 'virustotal'],
  },
};

/**
 * Get metadata for a scan type
 */
export function getScanTypeMeta(scanType: ScanType): ScanTypeMeta {
  return SCAN_TYPE_META[scanType];
}

/**
 * Get worker names for a scan type (for WorkerStatusBanner)
 */
export function getWorkersForScanType(scanType: ScanType): string[] {
  return SCAN_TYPE_META[scanType]?.workerNames || [];
}

/**
 * Check if a scan type uses workers (vs API providers only)
 */
export function scanTypeUsesWorkers(scanType: ScanType): boolean {
  return getWorkersForScanType(scanType).length > 0;
}

/**
 * Get provider count for a scan type
 */
export function getProviderCountForScanType(scanType: ScanType): number {
  return getProvidersForScanType(scanType).length;
}
