// src/services/retailer-integration/implementations/bestbuyService.ts

import { Product } from '../interfaces/product';
import { BestBuyProductResponse, BestBuySearchParams, BestBuyConfig } from '../interfaces/bestbuy';
import { Semaphore } from 'u/semaphore.ts';
import { logger } from 'u/logger.ts';
import { HttpWarningFactory } from 'services/shared/types';

export class BestBuyService {
  private semaphore: Semaphore;
  private permits: Map<number, Timer> = new Map();
  private permitCounter = 0;

  constructor(private config: BestBuyConfig) {
    // Enable debug logging only in test mode
    this.semaphore = new Semaphore(config.rateLimit, config.testMode);
    if (config.testMode) {
      logger.info(`BestBuy service initialized with rate limit: ${config.rateLimit}`);
    }
  }

  private async throttleRequest(): Promise<void> {
    // logger.info(`Request ${this.permitCounter} attempting to acquire permit`);
    await this.semaphore.acquire();

    const permitId = this.permitCounter++;
    // logger.info(`Setting up permit release timer for request ${permitId}`);

    const delay = process.env.NODE_ENV === 'test' ? 1000 : 60 * 1000;

    const timeout = setTimeout(() => {
      // logger.info(`Timer expired for permit ${permitId}, releasing`);
      this.semaphore.release();
      this.permits.delete(permitId);
      // logger.info(`Permit ${permitId} has been released`);
    }, delay);

    this.permits.set(permitId, timeout);
    // logger.info(`Permit ${permitId} issued and tracked`);
}

  public cleanup(): void {
    logger.info(`Cleaning up ${this.permits.size} permits`);
    for (const timeout of this.permits.values()) {
      clearTimeout(timeout);
    }
    this.permits.clear();
    logger.info('All permits cleaned up');
  }

  private mapToProduct(bestbuyProduct: BestBuyProductResponse): Omit<Product, 'id' | 'retailerId' | 'createdAt' | 'updatedAt'> {
    return {
      externalId: bestbuyProduct.sku,
      name: bestbuyProduct.name,
      category: bestbuyProduct.categoryPath[bestbuyProduct.categoryPath.length - 1] || 'Uncategorized',
      attributes: {
        manufacturer: bestbuyProduct.manufacturer,
        modelNumber: bestbuyProduct.modelNumber,
        description: bestbuyProduct.description,
        image: bestbuyProduct.image,
        regularPrice: bestbuyProduct.regularPrice,
        inStoreAvailability: bestbuyProduct.inStoreAvailability,
        onlineAvailability: bestbuyProduct.onlineAvailability,
        categoryPath: bestbuyProduct.categoryPath
      },
      active: bestbuyProduct.onlineAvailability
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