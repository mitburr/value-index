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

        // Insert retailer
        const result = await pool.query(`
            INSERT INTO retailers (name, base_url, rate_limit)
            VALUES ($1, $2, $3)
            ON CONFLICT (name) DO UPDATE 
            SET base_url = $2, rate_limit = $3
            RETURNING id
        `, ['Best Buy', 'https://api.bestbuy.com/v1', 60]);

        const retailerId = result.rows[0].id;
        logger.success(`Retailer created/updated with ID: ${retailerId}`);

        // Update .env file
        const envPath = path.join(__dirname, '../.env');
        let envContent = fs.readFileSync(envPath, 'utf8');

        if (envContent.includes('BESTBUY_RETAILER_ID=')) {
            envContent = envContent.replace(
                /BESTBUY_RETAILER_ID=.*/,
                `BESTBUY_RETAILER_ID=${retailerId}`
            );
        } else {
            envContent += `\nBESTBUY_RETAILER_ID=${retailerId}\n`;
        }

        fs.writeFileSync(envPath, envContent);
        logger.success('Updated .env file with retailer ID');

    } finally {
        await pool.end();
    }
}

setupDatabase().catch(error => {
    logger.error(`Setup failed: ${error}`);
    process.exit(1);
});