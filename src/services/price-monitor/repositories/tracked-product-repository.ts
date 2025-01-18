// services/price-monitor/repositories/tracked-product-repository.ts
import { Pool } from 'pg';
import { TrackedProduct, ValidationRule } from '../interfaces/trackedProduct';
import { logger } from 'u/logger';

type CreateTrackedProduct = Omit<TrackedProduct, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateTrackedProduct = Partial<CreateTrackedProduct>;

export class TrackedProductRepository {
  constructor(private pool: Pool) {}  // Constructor injection for pool

  private mapFromDb(row: any): TrackedProduct {
    return {
      ...row,
      validationRules: row.validation_rules,
      retailerId: row.retailer_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  async create(product: CreateTrackedProduct): Promise<TrackedProduct> {
    const query = `
      INSERT INTO tracked_products (sku, retailer_id, name, validation_rules)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const result = await this.pool.query(query, [
      product.sku,
      product.retailerId,
      product.name,
      product.validationRules
    ]);

    return this.mapFromDb(result.rows[0]);
  }

  async findByRetailerId(retailerId: string): Promise<TrackedProduct[]> {
    const query = `
      SELECT * FROM tracked_products
      WHERE retailer_id = $1
      ORDER BY created_at DESC
    `;

    const result = await this.pool.query(query, [retailerId]);
    return result.rows.map(this.mapFromDb);
  }

  async update(id: string, updates: UpdateTrackedProduct): Promise<TrackedProduct | null> {
    const updateFields: string[] = [];
    const values: any[] = [id];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${this.toSnakeCase(key)} = $${++paramCount}`);
        values.push(key === 'validationRules' ? value : value);
      }
    });

    if (!updateFields.length) return null;

    const query = `
      UPDATE tracked_products
      SET ${updateFields.join(', ')}
      WHERE id = $1
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    return result.rows[0] ? this.mapFromDb(result.rows[0]) : null;
  }

  private toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  async findById(id: string): Promise<TrackedProduct | null> {
  const query = `
    SELECT * FROM tracked_products
    WHERE id = $1
    LIMIT 1
  `;

  const result = await this.pool.query<TrackedProduct>(query, [id]);
  return result.rows[0] ? this.mapFromDb(result.rows[0]) : null;
}
}