/**
 * Simple promise queue with concurrency control and retries
 */

interface QueueOptions {
  concurrency?: number;
  retries?: number;
  retryDelays?: number[]; // ms delays [1st retry, 2nd retry, 3rd retry]
}

interface TaskResult<T> {
  status: 'fulfilled' | 'rejected';
  value?: T;
  reason?: any;
}

export class PromiseQueue {
  private concurrency: number;
  private retries: number;
  private retryDelays: number[];
  private running = 0;
  private queue: Array<() => Promise<any>> = [];

  constructor(options: QueueOptions = {}) {
    this.concurrency = options.concurrency || 5;
    this.retries = options.retries || 3;
    this.retryDelays = options.retryDelays || [2000, 4000, 8000];
  }

  async add<T>(fn: () => Promise<T>): Promise<T> {
    if (this.running < this.concurrency) {
      this.running++;
      try {
        return await this.executeWithRetry(fn);
      } finally {
        this.running--;
        this.processQueue();
      }
    }

    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await this.executeWithRetry(fn);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  private async executeWithRetry<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt < this.retries) {
          const delay = this.retryDelays[attempt] || this.retryDelays[this.retryDelays.length - 1];
          console.log(`[queue] Retry ${attempt + 1}/${this.retries} after ${delay}ms`);
          await this.sleep(delay);
        }
      }
    }

    throw lastError;
  }

  private async processQueue() {
    if (this.queue.length === 0 || this.running >= this.concurrency) {
      return;
    }

    const task = this.queue.shift();
    if (task) {
      this.running++;
      try {
        await task();
      } finally {
        this.running--;
        this.processQueue();
      }
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async addAll<T>(tasks: Array<() => Promise<T>>): Promise<TaskResult<T>[]> {
    const results = await Promise.allSettled(
      tasks.map(task => this.add(task))
    );

    return results.map(result => ({
      status: result.status,
      value: result.status === 'fulfilled' ? result.value : undefined,
      reason: result.status === 'rejected' ? result.reason : undefined,
    }));
  }
}

export function createQueue(options?: QueueOptions): PromiseQueue {
  return new PromiseQueue(options);
}
