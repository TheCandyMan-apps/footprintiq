import * as Sentry from '@sentry/react';

interface PaymentMetrics {
  totalAttempts: number;
  failures: number;
  lastHourFailures: number;
  failureRate: number;
}

class PaymentMonitor {
  private metrics: PaymentMetrics = {
    totalAttempts: 0,
    failures: 0,
    lastHourFailures: 0,
    failureRate: 0,
  };

  private failureTimestamps: number[] = [];
  private readonly FAILURE_THRESHOLD = 0.05; // 5%
  private readonly TIME_WINDOW = 60 * 60 * 1000; // 1 hour

  trackAttempt() {
    this.metrics.totalAttempts++;
    this.updateMetrics();
  }

  trackFailure(error: Error | string, context?: Record<string, any>) {
    this.metrics.failures++;
    this.failureTimestamps.push(Date.now());
    
    // Clean old timestamps
    this.cleanOldTimestamps();
    
    // Update metrics
    this.updateMetrics();

    // Log to Sentry
    const errorMessage = error instanceof Error ? error : new Error(error);
    Sentry.captureException(errorMessage, {
      tags: {
        category: 'payment_monitor',
        type: 'credit_purchase_failure',
      },
      extra: {
        ...context,
        failureRate: this.metrics.failureRate,
        recentFailures: this.metrics.lastHourFailures,
      },
      level: 'error',
    });

    // Check if failure rate exceeds threshold
    if (this.metrics.failureRate > this.FAILURE_THRESHOLD) {
      this.triggerAlert();
    }
  }

  private cleanOldTimestamps() {
    const now = Date.now();
    this.failureTimestamps = this.failureTimestamps.filter(
      timestamp => now - timestamp < this.TIME_WINDOW
    );
    this.metrics.lastHourFailures = this.failureTimestamps.length;
  }

  private updateMetrics() {
    this.cleanOldTimestamps();
    
    if (this.metrics.totalAttempts > 0) {
      this.metrics.failureRate = this.metrics.failures / this.metrics.totalAttempts;
    }

    console.log('[Payment Monitor] Metrics:', {
      totalAttempts: this.metrics.totalAttempts,
      failures: this.metrics.failures,
      lastHourFailures: this.metrics.lastHourFailures,
      failureRate: `${(this.metrics.failureRate * 100).toFixed(2)}%`,
    });
  }

  private triggerAlert() {
    const message = `Payment failure rate exceeded ${this.FAILURE_THRESHOLD * 100}%`;
    
    console.error('[Payment Monitor] ALERT:', message, {
      failureRate: this.metrics.failureRate,
      recentFailures: this.metrics.lastHourFailures,
      totalAttempts: this.metrics.totalAttempts,
    });

    // Send high-priority alert to Sentry
    Sentry.captureMessage(message, {
      level: 'fatal',
      tags: {
        category: 'payment_alert',
        alert_type: 'high_failure_rate',
      },
      extra: {
        metrics: this.metrics,
        threshold: this.FAILURE_THRESHOLD,
      },
    });

    // Could also trigger other alerts here (email, Slack, PagerDuty, etc.)
  }

  getMetrics(): PaymentMetrics {
    return { ...this.metrics };
  }

  reset() {
    this.metrics = {
      totalAttempts: 0,
      failures: 0,
      lastHourFailures: 0,
      failureRate: 0,
    };
    this.failureTimestamps = [];
  }
}

// Singleton instance
export const paymentMonitor = new PaymentMonitor();
