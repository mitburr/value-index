import { Pool, PoolConfig, QueryResult } from 'pg';
import { settings } from '../config/settings';

// Type-safe config interface for database configuration
interface DatabaseConfig extends PoolConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

export class Database {
  private static instance: Database;
  private pool: Pool;

  private constructor(config: DatabaseConfig) {
    this.pool = new Pool(config);
  }

  public async query<T extends QueryResult>(text: string, params?: unknown[]): Promise<QueryResult<T>> {
    return this.pool.query(text, params);
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      // Use settings for database configuration
      Database.instance = new Database(settings.database);
    }
    return Database.instance;
  }

}

// Export singleton instance using settings
export const db = Database.getInstance();