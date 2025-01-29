// scripts/health-check.ts
import { ProductRepository } from "services/retailer-integration/repositories/product-repository";
import { PriceRepository } from "services/price-monitor/repositories/price-repository";
import { logger } from "u/logger";
import { Pool } from 'pg';

// Update interfaces to match your schema
interface Product {
  id: string; // UUID
  retailer_id: string; // UUID
  external_id: string;
  name: string;
  category: string | null;
  attributes: Record<string, unknown>;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface Price {
  id: string; // UUID
  product_id: string; // UUID
  price: number;
  currency: string;
  is_available: boolean;
  metadata: Record<string, unknown>;
  timestamp: Date;
}

async function checkHealth(): Promise<void> {
  const dbConfig = {
    user: process.env.POSTGRES_USER || 'mitchell',
    password: process.env.POSTGRES_PASSWORD || 'crashing27',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB || 'price_tracker',
  };

  const pool = new Pool(dbConfig);

  try {
    // Test connection
    await pool.query('SELECT NOW()');
    logger.info('Successfully connected to database');

    // Get active products and their tracked status
    const result = await pool.query<Product & { sku: string }>(`
      SELECT p.*, tp.sku
      FROM products p
      LEFT JOIN tracked_products tp ON p.id = tp.product_id
      WHERE p.active = true
    `);
    const activeProducts = result.rows;
    logger.info(`Found ${activeProducts.length} active products`);

    // Get recent prices
    const lastHour = new Date(Date.now() - 60 * 60 * 1000);
    const pricesResult = await pool.query<Price>(`
      SELECT *
      FROM price_history
      WHERE timestamp > $1
      ORDER BY timestamp DESC
    `, [lastHour]);
    const recentPrices = pricesResult.rows;
    logger.info(`Found ${recentPrices.length} prices from the last hour`);

    // Create set of product IDs with recent prices
    const productsWithRecentPrices = new Set(
      recentPrices.map((p: Price) => p.product_id)
    );

    // Find products missing recent prices
    const missingPrices = activeProducts.filter(
      (p: Product & { sku: string }) => !productsWithRecentPrices.has(p.id)
    );

    if (missingPrices.length > 0) {
      throw new Error(
        `Missing recent prices for products: ${
          missingPrices.map((p) => `${p.name} (${p.sku || p.external_id})`).join(", ")
        }`
      );
    }

    // Check scheduled jobs status
    const jobsResult = await pool.query(`
      SELECT *
      FROM scheduled_jobs
      WHERE status = 'running'
        AND last_run < NOW() - INTERVAL '1 hour'
    `);

    if (jobsResult.rows.length > 0) {
      logger.warn(`Found ${jobsResult.rows.length} jobs running for more than an hour`);
    }

    logger.info('Health check completed successfully');
    await pool.end();
    process.exit(0);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    logger.error(`Health check failed: ${errorMessage}`);
    await pool.end();
    process.exit(1);
  }
}

// Run the health check
checkHealth().catch((error: unknown) => {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
  logger.error(`Failed to execute health check: ${errorMessage}`);
  process.exit(1);
});