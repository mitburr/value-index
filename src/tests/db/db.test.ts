import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { TestDatabase } from '../utils/testDb.ts';
import { Pool } from 'pg';
import { logger } from '../../services/shared/utils/logger.ts';

describe('Database', () => {
  let pool: Pool;

  beforeAll(async () => {
    logger.startSection('Database Connection Tests');
    await TestDatabase.initialize();
    pool = TestDatabase.getPool();
  });

  afterAll(async () => {
    await TestDatabase.cleanup();
    logger.endSection('Database Connection Tests');
  });

  test('should connect to database', async () => {
    logger.info('Testing database connection', 'test');
    
    const result = await pool.query('SELECT version()');
    expect(result.rows[0]).toBeDefined();
    logger.success('Successfully connected to database', 'test');
  });

  test('should create and query data', async () => {
    logger.info('Testing basic CRUD operations', 'test');

    // Test INSERT
    await pool.query(`
      INSERT INTO retailers (name, base_url, rate_limit)
      VALUES ($1, $2, $3)
    `, ['Test Retailer', 'http://test.com', 60]);

    // Test SELECT
    const result = await pool.query('SELECT * FROM retailers');
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].name).toBe('Test Retailer');

    logger.success('Successfully performed CRUD operations', 'test');
  });

  test('should handle transactions', async () => {
    logger.info('Testing transaction support', 'test');

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      await client.query(`
        INSERT INTO retailers (name, base_url, rate_limit)
        VALUES ($1, $2, $3)
      `, ['Transaction Test', 'http://test.com', 60]);

      // Simulate a condition that should rollback
      const shouldRollback = true;
      if (shouldRollback) {
        await client.query('ROLLBACK');
      } else {
        await client.query('COMMIT');
      }

      // Verify rollback worked
      const result = await client.query(
        "SELECT * FROM retailers WHERE name = 'Transaction Test'"
      );
      expect(result.rows.length).toBe(0);
      
      logger.success('Successfully tested transaction support', 'test');
    } finally {
      client.release();
    }
  });
});