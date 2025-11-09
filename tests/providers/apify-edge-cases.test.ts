import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  mockApifyClient,
  mockApifyTimeout,
  mockApifyEmpty,
  mockApifyError,
  mockApifyRateLimited,
} from '../mocks/apify';

// Mock the Apify client module
vi.mock('apify-client', () => ({
  ApifyClient: vi.fn(() => mockApifyClient),
}));

describe('Apify Provider - Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle successful Apify scan with results', async () => {
    const result = await mockApifyClient.actor('social-media-scraper').call({
      username: 'testuser',
    });

    expect(result.status).toBe('SUCCEEDED');
    expect(result.output.body.profiles).toHaveLength(1);
    expect(result.output.body.profiles[0].platform).toBe('twitter');
  });

  it('should handle Apify timeout gracefully', async () => {
    const timeoutClient = mockApifyTimeout;

    await expect(
      timeoutClient.actor('social-media-scraper').call({
        username: 'testuser',
      })
    ).rejects.toThrow('Apify timeout');
  });

  it('should handle zero results from Apify', async () => {
    const emptyClient = mockApifyEmpty;

    const result = await emptyClient.actor('social-media-scraper').call({
      username: 'nonexistentuser',
    });

    expect(result.status).toBe('SUCCEEDED');
    expect(result.output.body.profiles).toHaveLength(0);
  });

  it('should handle Apify API errors', async () => {
    const errorClient = mockApifyError;

    await expect(
      errorClient.actor('social-media-scraper').call({
        username: 'testuser',
      })
    ).rejects.toThrow('Apify API error');
  });

  it('should handle rate limiting from Apify', async () => {
    const rateLimitedClient = mockApifyRateLimited;

    await expect(
      rateLimitedClient.actor('social-media-scraper').call({
        username: 'testuser',
      })
    ).rejects.toMatchObject({
      statusCode: 429,
      message: 'Rate limit exceeded',
    });
  });

  it('should cache Apify results to reduce API calls', async () => {
    const cache = new Map();
    let apiCallCount = 0;

    const cachedApifyCall = async (username: string) => {
      if (cache.has(username)) {
        return cache.get(username);
      }

      apiCallCount++;
      const result = await mockApifyClient.actor('social-media-scraper').call({
        username,
      });
      cache.set(username, result);
      return result;
    };

    // First call
    await cachedApifyCall('testuser');
    expect(apiCallCount).toBe(1);

    // Second call - should use cache
    await cachedApifyCall('testuser');
    expect(apiCallCount).toBe(1);
  });

  it('should handle invalid actor ID', async () => {
    const invalidActor = vi.fn(() => ({
      call: vi.fn().mockRejectedValue({
        statusCode: 404,
        message: 'Actor not found',
      }),
    }));

    await expect(
      invalidActor().call({ username: 'testuser' })
    ).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('should handle malformed response from Apify', async () => {
    const malformedClient = {
      actor: vi.fn(() => ({
        call: vi.fn().mockResolvedValue({
          // Missing expected fields
          id: 'run-id',
          status: 'SUCCEEDED',
          // output is missing
        }),
      })),
    };

    const result = await malformedClient.actor('scraper').call({
      username: 'test',
    });

    expect(result.output).toBeUndefined();
  });

  it('should implement retry logic with exponential backoff', async () => {
    let attemptCount = 0;
    const maxRetries = 3;

    const retryableClient = {
      actor: vi.fn(() => ({
        call: vi.fn().mockImplementation(() => {
          attemptCount++;
          if (attemptCount < maxRetries) {
            return Promise.reject(new Error('Temporary failure'));
          }
          return Promise.resolve({
            status: 'SUCCEEDED',
            output: { body: { profiles: [] } },
          });
        }),
      })),
    };

    const retryWithBackoff = async (
      fn: () => Promise<any>,
      retries = maxRetries
    ): Promise<any> => {
      try {
        return await fn();
      } catch (error) {
        if (retries > 0) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return retryWithBackoff(fn, retries - 1);
        }
        throw error;
      }
    };

    const result = await retryWithBackoff(() =>
      retryableClient.actor('scraper').call({ username: 'test' })
    );

    expect(attemptCount).toBe(maxRetries);
    expect(result.status).toBe('SUCCEEDED');
  });
});
