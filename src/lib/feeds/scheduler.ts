import { supabase } from '@/integrations/supabase/client';
import { collectOTXFeed, collectShodanFeed, collectGreyNoiseFeed, normalizeAndStoreIndicators } from './collector';

export interface FeedCollectionResult {
  feedName: string;
  success: boolean;
  recordsIngested: number;
  error?: string;
  duration: number;
}

export async function runFeedCollection(workspaceId: string): Promise<FeedCollectionResult[]> {
  const results: FeedCollectionResult[] = [];
  
  // Get enabled feed sources
  const { data: feedSources } = await supabase
    .from('feed_sources' as any)
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('is_enabled', true);
  
  if (!feedSources || feedSources.length === 0) {
    return results;
  }
  
  for (const feed of feedSources) {
    const startTime = Date.now();
    let indicators: any[] = [];
    let error: string | undefined;
    const feedData = feed as any;
    
    try {
      // Get API keys from environment (these should be configured in Supabase secrets)
      switch (feedData.feed_type) {
        case 'otx':
          const otxKey = localStorage.getItem('FEED_OTX_KEY');
          if (otxKey) {
            indicators = await collectOTXFeed(otxKey, workspaceId);
          }
          break;
          
        case 'shodan':
          const shodanKey = localStorage.getItem('FEED_SHODAN_KEY');
          if (shodanKey) {
            indicators = await collectShodanFeed(shodanKey);
          }
          break;
          
        case 'greynoise':
          const greynoiseKey = localStorage.getItem('FEED_GREYNOISE_KEY');
          if (greynoiseKey) {
            indicators = await collectGreyNoiseFeed(greynoiseKey);
          }
          break;
      }
      
      // Store indicators
      const stored = await normalizeAndStoreIndicators(
        workspaceId,
        indicators,
        feedData.name
      );
      
      // Update feed source stats
      await supabase
        .from('feed_sources' as any)
        .update({
          last_pull_at: new Date().toISOString(),
          last_success_at: new Date().toISOString(),
          total_pulls: feedData.total_pulls + 1,
          success_pulls: feedData.success_pulls + 1,
          records_ingested: feedData.records_ingested + stored,
          last_error: null,
        })
        .eq('id', feedData.id);
      
      results.push({
        feedName: feedData.name,
        success: true,
        recordsIngested: stored,
        duration: Date.now() - startTime,
      });
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error';
      
      // Update feed source with error
      await supabase
        .from('feed_sources' as any)
        .update({
          last_pull_at: new Date().toISOString(),
          total_pulls: feedData.total_pulls + 1,
          last_error: error,
        })
        .eq('id', feedData.id);
      
      results.push({
        feedName: feedData.name,
        success: false,
        recordsIngested: 0,
        error,
        duration: Date.now() - startTime,
      });
    }
  }
  
  return results;
}

export function scheduleFeedCollection(workspaceId: string, intervalMinutes: number = 60) {
  // Run immediately
  runFeedCollection(workspaceId);
  
  // Schedule periodic runs
  return setInterval(() => {
    runFeedCollection(workspaceId);
  }, intervalMinutes * 60 * 1000);
}
