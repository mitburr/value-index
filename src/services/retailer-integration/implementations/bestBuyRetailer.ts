// src/services/retailer-integration/implementations/bestBuyService.ts

import { Product } from '../interfaces/product';
import { BestBuyProductResponse, BestBuySearchParams, BestBuyConfig } from '../interfaces/bestbuy';
import { logger } from '../../shared/utils/logger';

export class BestBuyService {
  private lastRequestTime: Date = new Date(0);

  constructor(private config: BestBuyConfig) {}

  private async throttleRequest(): Promise<void> {
    const now = new Date();
    const timeSinceLastRequest = now.getTime() - this.lastRequestTime.getTime();
    const minDelay = (60 * 1000) / this.config.rateLimit;

    if (timeSinceLastRequest < minDelay) {
      await new Promise(resolve => setTimeout(resolve, minDelay - timeSinceLastRequest));
    }

    this.lastRequestTime = new Date();
  }

  private mapToProduct(bestBuyProduct: BestBuyProductResponse): Omit<Product, 'id' | 'retailerId' | 'createdAt' | 'updatedAt'> {
    return {
      externalId: bestBuyProduct.sku,
      name: bestBuyProduct.name,
      category: bestBuyProduct.categoryPath[bestBuyProduct.categoryPath.length - 1] || 'Uncategorized',
      attributes: {
        manufacturer: bestBuyProduct.manufacturer,
        modelNumber: bestBuyProduct.modelNumber,
        description: bestBuyProduct.description,
        image: bestBuyProduct.image,
        regularPrice: bestBuyProduct.regularPrice,
        inStoreAvailability: bestBuyProduct.inStoreAvailability,
        onlineAvailability: bestBuyProduct.onlineAvailability,
        categoryPath: bestBuyProduct.categoryPath
      },
      active: bestBuyProduct.onlineAvailability
    };
  }

  async getProduct(sku: string): Promise<Omit<Product, 'id' | 'retailerId' | 'createdAt' | 'updatedAt'> | null> {
    try {
      await this.throttleRequest();

      const url = new URL(`${this.config.baseUrl}/products/${sku}.json`);
      url.searchParams.append('apiKey', this.config.apiKey);
      url.searchParams.append('format', 'json');

      const response = await fetch(url.toString());

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }

      const data = await response.json() as BestBuyProductResponse;
      return this.mapToProduct(data);

    } catch (error) {
      logger.error(`Error fetching product from Best Buy: ${error}`);
      throw error;
    }
  }

  async searchProducts(params: BestBuySearchParams): Promise<Omit<Product, 'id' | 'retailerId' | 'createdAt' | 'updatedAt'>[]> {
    try {
      await this.throttleRequest();

      const url = new URL(`${this.config.baseUrl}/products`);
      url.searchParams.append('apiKey', this.config.apiKey);
      url.searchParams.append('format', 'json');
      url.searchParams.append('pageSize', (params.pageSize || 10).toString());
      url.searchParams.append('page', (params.page || 1).toString());

      if (params.query) url.searchParams.append('search', params.query);
      if (params.category) url.searchParams.append('categoryPath', params.category);

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }

      const data = await response.json() as { products: BestBuyProductResponse[] };
      return data.products.map(this.mapToProduct);

    } catch (error) {
      logger.error(`Error searching products from Best Buy: ${error}`);
      throw error;
    }
  }

  async getCurrentPrice(sku: string): Promise<number | null> {
    const product = await this.getProduct(sku);
    return product ? (product.attributes as any).regularPrice : null;
  }
}