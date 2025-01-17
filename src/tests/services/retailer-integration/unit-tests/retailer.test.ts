import { describe, test, expect, beforeEach, afterEach, mock } from "bun:test";
import { BestBuyService } from 'services/retailer-integration/implementations/bestbuyRetailer';
import type { RetailerService } from 'services/retailer-integration/interfaces/retailerService';
import { BestBuyConfig } from 'services/retailer-integration/interfaces/bestbuy';

describe('BestBuyService Unit Tests', () => {
  let service: RetailerService;

  const testConfig: BestBuyConfig = {
    apiKey: 'test-api-key',
    baseUrl: 'https://api.bestbuy.com/v1',
    rateLimit: 5
  };

  const mockBestBuyProduct = {
    sku: 'test-sku-123',
    name: 'Test Product',
    regularPrice: 129.99,
    categoryPath: ['Electronics', 'Computers', 'Laptops'],
    modelNumber: 'MODEL123',
    description: 'A test product description',
    manufacturer: 'Test Brand',
    image: 'http://test-image.jpg',
    inStoreAvailability: true,
    onlineAvailability: true
  };

  beforeEach(() => {
    service = new BestBuyService(testConfig);
  });

  describe('getProduct', () => {
    test('should fetch and map a product correctly', async () => {
      global.fetch = mock(() =>
        Promise.resolve(new Response(
          JSON.stringify(mockBestBuyProduct),
          { status: 200 }
        ))
      );

      const result = await service.getProduct('test-sku-123');

      expect(result.warning).toBeUndefined();
      expect(result.data).toEqual({
        externalId: 'test-sku-123',
        name: 'Test Product',
        category: 'Laptops',
        attributes: {
          manufacturer: 'Test Brand',
          modelNumber: 'MODEL123',
          description: 'A test product description',
          image: 'http://test-image.jpg',
          regularPrice: 129.99,
          inStoreAvailability: true,
          onlineAvailability: true,
          categoryPath: ['Electronics', 'Computers', 'Laptops']
        },
        active: true
      });
    });
  });

  describe('searchProducts', () => {
    test('should handle search params correctly', async () => {
      const fetchSpy = mock<typeof fetch>(() =>
        Promise.resolve(new Response(
          JSON.stringify({ products: [mockBestBuyProduct] }),
          { status: 200 }
        ))
      );
      global.fetch = fetchSpy;

      await service.searchProducts({
        query: 'laptop',
        pageSize: 10
      });
      const firstCallArg = fetchSpy.mock.calls[0]?.[0];
      if (!firstCallArg) {
        throw new Error('No fetch calls recorded');
      }

      expect(fetchSpy.mock.calls.length).toBeGreaterThan(0);
      const firstCall = fetchSpy.mock.calls[0];
      expect(firstCall).toBeDefined();

      const callUrl = new URL(firstCallArg.toString());
      expect(callUrl.toString()).toContain('(search=laptop)');
      expect(callUrl.searchParams.get('pageSize')).toBe('10');
    });
  });

  describe('getCurrentPrice', () => {
    test('should extract price from product data', async () => {
      global.fetch = mock(() =>
        Promise.resolve(new Response(
          JSON.stringify(mockBestBuyProduct),
          { status: 200 }
        ))
      );

      const result = await service.getCurrentPrice('test-sku-123');
      expect(result.warning).toBeUndefined();
      expect(result.data).toBe(129.99);
    });
  });

  afterEach(() => {
    global.fetch = undefined as any;
  });
});