// scripts/add-product.ts
import { Pool } from 'pg';
import { settings } from '../src/services/shared/config/settings';
import { logger } from '../src/services/shared/utils/logger';
import { TrackedProductRepository } from '../src/services/price-monitor/repositories/tracked-product-repository';

async function addTestProduct() {
    const pool = new Pool(settings.database);

    try {
        // First, get the current retailer ID from the database
        const retailerResult = await pool.query(`
            SELECT id FROM retailers WHERE name = 'Best Buy' LIMIT 1
        `);

        if (retailerResult.rows.length === 0) {
            throw new Error('Best Buy retailer not found in database');
        }

        const retailerId = retailerResult.rows[0].id;
        logger.info(`Found Best Buy retailer ID: ${retailerId}`);

        const productRepo = new TrackedProductRepository(pool);

        const product = await productRepo.create({
            sku: '6525421',  // iPhone 15 Pro Max SKU at Best Buy
            retailerId: retailerId, // Use the retailer ID from the database
            name: 'iPhone 15 Pro Max',
            productId: '',
            validationRules: {
                exactNameMatch: 'iPhone 15 Pro Max',
                priceRange: {
                    min: 900,
                    max: 1500
                }
            }
        });

        logger.success(`Added product: ${JSON.stringify(product, null, 2)}`);
    } finally {
        await pool.end();
    }
}

addTestProduct().catch(error => {
    logger.error(`Failed to add product: ${error}`);
    process.exit(1);
});