// services/price-monitor/implementations/price-polling.ts
import { TrackedProductRepository } from '../repositories/tracked-product-repository';
import { PriceRepository } from '../repositories/price-repository';
import { BestBuyService } from '../../retailer-integration/implementations/bestbuyRetailer';
import { logger } from 'u/logger';

// Union type for job status - more precise than string
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
   private pollIntervalMs: number = 24 * 60 * 60 * 1000 // 24h default
 ) {}

 async start(): Promise<void> {
   if (this.status !== 'idle') {
     logger.warn('Polling service already running');
     return;
   }

   this.status = 'polling';
   await this.poll(); // Initial poll
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

 private async poll(): Promise<void> {
   try {
     const products = await this.productRepo.findByRetailerId(this.retailerService.retailerId);

     for (const product of products) {
       const priceResult = await this.retailerService.getCurrentPrice(product.sku);
       if (priceResult.warning) {
         throw new Error(`Failed to fetch price for ${product.sku}: ${priceResult.warning.message}`);
       }

       await this.priceRepo.create({
         productId: product.id,
         price: priceResult.data!,
         currency: 'USD',
         isAvailable: true,
         metadata: {}
       });

       this.metrics.successCount++;
     }

     this.metrics.lastRunTime = new Date();
   } catch (error) {
     this.status = 'error';
     this.metrics.errorCount++;
     this.metrics.lastError = error instanceof Error ? error.message : String(error);
     logger.error(`Polling error: ${this.metrics.lastError}`);
   }
 }

 getMetrics(): Readonly<PollMetrics> {
   return { ...this.metrics }; // Immutable copy
 }
}