/**
 * Playwright mock setup utilities
 * Provides consistent mocking across all E2E tests
 */

import type { Page, Route } from '@playwright/test';

export interface MockResponse {
  status?: number;
  body: any;
  headers?: Record<string, string>;
}

/**
 * Mock Supabase authentication
 */
export async function mockAuth(page: Page, authenticated = true) {
  if (authenticated) {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'supabase.auth.token',
        JSON.stringify({
          currentSession: {
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token',
            user: {
              id: 'test-user-id',
              email: 'test@example.com',
              user_metadata: {},
            },
          },
        })
      );
    });
  }
}

/**
 * Mock Supabase database queries
 */
export async function mockDatabase(
  page: Page,
  table: string,
  response: MockResponse
) {
  await page.route(`**/rest/v1/${table}*`, (route: Route) => {
    route.fulfill({
      status: response.status || 200,
      body: JSON.stringify(response.body),
      headers: {
        'Content-Type': 'application/json',
        ...response.headers,
      },
    });
  });
}

/**
 * Mock Supabase Edge Functions
 */
export async function mockEdgeFunction(
  page: Page,
  functionName: string,
  response: MockResponse
) {
  await page.route(`**/functions/v1/${functionName}*`, (route: Route) => {
    route.fulfill({
      status: response.status || 200,
      body: JSON.stringify(response.body),
      headers: {
        'Content-Type': 'application/json',
        ...response.headers,
      },
    });
  });
}

/**
 * Mock Apify actors
 */
export async function mockApifyActor(
  page: Page,
  actorId: string,
  response: MockResponse
) {
  await page.route(`**/v2/acts/${actorId}/**`, (route: Route) => {
    route.fulfill({
      status: response.status || 200,
      body: JSON.stringify(response.body),
      headers: {
        'Content-Type': 'application/json',
        ...response.headers,
      },
    });
  });
}

/**
 * Mock scan results - successful scan
 */
export async function mockSuccessfulScan(page: Page) {
  await mockEdgeFunction(page, 'providers/username-scan', {
    body: {
      findings: [
        {
          id: 'finding-1',
          type: 'social_media',
          title: 'Profile Found on Twitter',
          severity: 'info',
          provider: 'Twitter',
          evidence: [
            { key: 'username', value: 'johndoe' },
            { key: 'followers', value: '1500' },
          ],
        },
        {
          id: 'finding-2',
          type: 'breach',
          title: 'Data Breach Detected',
          severity: 'high',
          provider: 'HIBP',
          evidence: [
            { key: 'breach', value: 'LinkedIn 2021' },
            { key: 'data_classes', value: 'Email addresses, Passwords' },
          ],
        },
      ],
    },
  });
}

/**
 * Mock empty scan results
 */
export async function mockEmptyScan(page: Page) {
  await mockEdgeFunction(page, 'providers/username-scan', {
    body: { findings: [] },
  });
}

/**
 * Mock scan timeout
 */
export async function mockScanTimeout(page: Page) {
  await page.route('**/functions/v1/**', async (route: Route) => {
    await new Promise((resolve) => setTimeout(resolve, 35000));
    route.fulfill({
      status: 408,
      body: JSON.stringify({ error: 'Request timeout' }),
    });
  });
}

/**
 * Mock rate limiting
 */
export async function mockRateLimiting(page: Page) {
  await page.route('**/functions/v1/**', (route: Route) => {
    route.fulfill({
      status: 429,
      body: JSON.stringify({
        error: 'Rate limit exceeded',
        retry_after: 60,
      }),
    });
  });
}

/**
 * Mock network failure
 */
export async function mockNetworkFailure(page: Page) {
  await page.route('**/functions/v1/**', (route: Route) => {
    route.abort('failed');
  });
}

/**
 * Mock user profile with credits
 */
export async function mockUserProfile(
  page: Page,
  credits: number,
  isPremium = false
) {
  await mockDatabase(page, 'profiles', {
    body: [
      {
        id: 'test-user-id',
        credits_balance: credits,
        is_premium: isPremium,
        workspace_id: 'test-workspace-id',
      },
    ],
  });
}

/**
 * Setup standard test environment
 */
export async function setupTestEnvironment(page: Page, options: {
  authenticated?: boolean;
  credits?: number;
  isPremium?: boolean;
} = {}) {
  const {
    authenticated = true,
    credits = 100,
    isPremium = false,
  } = options;

  await mockAuth(page, authenticated);
  if (authenticated) {
    await mockUserProfile(page, credits, isPremium);
  }
}
