import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { logger } from '../../utils/logger';
import { settings } from '../../config/settings';

export class TestDatabase {
  private static pool: Pool;

  static async initialize() {
    logger.startSection('Test Database Setup');

    // Connect to default postgres database first to create test database
    const pool = new Pool({
      ...settings.database,
      database: 'postgres'  // Override database name temporarily
    });

    try {
      logger.info('Creating fresh test database', 'database');
      await pool.query(`DROP DATABASE IF EXISTS ${settings.testDatabase.database}`);
      await pool.query(`CREATE DATABASE ${settings.testDatabase.database}`);

      await pool.end();

      // Connect to newly created test database
      this.pool = new Pool(settings.testDatabase);

      // Read and execute migration
      logger.info('Running migrations', 'database');
      const migration = fs.readFileSync(
        path.join(__dirname, '../../db/migrations/001_initial_schema.sql'),
        'utf8'
      );

      await this.pool.query(migration);
      logger.success('Test database ready', 'database');
    } catch (error) {
      logger.error(`Test database setup failed: ${error}`);
      throw error;
    }
  }

  static async cleanup() {
    if (this.pool) {
      logger.info('Cleaning up test database', 'database');
      // Clean up in reverse order of dependencies
      await this.pool.query('DROP TABLE IF EXISTS price_history');
      await this.pool.query('DROP TABLE IF EXISTS products');
      await this.pool.query('DROP TABLE IF EXISTS retailers');
      await this.pool.end();
      logger.success('Test database connection closed', 'database');
    }
  }

  static getPool(): Pool {
    if (!this.pool) {
      logger.error('Test database not initialized');
      throw new Error('Test database not initialized');
    }
    return this.pool;
  }

  // Helper method for cleaning test data between tests
  static async cleanTestData() {
    logger.debug('Cleaning test data', 'database');
    await this.pool.query('DELETE FROM price_history');
    await this.pool.query('DELETE FROM products');
    await this.pool.query('DELETE FROM retailers');
  }
}