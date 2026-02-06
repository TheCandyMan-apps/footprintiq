import { useMemo } from 'react';
import { ScanResult } from '@/hooks/useScanResultsData';

interface LensScore {
  score: number;
  reasoning: string;
}

interface LensAnalysis {
  overallScore: number;
  highConfidence: number;
  moderateConfidence: number;
  lowConfidence: number;
  resultScores: Map<string, LensScore>;
}

/**
 * Calculate LENS (Layered Entity & Network Scoring) confidence for scan results.
 * This analyzes findings based on:
 * - Status certainty (found > claimed > not_found)
 * - URL presence and validity
 * - Provider/source reliability
 * - Cross-validation with other findings
 */
export function useLensAnalysis(results: ScanResult[]): LensAnalysis {
  return useMemo(() => {
    const resultScores = new Map<string, LensScore>();
    let totalScore = 0;
    let highConfidence = 0;
    let moderateConfidence = 0;
    let lowConfidence = 0;

    // Known high-reliability platforms
    const highReliabilityPlatforms = new Set([
      'github', 'linkedin', 'twitter', 'x', 'facebook', 'instagram', 
      'reddit', 'youtube', 'tiktok', 'pinterest', 'stackoverflow',
      'medium', 'dev.to', 'behance', 'dribbble', 'gitlab'
    ]);

    // Platforms with higher false-positive rates
    const lowReliabilityPlatforms = new Set([
      'fanfiction', 'wattpad', 'amino', 'quotev', 'bitbucket',
      'soundcloud', 'bandcamp', 'mixcloud'
    ]);

    // Helper to derive status from result data
    const deriveStatus = (result: ScanResult): string => {
      if (result.status) return result.status.toLowerCase();
      
      const kind = (result as any).kind || '';
      if (kind === 'profile_presence' || kind === 'presence.hit' || kind === 'account_found') {
        return 'found';
      }
      if (kind === 'presence.miss' || kind === 'not_found') {
        return 'not_found';
      }
      
      const meta = (result.meta || result.metadata || {}) as Record<string, any>;
      if (meta.status) return meta.status.toLowerCase();
      if (meta.exists === true) return 'found';
      if (meta.exists === false) return 'not_found';
      
      return 'unknown';
    };

    results.forEach((result) => {
      let score = 50; // Base score
      const reasons: string[] = [];

      // Status-based scoring - derive from kind field if no explicit status
      const status = deriveStatus(result);
      if (status === 'found') {
        score += 25;
        reasons.push('Profile found and accessible');
      } else if (status === 'claimed') {
        score += 15;
        reasons.push('Username claimed but profile not verified');
      } else if (status === 'not_found') {
        score += 5;
        reasons.push('Profile not found on platform');
      }

      // URL presence and quality
      if (result.url) {
        score += 10;
        reasons.push('Direct URL available');
        
        // Check for HTTPS
        if (result.url.startsWith('https://')) {
          score += 5;
        }
      } else {
        score -= 10;
        reasons.push('No direct URL provided');
      }

      // Platform reliability
      const platformLower = result.site?.toLowerCase() || '';
      if (highReliabilityPlatforms.has(platformLower)) {
        score += 10;
        reasons.push(`${result.site} is a high-reliability platform`);
      } else if (lowReliabilityPlatforms.has(platformLower)) {
        score -= 10;
        reasons.push(`${result.site} has higher false-positive rates`);
      }

      // Metadata presence (if available) - check with type safety
      const meta = result.meta as Record<string, any> | undefined;
      if (meta) {
        if (meta.avatar_url || meta.profile_image) {
          score += 5;
          reasons.push('Profile image detected');
        }
        if (meta.bio || meta.description) {
          score += 5;
          reasons.push('Profile bio/description present');
        }
        if (meta.followers || meta.connections) {
          score += 5;
          reasons.push('Social metrics available');
        }
      }

      // Brave Search web-index corroboration signal
      // Check if this result has been verified by independent web index
      const kind = (result as any).kind || '';
      if (kind === 'web_index.hit') {
        score += 12;
        reasons.push('Profile verified in independent web index');
      } else if (kind === 'web_index.result') {
        // Individual search results get a smaller boost
        score += 5;
        reasons.push('Found in web search results');
      }

      // Cap score at 0-100
      score = Math.max(0, Math.min(100, score));
      
      // Categorize
      if (score >= 80) highConfidence++;
      else if (score >= 60) moderateConfidence++;
      else lowConfidence++;

      totalScore += score;

      resultScores.set(result.id, {
        score,
        reasoning: reasons.slice(0, 3).join('. ') + '.'
      });
    });

    const overallScore = results.length > 0 
      ? Math.round(totalScore / results.length) 
      : 0;

    return {
      overallScore,
      highConfidence,
      moderateConfidence,
      lowConfidence,
      resultScores
    };
  }, [results]);
}

export default useLensAnalysis;
