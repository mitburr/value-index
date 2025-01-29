import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { logger } from 'u/logger.ts';
import { settings } from '@/services/shared/config/settings.ts';
import {search} from "u/file-name-search.ts";
import {FileNotFoundException, MultipleFilesFoundException} from "@/services/shared/types/errors";

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

    // Read and execute migrations
    logger.info('Running migrations', 'database');
    const migrations: string[] = [];
    let files: string[];

    try {
        files = await search.findDirectoryFiles('migrations');

        // Sort migrations numerically
        files.sort((a, b) => {
          const numA = parseInt(a.match(/\d+/)?.[0] || '0', 10)
          const numB = parseInt(b.match(/\d+/)?.[0] || '0', 10);
          return numA - numB;
        });

        logger.list('files found in the migrations directory', files);

        // Execute migrations in order
        for (const file of files) {
          const migration = fs.readFileSync(file, 'utf8');
          logger.debug(`Executing migration: ${migration.substring(0, 30)}...`);
          await this.pool.query(migration);
        }
      } catch (e) {
      if (e instanceof FileNotFoundException) {
        logger.error('Directory not found');
      } else {
        logger.error(`Error searching for directory: ${e instanceof Error ? e.message : String(e)}`);
      }
      throw e;
    }
  } catch (error) {
    logger.error(`Test database setup failed: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

  static async cleanup() {
  if (this.pool) {
    logger.info('Cleaning up test database', 'database');
    try {
      // Drop tables in correct dependency order
      await this.pool.query('DROP TABLE IF EXISTS price_history CASCADE');
      await this.pool.query('DROP TABLE IF EXISTS tracked_products CASCADE');
      await this.pool.query('DROP TABLE IF EXISTS scheduled_jobs CASCADE');
      await this.pool.query('DROP TABLE IF EXISTS retailers CASCADE');
      await this.pool.end();
      logger.success('Test database cleanup complete', 'database');
    } catch (error) {
      logger.error(`Cleanup failed: ${error instanceof Error ? error.message : String(error)}`);
    }
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
  // Order matters - delete child records first
  await this.pool.query('DELETE FROM price_history');
  await this.pool.query('DELETE FROM tracked_products');
  await this.pool.query('DELETE FROM products');
  await this.pool.query('DELETE FROM retailers');
}
}