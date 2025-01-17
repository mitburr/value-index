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
      rateLimit: 3,
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

    const result = await service.getProduct(sku);
    logger.info('Retrieved product:', 'test');
    logger.list('Product details', [result.data], 'info', 'test');

    expect(result.data).not.toBeNull();
    expect(result.data?.name).toContain('iPhone');
    expect(result.data?.attributes.regularPrice).toBeGreaterThan(0);
  });

  test('should handle non-existent product correctly', async () => {
  const invalidSku = '123456789';
  logger.info(`Testing non-existent SKU: ${invalidSku}`, 'test');

  const result = await service.getProduct(invalidSku);
  logger.info(`Result for invalid SKU:`, 'test');
  logger.list('Response', [result], 'info', 'test');

  // Check that we got a warning and not data
  expect(result.data).toBeUndefined();
  expect(result.warning).toBeDefined();

  // Verify it's the correct type of warning
  if (result.warning) {
    expect(result.warning.statusCode).toBe(404);
    expect(result.warning.message).toContain('Best Buy API');
  }
  });

  test('should search for products', async () => {
  const searchQuery = 'macbook pro';
  logger.info(`Searching for products with query: ${searchQuery}`, 'test');

  const searchResults = await service.searchProducts({
    query: searchQuery,
    pageSize: 5
  });

  logger.info('Search results:', 'test');
  logger.list('Products found', searchResults.data ?? [], 'info', 'test');

  // Add error logging
  if (searchResults.warning) {
    logger.error(`Search failed: ${searchResults.warning.message}`, 'test');
  }

  expect(searchResults.warning).toBeUndefined(); // Make sure there's no error
  expect(Array.isArray(searchResults.data)).toBe(true);
  expect(searchResults.data?.length ?? 0).toBeGreaterThan(0);
  });

  // test('should get current price for a product', async () => {
  // const sku = '6487433'; // iPhone 14 Pro Max
  // logger.info(`Fetching current price for SKU: ${sku}`, 'test');
  //
  // const priceResult = await service.getCurrentPrice(sku);
  //
  // // Add error logging
  // if (priceResult.warning) {
  //   logger.error(`Price fetch failed: ${priceResult.warning.message}`, 'test');
  // }
  //
  // expect(priceResult.warning).toBeUndefined();
  // expect(priceResult.data).toBeDefined();
  //
  // const { data: price } = priceResult;
  // logger.info(`Current price: $${price}`, 'test');
  //
  // expect(price).not.toBeNull();
  // expect(typeof price).toBe('number');
  // expect(price).toBeGreaterThan(0);
  // });

  // Category search is tabled as a feature
  // test('should handle category search', async () => {
  // const category = 'Cell Phones';
  // logger.info(`Searching products in category: ${category}`, 'test');
  //
  // const results = await service.searchProducts({
  //   category,
  //   pageSize: 5
  // });
  //
  // logger.info('Category search results:', 'test');
  // logger.list('Products in category', results.data ?? [], 'info', 'test');
  //
  // // Add error logging
  // if (results.warning) {
  //   logger.error(`Category search failed: ${results.warning.message}`, 'test');
  // }
  //
  // expect(results.warning).toBeUndefined();
  // expect(Array.isArray(results.data)).toBe(true);
  // expect(results.data?.length ?? 0).toBeGreaterThan(0);
  // });

  // Rate limiting feature deferred
  // test('should respect rate limits across multiple requests', async () => {
  //   const sku = '6487433';
  //   logger.info('Testing rate limiting with multiple parallel requests', 'test');
  //   const startTime = Date.now();
  //
  //   // Make 6 requests (exceeding the rate limit of 5)
  //   const requests = Array(6).fill(null).map((_, i) => {
  //     logger.info(`Initiating request ${i + 1}`, 'test');
  //     return service.getProduct(sku);
  //   });
  //
  //   await Promise.all(requests);
  //
  //   const duration = Date.now() - startTime;
  //   logger.info(`Multiple requests completed in ${duration}ms`, 'test');
  //
  //   // With test mode, should take at least 1 second for the 6th request
  //   expect(duration).toBeGreaterThan(1000);
  // }, 10000); // 10 second timeout
});