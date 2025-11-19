import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { mockSupabase } from '../../setup';

describe('useIsAdmin hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return false initially', () => {
    const { result } = renderHook(() => useIsAdmin());
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isLoading).toBe(true);
  });

  it('should return true for admin user', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'admin-123' } },
      error: null
    });

    mockSupabase.from().select().eq().single.mockResolvedValue({
      data: { role: 'admin' },
      error: null
    });

    const { result } = renderHook(() => useIsAdmin());

    await waitFor(() => {
      expect(result.current.isAdmin).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should return false for non-admin user', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null
    });

    mockSupabase.from().select().eq().single.mockResolvedValue({
      data: { role: 'user' },
      error: null
    });

    const { result } = renderHook(() => useIsAdmin());

    await waitFor(() => {
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should handle missing user gracefully', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    });

    const { result } = renderHook(() => useIsAdmin());

    await waitFor(() => {
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should handle database errors gracefully', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null
    });

    mockSupabase.from().select().eq().single.mockResolvedValue({
      data: null,
      error: new Error('Database error')
    });

    const { result } = renderHook(() => useIsAdmin());

    await waitFor(() => {
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });
  });
});
