import { Product } from './product';
import { HttpWarning } from '../../shared/types';

export interface RetailerService {
  readonly retailerId: string;
  searchProducts(params: {
    query?: string;
    category?: string;
    pageSize?: number;
    page?: number;
  }): Promise<{
    data?: Omit<Product, 'id' | 'retailerId' | 'createdAt' | 'updatedAt'>[];
    warning?: HttpWarning;
  }>;

  getProduct(sku: string): Promise<{
    data?: Omit<Product, 'id' | 'retailerId' | 'createdAt' | 'updatedAt'>;
    warning?: HttpWarning;
  }>;

  getCurrentPrice(sku: string): Promise<{
    data?: number;
    warning?: HttpWarning;
  }>;
}