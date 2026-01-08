/**
 * Provider icon mapping for all OSINT providers
 */

import { 
  Search, 
  Eye, 
  Globe, 
  Database, 
  Shield, 
  Code, 
  Activity,
  Zap,
  type LucideIcon 
} from 'lucide-react';

export const PROVIDER_ICONS: Record<string, LucideIcon> = {
  'maigret': Search,
  'sherlock': Eye,
  'gosearch': Globe,
  'apify': Database,
  'apify-social': Database,
  'apify-osint': Database,
  'apify-darkweb': Database,
  'pipl': Shield,
  'hibp': Shield,
  'dehashed': Code,
  'intelx': Code,
  'hunter': Search,
  'fullhunt': Activity,
  'osint-worker': Zap,
  'default': Search,
};

export function getProviderIcon(provider: string): LucideIcon {
  return PROVIDER_ICONS[(provider || '').toLowerCase()] || PROVIDER_ICONS.default;
}
