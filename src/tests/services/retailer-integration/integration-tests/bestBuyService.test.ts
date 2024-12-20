// src/tests/services/retailer-integration/integration-tests/bestbuy.test.ts

import { describe, test, expect, beforeAll } from "bun:test";
import { BestBuyService } from 'services/retailer-integration/implementations/bestbuyRetailer';
import { BestBuyConfig } from 'services/retailer-integration/interfaces/bestbuy';
import { settings } from 'services/shared/config/settings';
import { logger } from 'services/shared/utils/logger';

describe('BestBuy API Integration', () => {
  let service: BestBuyService;

  beforeAll(() => {
    const config: BestBuyConfig = {
      apiKey: settings.retailers.bestbuy.apiKey,
      baseUrl: 'https://api.bestbuy.com/v1',
      rateLimit: 5,
      testMode: false  // Enable test mode for faster rate limiting
    };

    if (!config.apiKey) {
      throw new Error('BESTBUY_API_KEY not found in settings');
    }

    service = new BestBuyService(config);
    logger.info('Starting Best Buy API integration tests', 'test');
  });

  test('should fetch a real product by SKU', async () => {
    const sku = '6487433'; // iPhone 14 Pro Max
    logger.info(`Fetching product with SKU: ${sku}`, 'test');

    const product = await service.getProduct(sku);
    logger.info('Retrieved product:', 'test');
    logger.list('Product details', [product], 'info', 'test');

    expect(product).not.toBeNull();
    expect(product?.name).toContain('iPhone');
    expect(product?.attributes.regularPrice).toBeGreaterThan(0);
  });

  test('should handle non-existent product gracefully', async () => {
    const invalidSku = '00000000';
    logger.info(`Testing non-existent SKU: ${invalidSku}`, 'test');

    const product = await service.getProduct(invalidSku);
    logger.info(`Result for invalid SKU: ${product === null ? 'null (as expected)' : 'unexpectedly found product'}`, 'test');

    expect(product).toBeNull();
  });

  test('should search for products', async () => {
    const searchQuery = 'macbook pro';
    logger.info(`Searching for products with query: ${searchQuery}`, 'test');

    const searchResults = await service.searchProducts({
      query: searchQuery,
      pageSize: 5
    });

    logger.info('Search results:', 'test');
    logger.list('Products found', searchResults, 'info', 'test');

    expect(searchResults.length).toBeGreaterThan(0);
    expect(searchResults[0].name.toLowerCase()).toContain('macbook');
  });

  test('should get current price for a product', async () => {
    const sku = '6487433'; // iPhone 14 Pro Max
    logger.info(`Fetching current price for SKU: ${sku}`, 'test');

    const price = await service.getCurrentPrice(sku);
    logger.info(`Current price: $${price}`, 'test');

    expect(price).not.toBeNull();
    expect(typeof price).toBe('number');
    expect(price).toBeGreaterThan(0);
  });

  test('should handle category search', async () => {
    const category = 'Cell Phones';
    logger.info(`Searching products in category: ${category}`, 'test');

    const results = await service.searchProducts({
      category,
      pageSize: 5
    });

    logger.info('Category search results:', 'test');
    logger.list('Products in category', results, 'info', 'test');

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].category).toBe(category);
  });

  test('should respect rate limits across multiple requests', async () => {
    const sku = '6487433';
    logger.info('Testing rate limiting with multiple parallel requests', 'test');
    const startTime = Date.now();

    // Make 6 requests (exceeding the rate limit of 5)
    const requests = Array(6).fill(null).map((_, i) => {
      logger.info(`Initiating request ${i + 1}`, 'test');
      return service.getProduct(sku);
    });

    await Promise.all(requests);

    const duration = Date.now() - startTime;
    logger.info(`Multiple requests completed in ${duration}ms`, 'test');

    // With test mode, should take at least 1 second for the 6th request
    expect(duration).toBeGreaterThan(1000);
  }, 10000); // 10 second timeout
});