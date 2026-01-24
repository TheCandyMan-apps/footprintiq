import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PlatformCatalogEntry {
  id: string;
  platform: string;
  category: string;
  icon_url: string | null;
  url_template: string | null;
}

/**
 * Hook to fetch and cache the platform catalog from the database.
 * The catalog maps platforms to categories for accurate categorization.
 * Caches for 1 hour since this data rarely changes.
 */
export function usePlatformCatalog() {
  return useQuery({
    queryKey: ['platform-catalog'],
    queryFn: async (): Promise<PlatformCatalogEntry[]> => {
      const { data, error } = await supabase
        .from('platform_catalog')
        .select('id, platform, category, icon_url, url_template');
      
      if (error) {
        console.error('[usePlatformCatalog] Error fetching catalog:', error);
        return [];
      }
      
      return (data || []) as PlatformCatalogEntry[];
    },
    staleTime: 1000 * 60 * 60, // 1 hour cache
    gcTime: 1000 * 60 * 60 * 2, // Keep in cache for 2 hours
  });
}

/**
 * Build a lookup map from platform name (lowercase) to category
 */
export function buildCategoryMap(catalog: PlatformCatalogEntry[] | undefined): Map<string, string> {
  const map = new Map<string, string>();
  if (!catalog) return map;
  
  catalog.forEach(entry => {
    // Store both original and lowercase for flexible matching
    map.set(entry.platform.toLowerCase(), entry.category);
  });
  
  return map;
}

/**
 * Get category for a platform, using catalog first, then fallback
 */
export function getCategoryFromCatalog(
  platform: string,
  catalogMap: Map<string, string>,
  fallbackFn?: (platform: string) => string
): string {
  if (!platform) return 'Other';
  
  const normalized = platform.toLowerCase().trim();
  
  // Try exact match first
  if (catalogMap.has(normalized)) {
    return catalogMap.get(normalized)!;
  }
  
  // Try partial match (for cases like "Steam Community" matching "Steam")
  for (const [key, category] of catalogMap.entries()) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return category;
    }
  }
  
  // Use fallback function if provided
  if (fallbackFn) {
    return fallbackFn(platform);
  }
  
  return 'Other';
}
