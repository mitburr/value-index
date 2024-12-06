import { Pool } from 'pg';
import { Product } from '../../models/product';

export class ProductRepository {
  constructor(protected dbPool: Pool) {}

  async create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const result = await this.dbPool.query<Product>(
      `INSERT INTO products (retailer_id, external_id, name, category, attributes, active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [product.retailerId, product.externalId, product.name, product.category, product.attributes, product.active]
    );
    return result.rows[0];
  }

  // Return type uses TypeScript's Promise generic
  async findByCategory(category: string): Promise<Product[]> {
    const result = await this.dbPool.query<Product>(
      `SELECT * FROM products WHERE category = $1`,
      [category]
    );
    return result.rows;
  }

  // Partial<T> lets us update only some fields
  async update(id: number, updates: Partial<Product>): Promise<Product | null> {
    const setClause = Object.entries(updates)
      .map(([key, _], i) => `${key} = $${i + 2}`)
      .join(', ');

    const result = await this.dbPool.query<Product>(
      `UPDATE products SET ${setClause} WHERE id = $1 RETURNING *`,
      [id, ...Object.values(updates)]
    );
    return result.rows[0] || null;
  }
}