// src/db/index.ts
import { Pool, PoolConfig, QueryResult } from 'pg';

// Type-safe config interface - all potential pg config options
interface DatabaseConfig extends PoolConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

// Singleton pattern with TypeScript private constructor
export class Database {
  private static instance: Database;
  private pool: Pool;

  private constructor(config: DatabaseConfig) {
    this.pool = new Pool(config);
  }

  // Type-safe generic query method
  public async query<T extends QueryResult>(text: string, params?: unknown[]): Promise<QueryResult<T>> {
    return this.pool.query(text, params);
  }

  // Singleton instance getter with explicit DatabaseConfig type
  public static getInstance(config: DatabaseConfig): Database {
    if (!Database.instance) {
      Database.instance = new Database(config);
    }
    return Database.instance;
  }
  public getPool(): Pool {
    return this.pool;
}
}

// Usage example with type inference
const config: DatabaseConfig = {
  host: 'localhost',
  port: 5432,
  database: 'price_tracker',
  user: 'mitchell',
  password: 'crashing27'
};

export const db = Database.getInstance(config);

