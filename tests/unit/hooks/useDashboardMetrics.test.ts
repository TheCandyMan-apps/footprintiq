import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { mockSupabase } from '../../setup';

describe('useDashboardMetrics hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch metrics successfully', async () => {
    const mockMetrics = {
      totalScans: 1250,
      activeUsers: 89,
      scansByType: [
        { type: 'username', count: 450 }
      ],
      providerPerformance: [
        { provider: 'maigret', successRate: 0.95, avgResponseTime: 2500 }
      ],
      systemHealth: {
        status: 'healthy',
        uptime: 99.8
      }
    };

    mockSupabase.functions.invoke.mockResolvedValue({
      data: mockMetrics,
      error: null
    });

    const { result } = renderHook(() => useDashboardMetrics());

    await waitFor(() => {
      expect(result.current.data).toEqual(mockMetrics);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });

  it('should handle errors', async () => {
    mockSupabase.functions.invoke.mockResolvedValue({
      data: null,
      error: new Error('Failed to fetch metrics')
    });

    const { result } = renderHook(() => useDashboardMetrics());

    await waitFor(() => {
      expect(result.current.data).toBe(null);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeTruthy();
    });
  });

  it('should refetch on date range change', async () => {
    const mockMetrics = {
      totalScans: 500,
      activeUsers: 45,
      scansByType: [],
      providerPerformance: [],
      systemHealth: { status: 'healthy', uptime: 99.9 }
    };

    mockSupabase.functions.invoke.mockResolvedValue({
      data: mockMetrics,
      error: null
    });

    const { result, rerender } = renderHook(
      ({ startDate, endDate }) => useDashboardMetrics(startDate, endDate),
      {
        initialProps: {
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        }
      }
    );

    await waitFor(() => {
      expect(result.current.data?.totalScans).toBe(500);
    });

    // Change date range
    rerender({
      startDate: '2024-02-01',
      endDate: '2024-02-28'
    });

    await waitFor(() => {
      expect(mockSupabase.functions.invoke).toHaveBeenCalledTimes(2);
    });
  });

  it('should show loading state initially', () => {
    mockSupabase.functions.invoke.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 1000))
    );

    const { result } = renderHook(() => useDashboardMetrics());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBe(null);
  });
});
