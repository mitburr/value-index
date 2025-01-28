// services/price-monitor/implementations/price-polling.ts
import { TrackedProductRepository } from '../repositories/tracked-product-repository';
import { PriceRepository } from '../repositories/price-repository';
import { BestBuyService } from '../../retailer-integration/implementations/bestbuyRetailer';
import { logger } from 'u/logger';

type PollStatus = 'idle' | 'polling' | 'error';

interface PollMetrics {
  lastRunTime: Date | null;
  successCount: number;
  errorCount: number;
  lastError?: string;
}

export class PricePollingService {
  private status: PollStatus = 'idle';
  private intervalId?: NodeJS.Timer;
  private metrics: PollMetrics = {
    lastRunTime: null,
    successCount: 0,
    errorCount: 0
  };

  constructor(
    private productRepo: TrackedProductRepository,
    private priceRepo: PriceRepository,
    private retailerService: BestBuyService,
    private pollIntervalMs: number = 24 * 60 * 60 * 1000
  ) {}

  async start(): Promise<void> {
    if (this.status !== 'idle') {
      logger.warn('Polling service already running');
      return;
    }

    this.status = 'polling';
    await this.poll();
    this.intervalId = setInterval(() => this.poll(), this.pollIntervalMs);
    logger.info('Price polling started', 'database');
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
      this.status = 'idle';
      logger.info('Price polling stopped', 'database');
    }
  }

  async poll(): Promise<void> {
    try {
      logger.debug(`Starting poll with retailer ID: ${this.retailerService.retailerId}`);
      const products = await this.productRepo.findByRetailerId(this.retailerService.retailerId);
      logger.debug(`Found ${products.length} products to check`);

      for (const product of products) {
        logger.debug(`Processing product: ${JSON.stringify(product)}`);
        const priceResult = await this.retailerService.getCurrentPrice(product.sku);

        if (priceResult.warning) {
          throw new Error(`Failed to fetch price for ${product.sku}: ${priceResult.warning.message}`);
        }

        logger.debug(`Creating price record for product ${product.sku} with ID ${product.productId}`);

        await this.priceRepo.create({
          productId: product.productId,
          price: priceResult.data!,
          currency: 'USD',
          isAvailable: true,
          metadata: {}
        });

        this.metrics.successCount++;
        logger.debug(`Successfully recorded price for product ${product.sku}`);
      }

      this.metrics.lastRunTime = new Date();
      logger.debug(`Poll completed successfully. Metrics: ${JSON.stringify(this.metrics)}`);
    } catch (error) {
      this.status = 'error';
      this.metrics.errorCount++;
      this.metrics.lastError = error instanceof Error ? error.message : String(error);
      logger.error(`Polling error: ${this.metrics.lastError}`);
    }
  }

  getMetrics(): Readonly<PollMetrics> {
    return { ...this.metrics };
  }
}