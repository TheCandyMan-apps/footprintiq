import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardFilters, DateRange } from '@/types/dashboard';

const DEFAULT_FILTERS: DashboardFilters = {
  dateRange: '7d',
};

export function useDashboardQuery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS);

  // Load filters from URL on mount
  useEffect(() => {
    const urlFilters: Partial<DashboardFilters> = {};
    
    const dateRange = searchParams.get('range') as DateRange;
    if (dateRange) urlFilters.dateRange = dateRange;
    
    const from = searchParams.get('from');
    if (from) urlFilters.from = from;
    
    const to = searchParams.get('to');
    if (to) urlFilters.to = to;
    
    const workspace = searchParams.get('workspace');
    if (workspace) urlFilters.workspace = workspace;
    
    const severity = searchParams.get('severity');
    if (severity) urlFilters.severity = severity.split(',') as any;
    
    const provider = searchParams.get('provider');
    if (provider) urlFilters.provider = provider.split(',');
    
    const entity = searchParams.get('entity');
    if (entity) urlFilters.entity = entity;
    
    if (Object.keys(urlFilters).length > 0) {
      setFilters((prev) => ({ ...prev, ...urlFilters }));
    }
  }, []);

  // Update URL when filters change
  const updateFilters = useCallback((newFilters: Partial<DashboardFilters>) => {
    setFilters((prev) => {
      const updated = { ...prev, ...newFilters };
      
      // Update URL
      const params = new URLSearchParams();
      params.set('range', updated.dateRange);
      
      if (updated.from) params.set('from', updated.from);
      if (updated.to) params.set('to', updated.to);
      if (updated.workspace) params.set('workspace', updated.workspace);
      if (updated.severity && updated.severity.length > 0) {
        params.set('severity', updated.severity.join(','));
      }
      if (updated.provider && updated.provider.length > 0) {
        params.set('provider', updated.provider.join(','));
      }
      if (updated.entity) params.set('entity', updated.entity);
      
      setSearchParams(params, { replace: true });
      
      return updated;
    });
  }, [setSearchParams]);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  // Compute date range
  const getDateRange = useCallback((): { from: string; to: string } => {
    if (filters.dateRange === 'custom' && filters.from && filters.to) {
      return { from: filters.from, to: filters.to };
    }
    
    const to = new Date();
    const from = new Date();
    
    switch (filters.dateRange) {
      case '7d':
        from.setDate(from.getDate() - 7);
        break;
      case '30d':
        from.setDate(from.getDate() - 30);
        break;
      case '90d':
        from.setDate(from.getDate() - 90);
        break;
    }
    
    return {
      from: from.toISOString(),
      to: to.toISOString(),
    };
  }, [filters]);

  return {
    filters,
    updateFilters,
    resetFilters,
    getDateRange,
  };
}
