// services/price-monitor/repositories/tracked-product-repository.ts
import { Pool, PoolClient } from 'pg';
import { TrackedProduct, ValidationRule } from '../interfaces/trackedProduct';
import { logger } from 'u/logger';

type CreateTrackedProduct = Omit<TrackedProduct, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateTrackedProduct = Partial<CreateTrackedProduct>;

export class TrackedProductRepository {
  constructor(private pool: Pool) {}

  private mapFromDb(row: any): TrackedProduct {
    logger.debug(`Mapping DB row: ${JSON.stringify(row)}`);
    const mapped = {
      ...row,
      validationRules: row.validation_rules,
      retailerId: row.retailer_id,
      productId: row.base_product_id || row.product_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
    logger.debug(`Mapped to: ${JSON.stringify(mapped)}`);
    return mapped;
  }

  async create(product: CreateTrackedProduct): Promise<TrackedProduct> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');
      logger.debug(`Creating product with data: ${JSON.stringify(product)}`);

      // First create base product record
      const productQuery = `
        INSERT INTO products (
          retailer_id, external_id, name, category, attributes, active
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `;

      const productResult = await client.query(productQuery, [
        product.retailerId,
        product.sku,
        product.name,
        'Uncategorized', // Default category
        JSON.stringify({}), // Empty attributes
        true // Active by default
      ]);

      const productId = productResult.rows[0].id;
      logger.debug(`Created base product with ID: ${productId}`);

      // Then create tracked product record
      const trackingQuery = `
        INSERT INTO tracked_products (
          sku, retailer_id, name, validation_rules, product_id
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;

      const trackingResult = await client.query(trackingQuery, [
        product.sku,
        product.retailerId,
        product.name,
        product.validationRules,
        productId
      ]);

      await client.query('COMMIT');
      const result = this.mapFromDb({ ...trackingResult.rows[0], base_product_id: productId });
      logger.debug(`Created tracked product: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error(`Failed to create tracked product: ${error}`);
      throw error;
    } finally {
      client.release();
    }
  }

  async findByRetailerId(retailerId: string): Promise<TrackedProduct[]> {
    logger.debug(`Finding products for retailer: ${retailerId}`);
    const query = `
      SELECT tp.*, p.id as base_product_id
      FROM tracked_products tp
      JOIN products p ON tp.product_id = p.id
      WHERE tp.retailer_id = $1
      ORDER BY tp.created_at DESC
    `;

    const result = await this.pool.query(query, [retailerId]);
    logger.debug(`Found ${result.rows.length} products`);
    const mapped = result.rows.map(row => this.mapFromDb(row));
    logger.debug(`Mapped products: ${JSON.stringify(mapped)}`);
    return mapped;
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

  async findById(id: string): Promise<TrackedProduct | null> {
    logger.debug(`Finding product by ID: ${id}`);
    const query = `
      SELECT tp.*, p.id as base_product_id
      FROM tracked_products tp
      JOIN products p ON tp.product_id = p.id
      WHERE tp.id = $1
      LIMIT 1
    `;

    const result = await this.pool.query(query, [id]);
    if (result.rows[0]) {
      const mapped = this.mapFromDb(result.rows[0]);
      logger.debug(`Found and mapped product: ${JSON.stringify(mapped)}`);
      return mapped;
    }
    logger.debug('No product found');
    return null;
  }

  private toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}