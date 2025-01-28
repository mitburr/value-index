// scripts/add-product.ts
import { Pool } from 'pg';
import { settings } from '../src/services/shared/config/settings';
import { logger } from '../src/services/shared/utils/logger';
import { TrackedProductRepository } from '../src/services/price-monitor/repositories/tracked-product-repository';

async function addTestProduct() {
    const pool = new Pool(settings.database);
    const productRepo = new TrackedProductRepository(pool);

    try {
        const product = await productRepo.create({
            sku: '6525421',  // iPhone 15 Pro Max SKU at Best Buy
            retailerId: settings.retailers.bestbuy.retailerId,
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