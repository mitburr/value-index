import { RetailerService } from '../interfaces/retailerService';
import { Product } from '../interfaces/product';
import { BestBuyProductResponse, BestBuySearchParams, BestBuyConfig } from '../interfaces/bestbuy';
import { logger } from 'u/logger';
import { HttpWarning, HttpWarningFactory } from 'services/shared/types';

type ProductResponse<T> = Promise<{ data?: T; warning?: HttpWarning }>;

export class BestBuyService implements RetailerService {
  private requestQueue: (() => Promise<any>)[] = [];
  private isProcessingQueue = false;
  private readonly requestDelay = 3000;

  constructor(private config: BestBuyConfig) {
    logger.info('BestBuy service initialized with 5 second request delay');
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

  private async processQueue() {
    if (this.isProcessingQueue) return;
    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (request) {
        try {
          await request();
        } catch (error) {
          logger.error(`Queue request error: ${error}`);
        }
        await new Promise(resolve => setTimeout(resolve, this.requestDelay));
      }
    }

    this.isProcessingQueue = false;
  }

  private async queueRequest<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      logger.info(`Added request to queue. Current queue length: ${this.requestQueue.length}`);
      this.processQueue();
    });
  }

  async getProduct(sku: string): ProductResponse<Omit<Product, 'id' | 'retailerId' | 'createdAt' | 'updatedAt'>> {
    return this.queueRequest(async () => {
      try {
        const url = new URL(`${this.config.baseUrl}/products/${sku}.json`);
        url.searchParams.append('apiKey', this.config.apiKey);
        url.searchParams.append('format', 'json');

        const response = await fetch(url.toString());
        const warning = HttpWarningFactory.checkResponse(response, 'Best Buy API');
        if (warning) {
          return { warning };
        }

        const data = await response.json() as BestBuyProductResponse;
        return { data: this.mapToProduct(data) };
      } catch (error) {
        logger.error(`Error fetching product from Best Buy: ${error}`);
        return { warning: HttpWarningFactory.UnknownHttpWarning(500, `Unexpected error: ${error}`) };
      }
    });
  }

  async searchProducts(params: { query?: string; category?: string; pageSize?: number; page?: number }):
    ProductResponse<Omit<Product, 'id' | 'retailerId' | 'createdAt' | 'updatedAt'>[]> {
    return this.queueRequest(async () => {
      try {
        let baseUrl = `${this.config.baseUrl}/products`;

        if (params.query) {
          baseUrl += `(search=${params.query})`;
        } else if (params.category) {
          baseUrl += `(categoryPath.name="${params.category}")`;
        }

        const url = new URL(baseUrl);
        url.searchParams.append('apiKey', this.config.apiKey);
        url.searchParams.append('format', 'json');
        url.searchParams.append('pageSize', (params.pageSize || 10).toString());
        url.searchParams.append('page', (params.page || 1).toString());
        url.searchParams.append('show', 'sku,name,manufacturer,modelNumber,description,image,regularPrice,inStoreAvailability,onlineAvailability,categoryPath');

        const debugUrl = url.toString().replace(this.config.apiKey, 'API_KEY');
        logger.info(`Making request to Best Buy API: ${debugUrl}`, 'debug');

        const response = await fetch(url.toString());
        const warning = HttpWarningFactory.checkResponse(response, 'Best Buy API');
        if (warning) {
          return { warning };
        }

        const data = await response.json() as { products: BestBuyProductResponse[] };
        return { data: data.products.map(product => this.mapToProduct(product)) };
      } catch (error) {
        logger.error(`Error searching products from Best Buy: ${error}`);
        return { warning: HttpWarningFactory.UnknownHttpWarning(500, `Unexpected error: ${error}`) };
      }
    });
  }

  async getCurrentPrice(sku: string): ProductResponse<number> {
    const result = await this.getProduct(sku);
    if (result.warning) {
      return { warning: result.warning };
    }

    if (!result.data) {
      return { warning: HttpWarningFactory.NotFound('Product not found') };
    }

    return { data: result.data.attributes.regularPrice };
  }

  get queueLength(): number {
    return this.requestQueue.length;
  }
}