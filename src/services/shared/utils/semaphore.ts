// src/services/shared/utils/semaphore.ts

import { logger } from './logger';

export class Semaphore {
  private permits: number;
  private queue: (() => void)[] = [];

  constructor(private maxPermits: number, private debug: boolean = false) {
    this.permits = maxPermits;
    if (this.debug) {
      logger.info(`Semaphore initialized with ${maxPermits} permits`);
    }
  }

  async acquire(): Promise<void> {
    if (this.debug) {
      logger.info(`Attempting to acquire permit. Available permits: ${this.permits}, Queue length: ${this.queue.length}`);
    }

    if (this.permits > 0) {
      this.permits -= 1;
      if (this.debug) {
        logger.info(`Permit acquired immediately. Remaining permits: ${this.permits}`);
      }
      return;
    }

    if (this.debug) {
      logger.info('No permits available, queuing request');
    }
    return new Promise<void>(resolve => {
      this.queue.push(resolve);
    });
  }

  release(): void {
    if (this.debug) {
      logger.info(`Releasing permit. Current permits: ${this.permits}, Queue length: ${this.queue.length}`);
    }
    this.permits += 1;

    if (this.queue.length > 0 && this.permits > 0) {
      this.permits -= 1;
      const next = this.queue.shift();
      if (this.debug) {
        logger.info(`Permit given to queued request. Remaining permits: ${this.permits}, New queue length: ${this.queue.length}`);
      }
      if (next) next();
    }
  }
}