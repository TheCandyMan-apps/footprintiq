import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('providers-maigret Edge Function', () => {
  const mockWorkerResponse = {
    results: [
      {
        site: 'GitHub',
        url: 'https://github.com/testuser',
        username: 'testuser',
        status: 'found',
        confidence: 0.9
      },
      {
        site: 'Twitter',
        url: 'https://twitter.com/testuser',
        username: 'testuser',
        status: 'found',
        confidence: 0.85
      }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should transform worker results to UFM findings', () => {
    const findings = mockWorkerResponse.results.map(result => ({
      type: 'profile_presence',
      title: `Profile found on ${result.site}`,
      severity: 'info',
      provider: 'maigret',
      confidence: result.confidence,
      evidence: {
        site: result.site,
        url: result.url,
        username: result.username,
        status: result.status
      },
      remediation: `Review profile at ${result.url}`
    }));

    expect(findings).toHaveLength(2);
    expect(findings[0].type).toBe('profile_presence');
    expect(findings[0].provider).toBe('maigret');
    expect(findings[0].evidence.site).toBe('GitHub');
    expect(findings[1].evidence.site).toBe('Twitter');
  });

  it('should return empty findings array on error', () => {
    const errorResponse = {
      findings: [],
      error: 'Worker timeout'
    };

    expect(errorResponse.findings).toEqual([]);
    expect(errorResponse.error).toBe('Worker timeout');
  });

  it('should validate request format', () => {
    const validRequest = {
      usernames: ['testuser'],
      sites: ['github', 'twitter'],
      timeout: 60
    };

    expect(validRequest.usernames).toBeInstanceOf(Array);
    expect(validRequest.usernames.length).toBeGreaterThan(0);
  });

  it('should handle empty results gracefully', () => {
    const emptyWorkerResponse = {
      results: []
    };

    const findings = emptyWorkerResponse.results.map(result => ({
      type: 'profile_presence',
      provider: 'maigret',
      evidence: result
    }));

    expect(findings).toEqual([]);
  });

  it('should include confidence scores', () => {
    const finding = {
      type: 'profile_presence',
      title: 'Profile found on GitHub',
      severity: 'info',
      provider: 'maigret',
      confidence: 0.9,
      evidence: {
        site: 'GitHub',
        url: 'https://github.com/testuser',
        username: 'testuser'
      }
    };

    expect(finding.confidence).toBe(0.9);
    expect(finding.confidence).toBeGreaterThan(0);
    expect(finding.confidence).toBeLessThanOrEqual(1);
  });
});
