// src/tests/mocks/mockPool.ts
import { Pool } from 'pg';

export class MockPool {
  private data: Map<string, any[]> = new Map();

  constructor() {
    this.data.set('retailers', []);
    this.data.set('products', []);
  }

  async query<T>(queryText: string, values: any[] = []): Promise<{ rows: T[] }> {
    // Simple query parser to mock database operations
    if (queryText.toLowerCase().includes('insert into retailers')) {
      const retailer = {
        id: `ret_${Math.random().toString(36).substr(2, 9)}`,
        name: values[0],
        base_url: values[1],
        rate_limit: values[2],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.data.get('retailers')?.push(retailer);
      return { rows: [retailer] as any };
    }

    if (queryText.toLowerCase().includes('insert into products')) {
      const product = {
        id: `prod_${Math.random().toString(36).substr(2, 9)}`,
        retailerId: values[0],
        externalId: values[1],
        name: values[2],
        category: values[3],
        attributes: values[4],
        active: values[5],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.data.get('products')?.push(product);
      return { rows: [product] as any };
    }

    // Add more query handlers as needed
    return { rows: [] };
  }
}

export const mockPool = new MockPool() as unknown as Pool;