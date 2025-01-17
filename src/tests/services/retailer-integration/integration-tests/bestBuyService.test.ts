// integration-tests/bestbuy.test.ts
import { describe, test, expect, beforeAll } from "bun:test";
import { BestBuyService } from 'services/retailer-integration/implementations/bestbuyRetailer';
import { BestBuyConfig } from 'services/retailer-integration/interfaces/bestbuy';
import { settings } from 'services/shared/config/settings';
import { logger } from 'services/shared/utils/logger';
import type { RetailerService } from 'services/retailer-integration/interfaces/retailerService';

describe('BestBuy API Integration', () => {
  let service: RetailerService; // Using interface type for better testing practices

  beforeAll(() => {
    const config: BestBuyConfig = {
      apiKey: settings.retailers.bestbuy.apiKey,
      baseUrl: 'https://api.bestbuy.com/v1',
      rateLimit: 3,
      testMode: false
    };

    if (!config.apiKey) {
      throw new Error('BESTBUY_API_KEY not found in settings');
    }

    service = new BestBuyService(config);
    logger.info('Starting Best Buy API integration tests', 'test');
  });

  test('should fetch a real product by SKU', async () => {
    const sku = '6487433'; // iPhone 14 Pro Max
    const result = await service.getProduct(sku);

    expect(result.warning).toBeUndefined();
    expect(result.data).toBeDefined();
    expect(result.data?.name).toContain('iPhone');
    expect(result.data?.attributes.regularPrice).toBeGreaterThan(0);
  });

  test('should handle non-existent product correctly', async () => {
    const result = await service.getProduct('123456789');

    expect(result.data).toBeUndefined();
    expect(result.warning).toBeDefined();
    expect(result.warning?.statusCode).toBe(404);
    expect(result.warning?.message).toContain('Best Buy API');
  });

  test('should search for products', async () => {
    const searchResults = await service.searchProducts({
      query: 'macbook pro',
      pageSize: 5
    });

    expect(searchResults.warning).toBeUndefined();
    expect(Array.isArray(searchResults.data)).toBe(true);
    expect(searchResults.data?.length).toBeGreaterThan(0);
    expect(searchResults.data?.[0]).toHaveProperty('name');
  });
});
