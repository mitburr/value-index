// scripts/add-products.ts
import { Pool } from 'pg';
import { settings } from '../src/services/shared/config/settings';
import { logger } from '../src/services/shared/utils/logger';
import { TrackedProductRepository } from '../src/services/price-monitor/repositories/tracked-product-repository';
import { bestBuyProducts } from '../src/services/price-monitor/data/tracked-products-data';

async function addProducts() {
    const pool = new Pool(settings.database);

    try {
        // Get the Best Buy retailer ID
        const retailerResult = await pool.query(`
            SELECT id FROM retailers WHERE name = 'Best Buy' LIMIT 1
        `);

        if (retailerResult.rows.length === 0) {
            throw new Error('Best Buy retailer not found in database');
        }

        const retailerId = retailerResult.rows[0].id;
        logger.info(`Found Best Buy retailer ID: ${retailerId}`);

        const productRepo = new TrackedProductRepository(pool);
        let successCount = 0;
        let failureCount = 0;

        // Add each product from the configuration
        for (const productConfig of bestBuyProducts) {
            try {
                const product = await productRepo.create({
                    sku: productConfig.sku,
                    retailerId: retailerId,
                    name: productConfig.name,
                    productId: '', // This will be populated later during price polling
                    validationRules: productConfig.validationRules
                });

                logger.success(`✓ Added product: ${product.name} (SKU: ${product.sku})`);
                successCount++;
            } catch (error) {
                logger.error(`✗ Failed to add product ${productConfig.name}: ${error}`);
                failureCount++;
            }
        }

        logger.info(`\nSummary:`);
        logger.success(`Successfully added ${successCount} products`);
        if (failureCount > 0) {
            logger.error(`Failed to add ${failureCount} products`);
        }
    } finally {
        await pool.end();
    }
}

addProducts().catch(error => {
    logger.error(`Failed to add products: ${error}`);
    process.exit(1);
});