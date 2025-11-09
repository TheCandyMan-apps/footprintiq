import { vi } from 'vitest';

export const mockApifyClient = {
  actor: vi.fn(() => ({
    call: vi.fn().mockResolvedValue({
      id: 'mock-run-id',
      status: 'SUCCEEDED',
      output: {
        body: {
          profiles: [
            {
              username: 'testuser',
              platform: 'twitter',
              url: 'https://twitter.com/testuser',
              followers: 1000,
              verified: true,
            },
          ],
        },
      },
    }),
    lastRun: vi.fn(() => ({
      dataset: vi.fn(() => ({
        listItems: vi.fn().mockResolvedValue({
          items: [
            {
              username: 'testuser',
              platform: 'instagram',
              followers: 5000,
            },
          ],
        }),
      })),
    })),
  })),
  dataset: vi.fn(() => ({
    listItems: vi.fn().mockResolvedValue({
      items: [],
    }),
  })),
};

export const mockApifyTimeout = {
  actor: vi.fn(() => ({
    call: vi.fn().mockImplementation(() =>
      Promise.race([
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Apify timeout')), 30000)
        ),
      ])
    ),
  })),
};

export const mockApifyEmpty = {
  actor: vi.fn(() => ({
    call: vi.fn().mockResolvedValue({
      id: 'mock-run-id',
      status: 'SUCCEEDED',
      output: {
        body: {
          profiles: [],
        },
      },
    }),
    lastRun: vi.fn(() => ({
      dataset: vi.fn(() => ({
        listItems: vi.fn().mockResolvedValue({
          items: [],
        }),
      })),
    })),
  })),
};

export const mockApifyError = {
  actor: vi.fn(() => ({
    call: vi.fn().mockRejectedValue(new Error('Apify API error')),
  })),
};

export const mockApifyRateLimited = {
  actor: vi.fn(() => ({
    call: vi.fn().mockRejectedValue({
      statusCode: 429,
      message: 'Rate limit exceeded',
      type: 'rate-limit-exceeded',
    }),
  })),
};
