// src/server.ts
import { Pool } from 'pg';
import { BestBuyService } from './services/retailer-integration/implementations/bestbuyRetailer';
import { PricePollingService } from './services/price-monitor/implementations/price-polling';
import { TrackedProductRepository } from './services/price-monitor/repositories/tracked-product-repository';
import { PriceRepository } from './services/price-monitor/repositories/price-repository';
import { settings } from './services/shared/config/settings';
import { verifyEnv } from 'u/verify-env.ts';
import { logger } from 'u/logger.ts';

class PriceTrackingServer {
  private pool: Pool;
  private pollingService?: PricePollingService;

  constructor() {
    this.pool = new Pool(settings.database);
  }

  async start() {
    try {
      logger.startSection('Starting Price Tracking Server');

      await verifyEnv();

      // Test database connection
      await this.pool.query('SELECT NOW()');
      logger.success('Database connected', 'database');

      // Initialize services
      const bestBuyService = new BestBuyService({
        apiKey: settings.retailers.bestbuy.apiKey,
        baseUrl: settings.retailers.bestbuy.baseUrl,
        rateLimit: settings.retailers.bestbuy.rateLimit,
      }, this.pool);

      // Initialize the service to get the retailer ID from the database
      await bestBuyService.initialize();

      const productRepo = new TrackedProductRepository(this.pool);
      const priceRepo = new PriceRepository(this.pool);

      this.pollingService = new PricePollingService(
        productRepo,
        priceRepo,
        bestBuyService
      );

      // Handle graceful shutdown
      process.on('SIGINT', () => this.shutdown());
      process.on('SIGTERM', () => this.shutdown());

      // Start polling
      await this.pollingService.start();
      logger.success('Price tracking server started');
    } catch (error) {
      logger.error(`Failed to start server: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  private async shutdown() {
    logger.startSection('Shutting down server');
    try {
      this.pollingService?.stop();
      await this.pool.end();
      logger.success('Server shutdown complete');
      process.exit(0);
    } catch (error) {
      logger.error(`Error during shutdown: ${error}`);
      process.exit(1);
    }
  }
}

// Start server
const server = new PriceTrackingServer();
server.start().catch(() => process.exit(1));