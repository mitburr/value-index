import { describe, test, expect, beforeEach, afterEach, mock } from "bun:test";
import { BestBuyService } from 'services/retailer-integration/implementations/bestbuyRetailer';
import { BestBuyConfig } from 'services/retailer-integration/interfaces/bestbuy';
import { logger } from "u/logger.ts";

describe('BestBuyService', () => {
  let service: BestBuyService;

  const testConfig: BestBuyConfig = {
    apiKey: 'test-api-key',
    baseUrl: 'https://api.bestbuy.com/v1',
    rateLimit: 5 // 5 requests per minute for testing
  };

  const mockBestBuyProduct = {
    sku: 'test-sku-123',
    name: 'Test Product',
    salePrice: 99.99,
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
      global.fetch = mock((input: string | URL | Request, init?: RequestInit) =>
        Promise.resolve(new Response(
          JSON.stringify(mockBestBuyProduct),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        ))
      );

      const product = await service.getProduct('test-sku-123');
      logger.info('Product fetched: ' + JSON.stringify(product, null, 2), 'test');

      expect(product).toEqual({
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
    test('should search products with correct parameters', async () => {
      const fetchSpy = mock((input: string | URL | Request, init?: RequestInit) =>
        Promise.resolve(new Response(
          JSON.stringify({ products: [mockBestBuyProduct] }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        ))
      );
      global.fetch = fetchSpy;

      const searchParams = {
        query: 'laptop',
        category: 'Computers',
        page: 1,
        pageSize: 10
      };

      const results = await service.searchProducts(searchParams);
      logger.info('Search results: ' + JSON.stringify(results, null, 2), 'test');

      expect(fetchSpy).toHaveBeenCalled();
      const callUrl = new URL(fetchSpy.mock.calls[0][0] as string);
      expect(callUrl.searchParams.get('search')).toBe('laptop');
      expect(callUrl.searchParams.get('categoryPath')).toBe('Computers');
      expect(callUrl.searchParams.get('page')).toBe('1');
      expect(callUrl.searchParams.get('pageSize')).toBe('10');
    });

    test('should handle empty search results', async () => {
      global.fetch = mock((input: string | URL | Request, init?: RequestInit) =>
        Promise.resolve(new Response(
          JSON.stringify({ products: [] }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        ))
      );

      const results = await service.searchProducts({ query: 'nonexistent' });
      expect(results).toEqual([]);
    });
  });

  describe('rate limiting', () => {
  test('should respect rate limits with parallel requests', async () => {
    // Override the throttle delay for testing
    const TEST_DELAY = 1000; // 1 second instead of 60 seconds

    global.fetch = mock((input: string | URL | Request, init?: RequestInit) =>
      Promise.resolve(new Response(
        JSON.stringify(mockBestBuyProduct),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      ))
    );

    const startTime = Date.now();
    logger.info('Starting rate limit test');

    // Make 6 requests (with rate limit of 5)
    const requests = Array(6).fill(null).map((_, i) => {
      logger.info(`Initiating request ${i + 1}`);
      return service.getProduct(`sku${i}`);
    });

    await Promise.all(requests);

    const elapsed = Date.now() - startTime;
    logger.info(`All requests completed after ${elapsed}ms`);

    // Should take at least 1 second for the 6th request
    expect(elapsed).toBeGreaterThan(TEST_DELAY);
  }, 10000); // 10 second timeout
});

  describe('getCurrentPrice', () => {
    test('should return current price for existing product', async () => {
      global.fetch = mock((input: string | URL | Request, init?: RequestInit) =>
        Promise.resolve(new Response(
          JSON.stringify(mockBestBuyProduct),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        ))
      );

      const price = await service.getCurrentPrice('test-sku-123');
      logger.info(`Current price: ${price}`, 'test');
      expect(price).toBe(129.99);
    });

    test('should return null for non-existent product', async () => {
      global.fetch = mock((input: string | URL | Request, init?: RequestInit) =>
        Promise.resolve(new Response(
          'Not Found',
          { status: 404 }
        ))
      );

      const price = await service.getCurrentPrice('non-existent');
      expect(price).toBeNull();
    });
  });

  afterEach(() => {
    // Reset the global fetch mock after each test
    global.fetch = undefined as any;
  });
});