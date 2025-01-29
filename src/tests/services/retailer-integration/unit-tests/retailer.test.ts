import { describe, test, expect, beforeEach, afterEach, mock } from "bun:test";
import { BestBuyService } from 'services/retailer-integration/implementations/bestbuyRetailer';
import type { RetailerService } from 'services/retailer-integration/interfaces/retailerService';
import { BestBuyConfig } from 'services/retailer-integration/interfaces/bestbuy';

describe('BestBuyService Unit Tests', () => {
  let service: RetailerService;

  // Sample success response that matches BestBuyProductResponse interface
  const mockSuccessResponse = {
    from: 1,
    to: 1,
    currentPage: 1,
    total: 1,
    totalPages: 1,
    queryTime: "0.123",
    totalTime: "0.234",
    partial: false,
    products: [{
      sku: '6525421',
      name: 'Test Product',
      regularPrice: 129.99,
      salePrice: 119.99,
      categoryPath: ['Electronics', 'Computers', 'Laptops'],
      modelNumber: 'MODEL123',
      description: 'A test product description',
      manufacturer: 'Test Brand',
      image: 'http://test-image.jpg',
      inStoreAvailability: true,
      onlineAvailability: true
    }]
  };

  // Sample empty response
  const mockEmptyResponse = {
    from: 0,
    to: 0,
    currentPage: 1,
    total: 0,
    totalPages: 0,
    queryTime: "0.123",
    totalTime: "0.234",
    partial: false,
    products: []
  };

  beforeEach(() => {
    service = new BestBuyService({
      apiKey: 'test-key',
      baseUrl: 'https://test-url.com/v1',
      rateLimit: 5,
      retailerId: 'test-id',
      testMode: true
    });
  });

  describe('getProduct', () => {
    test('should fetch and map a product correctly', async () => {
      global.fetch = mock(() => Promise.resolve(
        new Response(
          JSON.stringify(mockSuccessResponse),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      ));

      const result = await service.getProduct('6525421');

      expect(result.warning).toBeUndefined();
      expect(result.data).toEqual({
        externalId: '6525421',
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

    test('should handle 404 responses', async () => {
      global.fetch = mock(() => Promise.resolve(
        new Response(
          JSON.stringify(mockEmptyResponse),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      ));

      const result = await service.getProduct('nonexistent');
      expect(result.warning).toBeDefined();
      expect(result.warning?.statusCode).toBe(404);
      expect(result.data).toBeUndefined();
    });

    test('should handle API errors gracefully', async () => {
      global.fetch = mock(() => Promise.resolve(
        new Response(
          'Internal Server Error',
          {
            status: 500,
            headers: { 'Content-Type': 'text/plain' }
          }
        )
      ));

      const result = await service.getProduct('6525421');
      expect(result.warning).toBeDefined();
      expect(result.warning?.statusCode).toBe(500);
      expect(result.data).toBeUndefined();
    });
  });

  describe('searchProducts', () => {
    test('should handle search with SKU', async () => {
      global.fetch = mock(() => Promise.resolve(
        new Response(
          JSON.stringify(mockSuccessResponse),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      ));

      const result = await service.searchProducts({
        query: 'sku:6525421',
        pageSize: 10
      });

      expect(result.warning).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(result.data?.[0].externalId).toBe('6525421');
    });

    test('should handle search by query', async () => {
      global.fetch = mock(() => Promise.resolve(
        new Response(
          JSON.stringify(mockSuccessResponse),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      ));

      const result = await service.searchProducts({
        query: 'laptop',
        pageSize: 10
      });

      expect(result.warning).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(result.data?.length).toBe(1);
    });

    test('should handle empty search results', async () => {
      global.fetch = mock(() => Promise.resolve(
        new Response(
          JSON.stringify(mockEmptyResponse),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      ));

      const result = await service.searchProducts({
        query: 'nonexistent',
        pageSize: 10
      });

      expect(result.warning).toBeUndefined();
      expect(result.data).toEqual([]);
    });
  });

  describe('getCurrentPrice', () => {
    test('should return current price for valid SKU', async () => {
      global.fetch = mock(() => Promise.resolve(
        new Response(
          JSON.stringify(mockSuccessResponse),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      ));

      const result = await service.getCurrentPrice('6525421');
      expect(result.warning).toBeUndefined();
      expect(result.data).toBe(129.99);
    });

    test('should handle non-existent SKUs', async () => {
      global.fetch = mock(() => Promise.resolve(
        new Response(
          JSON.stringify(mockEmptyResponse),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      ));

      const result = await service.getCurrentPrice('nonexistent');
      expect(result.warning).toBeDefined();
      expect(result.warning?.statusCode).toBe(404);
      expect(result.data).toBeUndefined();
    });
  });

  afterEach(() => {
    global.fetch = undefined as any;
  });
});