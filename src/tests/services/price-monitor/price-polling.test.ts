// services/price-monitor/tests/price-polling.test.ts
import { describe, test, expect, mock, beforeEach, afterEach } from "bun:test";
import { PricePollingService } from 'services/price-monitor/implementations/price-polling';
import { TrackedProductRepository } from 'services/price-monitor/repositories/tracked-product-repository';
import { PriceRepository } from 'services/price-monitor/repositories/price-repository';
import { BestBuyService } from 'services/retailer-integration/implementations/bestbuyRetailer';
import { TestDatabase } from '@/tests/utils/testDb.ts';
import { HttpWarningFactory } from 'services/shared/types';
import { Pool } from 'pg';

describe('PricePollingService', () => {
  let pollingService: PricePollingService;
  let productRepo: TrackedProductRepository;
  let priceRepo: PriceRepository;
  let bestBuyService: BestBuyService;
  let retailerId: string;


  beforeEach(async () => {
    await TestDatabase.initialize();
    const pool = TestDatabase.getPool();

    // First create a retailer and get its UUID
    const retailerResult = await pool.query<{ id: string }>(`
      INSERT INTO retailers (name, base_url, rate_limit)
      VALUES ($1, $2, $3)
      RETURNING id
    `, ['Best Buy Test', 'https://api.bestbuy.com/v1', 60]);

    retailerId = retailerResult.rows[0].id;

    productRepo = new TrackedProductRepository(pool);
    priceRepo = new PriceRepository(pool);
    bestBuyService = new BestBuyService({
      apiKey: 'test-key',
      baseUrl: 'test-url',
      rateLimit: 60
    }, retailerId);

    pollingService = new PricePollingService(
      productRepo,
      priceRepo,
      bestBuyService,
      1000 // 1 second for testing
    );
  });

  afterEach(async () => {
    pollingService.stop();
    await TestDatabase.cleanup();
  });

  test('should poll prices for tracked products', async () => {
    bestBuyService.getCurrentPrice = mock(async () => ({
      data: 999.99
    }));

    await productRepo.create({
      sku: 'test-sku',
      retailerId, // Now using proper UUID
      name: 'Test Product',
      validationRules: {
        exactNameMatch: 'Test Product'
      }
    });

    await pollingService.start();
    await new Promise(resolve => setTimeout(resolve, 1100));

    const metrics = pollingService.getMetrics();
    expect(metrics.successCount).toBe(1);
    expect(metrics.errorCount).toBe(0);
  });

  test('should handle errors gracefully', async () => {
    bestBuyService.getCurrentPrice = mock(async () => ({
      warning: HttpWarningFactory.UnknownHttpWarning(500, 'Test error')
    }));

    await productRepo.create({
      sku: 'test-sku',
      retailerId, // Now using proper UUID
      name: 'Test Product',
      validationRules: {
        exactNameMatch: 'Test Product'
      }
    });

    await pollingService.start();
    await new Promise(resolve => setTimeout(resolve, 1100));

    const metrics = pollingService.getMetrics();
    expect(metrics.errorCount).toBeGreaterThan(0);
    expect(metrics.lastError).toBeDefined();
  });
});