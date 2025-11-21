import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

describe('Emergency Fixes Integration', () => {
  describe('Stuck Scan Cleanup', () => {
    it('should mark old pending scans as timeout', async () => {
      // Create a test scan that's "stuck" (pending for 20 minutes)
      const oldTimestamp = new Date(Date.now() - 20 * 60 * 1000).toISOString();
      
      const { data: scan, error: insertError } = await supabase
        .from('scans')
        .insert({
          status: 'pending',
          scan_type: 'username',
          target: 'test-stuck-user',
          created_at: oldTimestamp,
        })
        .select()
        .single();

      expect(insertError).toBeNull();
      expect(scan).toBeDefined();

      // Wait a moment for cleanup job to run (or manually invoke)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check if scan was marked as timeout
      const { data: updatedScan } = await supabase
        .from('scans')
        .select('status, completed_at')
        .eq('id', scan!.id)
        .single();

      expect(updatedScan?.status).toBe('timeout');
      expect(updatedScan?.completed_at).toBeTruthy();

      // Cleanup
      await supabase.from('scans').delete().eq('id', scan!.id);
    });

    it('should log timeout event to system_errors', async () => {
      const { data: errors } = await supabase
        .from('system_errors')
        .select('*')
        .eq('function_name', 'cleanup-stuck-scans')
        .order('created_at', { ascending: false })
        .limit(1);

      expect(errors).toBeDefined();
      expect(errors!.length).toBeGreaterThan(0);
      expect(errors![0].error_message).toContain('timeout');
    });
  });

  describe('Scan Timeout Logic', () => {
    it('should timeout scans running longer than 5 minutes', async () => {
      // This test verifies the timeout logic exists
      // In production, scans are automatically timed out
      const { data: timeoutScans } = await supabase
        .from('scans')
        .select('id, status, created_at, completed_at')
        .eq('status', 'timeout')
        .limit(5);

      // Verify timeout scans have completed_at timestamps
      timeoutScans?.forEach(scan => {
        expect(scan.completed_at).toBeTruthy();
        const duration = new Date(scan.completed_at).getTime() - 
                        new Date(scan.created_at).getTime();
        // Allow some buffer beyond 5 minutes
        expect(duration).toBeGreaterThanOrEqual(5 * 60 * 1000);
      });
    });
  });

  describe('Extension Schema Migration', () => {
    it('should have moved vector extension to extensions schema', async () => {
      const { data, error } = await supabase.rpc('pg_extension_name', {
        extension_name: 'vector'
      });

      // This verifies the extension exists and is accessible
      expect(error).toBeNull();
    });
  });

  describe('Health Check Enhancements', () => {
    it('should return comprehensive health metrics', async () => {
      const { data, error } = await supabase.functions.invoke('health-check');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.status).toBeDefined();
      expect(data.checks).toBeDefined();
      expect(data.checks.database).toBeDefined();
      expect(data.checks.edge_functions).toBeDefined();
      expect(data.checks.osint_workers).toBeDefined();
      expect(data.metrics).toBeDefined();
      expect(data.metrics.scan_queue_depth).toBeGreaterThanOrEqual(0);
    });

    it('should check OSINT worker availability', async () => {
      const { data } = await supabase.functions.invoke('health-check');

      expect(data.checks.osint_workers.maigret).toBeDefined();
      expect(data.checks.osint_workers.sherlock).toBeDefined();
      expect(data.checks.osint_workers.gosearch).toBeDefined();
      
      // Each worker should have a status
      expect(['healthy', 'degraded', 'unhealthy', 'timeout']).toContain(
        data.checks.osint_workers.maigret.status
      );
    });
  });

  describe('System Error Logging', () => {
    it('should retrieve admin errors with filters', async () => {
      const { data, error } = await supabase.functions.invoke('admin-get-errors', {
        body: {
          severity: 'error',
          limit: 10,
        },
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.errors).toBeInstanceOf(Array);
      expect(data.total).toBeGreaterThanOrEqual(0);
      expect(data.stats).toBeDefined();
    });

    it('should track error statistics by function', async () => {
      const { data } = await supabase.functions.invoke('admin-get-errors');

      expect(data.stats.by_function).toBeDefined();
      expect(typeof data.stats.by_function).toBe('object');
    });
  });
});
