import { RetailerService } from '../interfaces/retailerService';
import { Product } from '../interfaces/product';
import {BestBuyProductResponse, BestBuyConfig, BestBuyApiSearchResponse} from '../interfaces/bestbuy';
import { logger } from 'u/logger';
import { HttpWarning, HttpWarningFactory } from 'services/shared/types';
import {Pool} from "pg";

type ProductResponse<T> = Promise<{ data?: T; warning?: HttpWarning }>;

export class BestBuyService implements RetailerService {
  private requestQueue: (() => Promise<any>)[] = [];
  private isProcessingQueue = false;
  private readonly requestDelay = 3000;
  private _retailerId: string | null = null;

  constructor(
    private config: Omit<BestBuyConfig, 'retailerId'>,
    private pool: Pool
  ) {
    logger.info('BestBuy service initialized with 5 second request delay');
  }

  async initialize(): Promise<void> {
    try {
      const result = await this.pool.query<{ id: string }>(`
        SELECT id FROM retailers WHERE name = 'Best Buy' LIMIT 1
      `);

      if (result.rows.length === 0) {
        throw new Error('Best Buy retailer not found in database');
      }

      this._retailerId = result.rows[0].id;
      logger.info(`Initialized BestBuy service with retailer ID: ${this._retailerId}`);
    } catch (error) {
      logger.error(`Failed to initialize BestBuy service: ${error}`);
      throw error;
    }
  }

  get retailerId(): string {
    if (!this._retailerId) {
      throw new Error('BestBuy service not initialized');
    }
    return this._retailerId;
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
      const cleanSku = sku.replace('sku:', '');
      const baseUrl = `${this.config.baseUrl}/products(sku=${cleanSku})`;

      const url = new URL(baseUrl);
      url.searchParams.append('apiKey', this.config.apiKey);
      url.searchParams.append('format', 'json');
      url.searchParams.append('show', 'sku,name,manufacturer,modelNumber,description,image,regularPrice,inStoreAvailability,onlineAvailability,categoryPath');

      const debugUrl = url.toString().replace(this.config.apiKey, 'API_KEY');
      logger.debug(`Making request to Best Buy API: ${debugUrl}`);

      const response = await fetch(url.toString());
      const warning = HttpWarningFactory.checkResponse(response, 'Best Buy API');
      if (warning) {
        return { warning };
      }

      const data = await response.json() as BestBuyApiSearchResponse;

      if (!data.products || data.products.length === 0) {
        return { warning: HttpWarningFactory.NotFound('Product not found') };
      }

      return { data: this.mapToProduct(data.products[0]) };
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

        if (params.query?.toLowerCase().startsWith('sku:')) {
            const sku = params.query.split(':')[1].trim();
            // Direct SKU endpoint
            baseUrl = `${this.config.baseUrl}/products(sku=${sku})`;
        } else {
            // Use more specific search criteria
            baseUrl = `${this.config.baseUrl}/products(search=${params.query})`;
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

  async getCurrentPrice(sku: string): Promise<{ data?: number; warning?: HttpWarning }> {
    const formattedSku = sku.startsWith('sku:') ? sku : `sku:${sku}`;
    const result = await this.getProduct(formattedSku);
    if (result.warning) {
      return {warning: result.warning};
    }

    if (!result.data) {
      return {warning: HttpWarningFactory.NotFound('Product not found')};
    }

    return {data: result.data.attributes.regularPrice};
  }
}