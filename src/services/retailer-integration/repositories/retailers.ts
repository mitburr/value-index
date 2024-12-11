import { Pool } from 'pg';
import { Retailer } from '../interfaces/retailer';

export class RetailerRepository {
  constructor(protected dbPool: Pool) {}

  async create(retailer: Omit<Retailer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Retailer> {
    const result = await this.dbPool.query<Retailer>(
      `INSERT INTO retailers (name, base_url, rate_limit)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [retailer.name, retailer.base_url, retailer.rate_limit]
    );
    return result.rows[0];
  }

  async findById(id: string): Promise<Retailer | null> {
    const result = await this.dbPool.query<Retailer>(
      'SELECT * FROM retailers WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async findByName(name: string): Promise<Retailer | null> {
    const result = await this.dbPool.query<Retailer>(
      'SELECT * FROM retailers WHERE name = $1',
      [name]
    );
    return result.rows[0] || null;
  }

  async update(id: string, updates: Partial<Retailer>): Promise<Retailer | null> {
    const setClause = Object.entries(updates)
      .map(([key, _], i) => `${key} = $${i + 2}`)
      .join(', ');
    
    const result = await this.dbPool.query<Retailer>(
      `UPDATE retailers SET ${setClause} WHERE id = $1 RETURNING *`,
      [id, ...Object.values(updates)]
    );
    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.dbPool.query(
      'DELETE FROM retailers WHERE id = $1',
      [id]
    );
    return result.rowCount > 0;
  }
}