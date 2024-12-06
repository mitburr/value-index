import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { logger } from '../../utils/logger';

export class TestDatabase {
  private static pool: Pool;

  static async initialize() {
    logger.startSection('Test Database Setup');
    
    const pool = new Pool({
      host: 'localhost',
      port: 5432,
      user: 'mitchell',
      database: 'postgres' // Connect to default db first
    });

    try {
      logger.info('Creating fresh test database', 'database');
      await pool.query('DROP DATABASE IF EXISTS price_tracker_test');
      await pool.query('CREATE DATABASE price_tracker_test');
      
      await pool.end();

      // Connect to new test database
      this.pool = new Pool({
        host: 'localhost',
        port: 5432,
        user: 'mitchell',
        database: 'price_tracker_test'
      });

      // Read and execute migration as a single statement
      logger.info('Running migrations', 'database');
      const migration = fs.readFileSync(
        path.join(__dirname, '../../db/migrations/001_initial_schema.sql'),
        'utf8'
      );
      
      // Execute entire migration file as one statement
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