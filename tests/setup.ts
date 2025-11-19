import { expect, afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with @testing-library/jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock sessionStorage for tests
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock crypto.randomUUID for CSRF token generation
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => '123e4567-e89b-12d3-a456-426614174000',
  },
});

// Mock Supabase client
export const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
  })),
  functions: {
    invoke: vi.fn(),
  },
  auth: {
    getUser: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  },
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  sessionStorageMock.clear();
});

// Suppress console errors in tests
vi.spyOn(console, 'error').mockImplementation(() => {});
