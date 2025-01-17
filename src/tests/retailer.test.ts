// src/tests/services/retailer-integration/integration-tests/bestbuy.test.ts

import { describe, test, expect, beforeAll } from "bun:test";
import { BestBuyService } from 'services/retailer-integration/implementations/bestbuyRetailer.ts';
import { BestBuyConfig } from 'services/retailer-integration/interfaces/bestbuy';
import { settings } from 'services/shared/config/settings';
import { logger } from 'u/logger';

describe('BestBuy API Integration', () => {
  let service: BestBuyService;

  beforeAll(() => {
    const config: BestBuyConfig = {
      apiKey: settings.retailers.bestbuy.apiKey,
      baseUrl: 'https://api.bestbuy.com/v1',
      rateLimit: 3 // Best Buy's default rate limit
    };

    if (!config.apiKey) {
      throw new Error('BESTBUY_API_KEY not found in settings');
    }

    service = new BestBuyService(config);
    logger.info('Starting Best Buy API integration tests');
  });

  test('should fetch a real product by SKU', async () => {
    // Using iPhone as a test product - should update SKU periodically
    const sku = '6487433'; // iPhone 14 Pro Max
    const product = await service.getProduct(sku);

    logger.info(`Retrieved product: ${product}`);

    expect(product).not.toBeNull();
    expect(product?.name).toContain('iPhone');
    expect(product?.attributes.regularPrice).toBeGreaterThan(0);
  });

  test('should handle non-existent product gracefully', async () => {
    const product = await service.getProduct('00000000');
    expect(product).toBeNull();
  });

  test('should search for products', async () => {
    const searchResults = await service.searchProducts({
      query: 'macbook pro',
      pageSize: 5
    });

    logger.info(`Search results: ${searchResults}`);

    expect(searchResults.length).toBeGreaterThan(0);
    expect(searchResults[0].name.toLowerCase()).toContain('macbook');
  });

  test('should get current price for a product', async () => {
    const sku = '6487433'; // iPhone 14 Pro Max
    const price = await service.getCurrentPrice(sku);

    logger.info(`Current price for SKU ${sku}: $${price}`);

    expect(price).not.toBeNull();
    expect(typeof price).toBe('number');
    expect(price).toBeGreaterThan(0);
  });

  test('should handle category search', async () => {
    const results = await service.searchProducts({
      category: 'Cell Phones',
      pageSize: 5
    });

    logger.info(`Category search results: ${results}`);

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].category).toBe('Cell Phones');
  });

  // Note: This test might take longer due to rate limiting
  test('should respect rate limits across multiple requests', async () => {
    const sku = '6487433';
    const startTime = Date.now();

    // Make multiple requests in succession
    await Promise.all([
      service.getProduct(sku),
      service.getProduct(sku),
      service.getProduct(sku)
    ]);

    const duration = Date.now() - startTime;
    logger.info(`Multiple requests took ${duration}ms`);

    // With 5 req/minute rate limit, 3 requests should take at least 24 seconds
    expect(duration).toBeGreaterThan(24000);
  });
});