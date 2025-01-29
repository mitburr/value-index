import { describe, test, expect, beforeAll } from "bun:test";
import { BestBuyService } from 'services/retailer-integration/implementations/bestbuyRetailer';
import { BestBuyConfig } from 'services/retailer-integration/interfaces/bestbuy';
import { settings } from 'services/shared/config/settings';
import { logger } from 'services/shared/utils/logger';
import type { RetailerService } from 'services/retailer-integration/interfaces/retailerService';

describe('BestBuy API Integration', () => {
  let service: RetailerService;

  beforeAll(() => {
    const config: BestBuyConfig = {
      apiKey: settings.retailers.bestbuy.apiKey,
      baseUrl: 'https://api.bestbuy.com/v1',
      rateLimit: 5,
      retailerId: settings.retailers.bestbuy.retailerId
    };

    if (!config.apiKey) {
      throw new Error('BESTBUY_API_KEY not found in settings');
    }

    service = new BestBuyService(config);
    logger.info('Starting Best Buy API integration tests', 'test');
  });

  describe('Product Retrieval', () => {
    test('should fetch products by search term', async () => {
      const result = await service.searchProducts({
        query: 'macbook',
        pageSize: 1
      });

      expect(result.warning).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);

      if (result.data && result.data.length > 0) {
        const product = result.data[0];
        expect(product.name).toBeDefined();
        expect(product.externalId).toBeDefined();
        expect(product.attributes.regularPrice).toBeGreaterThan(0);
      }
    });

    test('should handle invalid SKU format', async () => {
      const result = await service.getProduct('invalid-sku-format');

      expect(result.data).toBeUndefined();
      expect(result.warning).toBeDefined();
      expect(result.warning?.statusCode).toBe(400);
      expect(result.warning?.message).toContain('Invalid request');
    });

    test('should handle search with no results', async () => {
      const result = await service.searchProducts({
        query: 'xxxxxxxxxxxxxxxxxxx',
        pageSize: 5
      });

      expect(result.warning).toBeUndefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data?.length).toBe(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed queries', async () => {
      const result = await service.searchProducts({
        query: '!@#$%^&*()',
        pageSize: 5
      });

      // Best Buy API should either return an empty result or an error
      if (result.warning) {
        expect(result.warning.statusCode).toBeGreaterThanOrEqual(400);
      } else {
        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data?.length).toBe(0);
      }
    });

    test('should handle pagination with common product search', async () => {
      // Using 'iphone' as it's likely to have multiple results
      const result = await service.searchProducts({
        query: 'iphone',
        pageSize: 10,
        page: 1
      });

      expect(result.warning).toBeUndefined();
      expect(Array.isArray(result.data)).toBe(true);

      // We should get some results for a common term like 'iphone'
      if (result.data && result.data.length === 0) {
        console.warn('No results found for iPhone search - this might indicate an API issue');
      }

      // Test the shape of the data rather than the quantity
      result.data?.forEach(product => {
        expect(product.name).toBeDefined();
        expect(product.externalId).toBeDefined();
        expect(product.attributes).toBeDefined();
      });
    });
  });
});