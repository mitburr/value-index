import { Pool } from 'pg';
import { PriceRecord, CreatePriceRecord } from '../interfaces/price';
import { logger } from 'u/logger';

export class PriceRepository {
  constructor(private dbPool: Pool) {}

  async create(price: CreatePriceRecord): Promise<PriceRecord> {
    const query = `
      INSERT INTO price_history (
        product_id, price, currency, is_available, metadata
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING id, product_id, price, currency, is_available, metadata, timestamp
    `;

    const result = await this.dbPool.query<PriceRecord>(query, [
      price.productId,
      price.price,
      price.currency,
      price.isAvailable,
      JSON.stringify(price.metadata)
    ]);

    return result.rows[0];
  }

  async findLatestByProductId(productId: string): Promise<PriceRecord | null> {
    const query = `
      SELECT * FROM price_history
      WHERE product_id = $1
      ORDER BY timestamp DESC
      LIMIT 1
    `;

    const result = await this.dbPool.query<PriceRecord>(query, [productId]);
    return result.rows[0] || null;
  }

  async findByProductIdAndTimeRange(
    productId: string,
    start: Date,
    end: Date
  ): Promise<PriceRecord[]> {
    const query = `
      SELECT * FROM price_history
      WHERE product_id = $1
      AND timestamp BETWEEN $2 AND $3
      ORDER BY timestamp ASC
    `;

    const result = await this.dbPool.query<PriceRecord>(query, [productId, start, end]);
    return result.rows;
  }

  async getPriceChanges(
    productId: string,
    minChange: number = 0.01
  ): Promise<{ from: PriceRecord; to: PriceRecord; percentChange: number }[]> {
    const query = `
      WITH price_changes AS (
        SELECT
          id,
          product_id,
          price,
          timestamp,
          LAG(price) OVER (ORDER BY timestamp) as prev_price,
          LAG(id) OVER (ORDER BY timestamp) as prev_id
        FROM price_history
        WHERE product_id = $1
        ORDER BY timestamp
      )
      SELECT
        ph1.id as from_id,
        ph1.price as from_price,
        ph1.timestamp as from_timestamp,
        ph2.id as to_id,
        ph2.price as to_price,
        ph2.timestamp as to_timestamp
      FROM price_changes pc
      JOIN price_history ph1 ON ph1.id = pc.prev_id
      JOIN price_history ph2 ON ph2.id = pc.id
      WHERE ABS(pc.price - pc.prev_price) / pc.prev_price >= $2
    `;

    const result = await this.dbPool.query(query, [productId, minChange]);

    return result.rows.map(row => {
      const change: {
        from: PriceRecord;
        to: PriceRecord;
        percentChange: number;
      } = {
        from: {
          id: row.from_id,
          productId,
          price: row.from_price,
          timestamp: row.from_timestamp,
          currency: 'USD', // Adding missing required fields
          isAvailable: true,
          metadata: {}
        },
        to: {
          id: row.to_id,
          productId,
          price: row.to_price,
          timestamp: row.to_timestamp,
          currency: 'USD',
          isAvailable: true,
          metadata: {}
        },
        percentChange: ((row.to_price - row.from_price) / row.from_price) * 100
      };
      return change;
    });
  }
}