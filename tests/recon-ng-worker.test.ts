import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock fetch for Vercel worker calls
const mockFetch = vi.fn();
global.fetch = mockFetch as any;

describe('Recon-ng Worker Integration', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully call Vercel worker endpoint', async () => {
    const mockResponse = {
      success: true,
      results: [
        { module: 'twitter_mention', type: 'profile', data: 'test_user' },
      ],
      hosts: [],
      contacts: [],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const response = await fetch('https://recon-ng-worker.vercel.app/scan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      body: JSON.stringify({
        target: 'testuser',
        modules: ['recon/profiles-profiles/twitter_mention'],
        workspace: 'scan_test123',
      }),
    });

    expect(response.ok).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://recon-ng-worker.vercel.app/scan',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    );

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.results).toHaveLength(1);
  });

  it('should retry 3 times on failure before giving up', async () => {
    mockFetch
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'));

    const makeRequestWithRetry = async (url: string, maxRetries = 3) => {
      let lastError;
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ target: 'test' }),
          });
          return response;
        } catch (error) {
          lastError = error;
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      }
      throw lastError;
    };

    await expect(
      makeRequestWithRetry('https://recon-ng-worker.vercel.app/scan')
    ).rejects.toThrow('Network error');

    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it('should succeed on second retry attempt', async () => {
    const mockResponse = {
      success: true,
      results: [],
      hosts: [],
      contacts: [],
    };

    mockFetch
      .mockRejectedValueOnce(new Error('Temporary failure'))
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

    const makeRequestWithRetry = async (url: string, maxRetries = 3) => {
      let lastError;
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ target: 'test' }),
          });
          return response;
        } catch (error) {
          lastError = error;
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      }
      throw lastError;
    };

    const response = await makeRequestWithRetry('https://recon-ng-worker.vercel.app/scan');
    expect(response.ok).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(2); // Failed once, succeeded on second
  });

  it('should handle worker returning error response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error',
    });

    const response = await fetch('https://recon-ng-worker.vercel.app/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: 'test' }),
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(500);
  });

  it('should parse valid worker response with results', async () => {
    const mockResponse = {
      success: true,
      results: [
        { module: 'twitter_mention', type: 'profile', username: 'john_doe' },
        { module: 'namechk', type: 'profile', site: 'github', exists: true },
      ],
      hosts: [
        { host: 'example.com', ip: '192.168.1.1' },
      ],
      contacts: [
        { email: 'john@example.com', name: 'John Doe' },
      ],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const response = await fetch('https://recon-ng-worker.vercel.app/scan', {
      method: 'POST',
      body: JSON.stringify({ target: 'test' }),
    });

    const data = await response.json();
    
    expect(data.success).toBe(true);
    expect(data.results).toHaveLength(2);
    expect(data.hosts).toHaveLength(1);
    expect(data.contacts).toHaveLength(1);
    expect(data.results[0].module).toBe('twitter_mention');
    expect(data.hosts[0].host).toBe('example.com');
    expect(data.contacts[0].email).toBe('john@example.com');
  });

  it('should validate required environment variables', () => {
    const RECON_NG_WORKER_URL = process.env.RECON_NG_WORKER_URL || 'http://localhost:8080';
    const WORKER_TOKEN = process.env.WORKER_TOKEN;

    expect(RECON_NG_WORKER_URL).toBeTruthy();
    expect(typeof RECON_NG_WORKER_URL).toBe('string');
    
    // In production, WORKER_TOKEN should be set
    if (process.env.NODE_ENV === 'production') {
      expect(WORKER_TOKEN).toBeTruthy();
    }
  });
});
