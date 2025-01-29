// scripts/setup-db.ts
import { Pool } from 'pg';
import { settings } from '../src/services/shared/config/settings';
import { logger } from '../src/services/shared/utils/logger';
import fs from 'fs';
import path from 'path';

async function setupDatabase() {
    logger.startSection('Database Setup');

    // First connect to postgres to create our database
    const initialPool = new Pool({
        ...settings.database,
        database: 'postgres'  // Connect to default db first
    });

    try {
        // Drop database if exists (for clean setup)
        await initialPool.query(`
            DROP DATABASE IF EXISTS ${settings.database.database}
        `);
        logger.info('Dropped existing database if it existed');

        // Create fresh database
        await initialPool.query(`
            CREATE DATABASE ${settings.database.database}
            WITH OWNER = ${settings.database.user}
        `);
        logger.success('Created fresh database');
    } finally {
        await initialPool.end();
    }

    // Connect to our actual database
    const pool = new Pool(settings.database);

    try {
        // Run migrations
        const migrationsPath = path.join(__dirname, '../src/services/shared/db/migrations');
        logger.info(`Looking for migrations in: ${migrationsPath}`);

        const migrations = fs.readdirSync(migrationsPath)
            .filter(f => f.endsWith('.sql'))
            .sort();

        logger.info(`Found migrations: ${migrations.join(', ')}`);

        for (const migration of migrations) {
            const sql = fs.readFileSync(path.join(migrationsPath, migration), 'utf8');
            await pool.query(sql);
            logger.info(`Executed migration: ${migration}`);
        }

        // Insert default retailers
        const result = await pool.query(`
            INSERT INTO retailers (name, base_url, rate_limit)
            VALUES ($1, $2, $3)
            ON CONFLICT (name) DO UPDATE 
            SET base_url = EXCLUDED.base_url,
                rate_limit = EXCLUDED.rate_limit,
                updated_at = CURRENT_TIMESTAMP
            RETURNING id, name
        `, [
            'Best Buy',
            settings.retailers.bestbuy.baseUrl,
            settings.retailers.bestbuy.rateLimit
        ]);

        const retailer = result.rows[0];
        logger.success(`Retailer ${retailer.name} configured with ID: ${retailer.id}`);

        // Insert any other necessary seed data here
        // ...

        logger.success('Database setup completed successfully');

    } catch (error) {
        logger.error(`Database setup failed: ${error instanceof Error ? error.message : String(error)}`);
        throw error;
    } finally {
        await pool.end();
    }
}

setupDatabase().catch(error => {
    logger.error(`Setup failed: ${error}`);
    process.exit(1);
});