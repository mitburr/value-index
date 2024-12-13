import { Pool } from 'pg';
import { PriceHistory } from '../interfaces/price';

export class PriceHistoryRepository {
  constructor(protected dbPool: Pool) {}

  async create(priceHistory: Omit<PriceHistory, 'id' | 'timestamp'>): Promise<PriceHistory> {
    const result = await this.dbPool.query<PriceHistory>(
      `INSERT INTO price_history (product_id, price, currency, is_available, metadata)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        priceHistory.productId,
        priceHistory.price,
        priceHistory.currency,
        priceHistory.isAvailable,
        priceHistory.metadata
      ]
    );
    return result.rows[0];
  }

  async findByProductId(productId: string): Promise<PriceHistory[]> {
    const result = await this.dbPool.query<PriceHistory>(
      'SELECT * FROM price_history WHERE product_id = $1 ORDER BY timestamp DESC',
      [productId]
    );
    return result.rows;
  }

  async findLatestPrice(productId: string): Promise<PriceHistory | null> {
    const result = await this.dbPool.query<PriceHistory>(
      'SELECT * FROM price_history WHERE product_id = $1 ORDER BY timestamp DESC LIMIT 1',
      [productId]
    );
    return result.rows[0] || null;
  }

  async getPriceHistory(
    productId: string,
    startDate: Date,
    endDate: Date
  ): Promise<PriceHistory[]> {
    const result = await this.dbPool.query<PriceHistory>(
      `SELECT * FROM price_history 
       WHERE product_id = $1 
       AND timestamp BETWEEN $2 AND $3 
       ORDER BY timestamp`,
      [productId, startDate, endDate]
    );
    return result.rows;
  }

  async getAveragePrice(productId: string): Promise<number | null> {
    const result = await this.dbPool.query<{ avg_price: number }>(
      'SELECT AVG(price) as avg_price FROM price_history WHERE product_id = $1',
      [productId]
    );
    return result.rows[0]?.avg_price || null;
  }
}