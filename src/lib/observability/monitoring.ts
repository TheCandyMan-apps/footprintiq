/**
 * Application Monitoring & Health Checks
 * 
 * Tracks application health, performance metrics, and uptime
 */

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'down';
  timestamp: number;
  checks: {
    database: boolean;
    api: boolean;
    auth: boolean;
  };
  metrics: {
    uptime: number;
    memory: number;
    responseTime: number;
  };
}

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

class MonitoringService {
  private metrics: PerformanceMetric[] = [];
  private startTime = Date.now();
  private healthCheckInterval?: number;

  constructor() {
    if (typeof window !== 'undefined') {
      // Track page visibility for uptime calculation
      document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
      
      // Collect Web Vitals
      this.setupWebVitals();
    }
  }

  private handleVisibilityChange() {
    const metric: PerformanceMetric = {
      name: 'page_visibility',
      value: document.hidden ? 0 : 1,
      timestamp: Date.now(),
      tags: { state: document.hidden ? 'hidden' : 'visible' }
    };
    this.recordMetric(metric);
  }

  private setupWebVitals() {
    // Track Core Web Vitals if supported
    if ('PerformanceObserver' in window) {
      try {
        // Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.recordMetric({
            name: 'web_vital_lcp',
            value: lastEntry.startTime,
            timestamp: Date.now(),
            tags: { vital: 'lcp' }
          });
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            this.recordMetric({
              name: 'web_vital_fid',
              value: (entry as any).processingStart - entry.startTime,
              timestamp: Date.now(),
              tags: { vital: 'fid' }
            });
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift (CLS)
        let clsScore = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsScore += (entry as any).value;
            }
          }
          this.recordMetric({
            name: 'web_vital_cls',
            value: clsScore,
            timestamp: Date.now(),
            tags: { vital: 'cls' }
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        console.warn('[Monitoring] Web Vitals setup failed:', error);
      }
    }
  }

  recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    
    // Keep only last 1000 metrics in memory
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Log important metrics
    if (metric.name.includes('vital') || metric.value > 3000) {
      console.debug('[Monitoring] Metric recorded:', metric);
    }
  }

  async checkHealth(): Promise<HealthCheck> {
    const now = Date.now();
    const uptime = now - this.startTime;

    // Simple health checks
    const checks = {
      database: await this.checkDatabase(),
      api: await this.checkAPI(),
      auth: await this.checkAuth()
    };

    const allHealthy = Object.values(checks).every(v => v === true);
    const someHealthy = Object.values(checks).some(v => v === true);

    return {
      status: allHealthy ? 'healthy' : someHealthy ? 'degraded' : 'down',
      timestamp: now,
      checks,
      metrics: {
        uptime,
        memory: this.getMemoryUsage(),
        responseTime: this.getAverageResponseTime()
      }
    };
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      // Simple check - in production would ping Supabase
      return typeof window !== 'undefined' && navigator.onLine;
    } catch {
      return false;
    }
  }

  private async checkAPI(): Promise<boolean> {
    try {
      return typeof window !== 'undefined' && navigator.onLine;
    } catch {
      return false;
    }
  }

  private async checkAuth(): Promise<boolean> {
    try {
      return typeof window !== 'undefined';
    } catch {
      return false;
    }
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / memory.jsHeapSizeLimit;
    }
    return 0;
  }

  private getAverageResponseTime(): number {
    const recentMetrics = this.metrics
      .filter(m => m.name.includes('response_time'))
      .slice(-10);
    
    if (recentMetrics.length === 0) return 0;
    
    const sum = recentMetrics.reduce((acc, m) => acc + m.value, 0);
    return sum / recentMetrics.length;
  }

  startHealthChecks(intervalMs = 60000) {
    this.healthCheckInterval = window.setInterval(async () => {
      const health = await this.checkHealth();
      console.log('[Monitoring] Health check:', health);
      
      if (health.status !== 'healthy') {
        console.warn('[Monitoring] System degraded or down:', health);
      }
    }, intervalMs);
  }

  stopHealthChecks() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }

  getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.filter(m => m.name === name);
    }
    return this.metrics;
  }

  clearMetrics() {
    this.metrics = [];
  }
}

// Singleton instance
export const monitoring = new MonitoringService();

// Auto-start health checks in production
if (import.meta.env.MODE === 'production') {
  monitoring.startHealthChecks();
}
