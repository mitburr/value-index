// src/services/cli/index.ts
import { CommandRegistry } from './implementations/commandRegistry';
import { SearchCommand } from './implementations/commands/search';
import { BestBuyService } from '../retailer-integration/implementations/bestbuyRetailer';
import { settings } from '../shared/config/settings';
import { logger } from '../shared/utils/logger';
import {Product} from "services/retailer-integration/interfaces/product.ts";

async function startCLI() {
    const bestBuy = new BestBuyService({
        apiKey: settings.retailers.bestbuy.apiKey,
        baseUrl: settings.retailers.bestbuy.baseUrl,
        rateLimit: settings.retailers.bestbuy.rateLimit
    });

    const retailers = new Map([['bestbuy', bestBuy]]);
    const registry = new CommandRegistry(retailers);
    registry.register('search', new SearchCommand(retailers));

    logger.startSection('Price Tracker CLI');
    logger.list('Available Commands', registry.getCommands().map(cmd => ({
        command: cmd.name,
        usage: cmd.usage,
        description: cmd.description
    })));

    process.stdin.on('data', async (input: Buffer) => {
        const [command, ...args] = input.toString().trim().split(' ');

        try {
            const result = await registry.execute(command, args);
            if (Array.isArray(result.data)) {
                logger.list('Search Results', result.data.map(retailerResult => ({
                    retailer: retailerResult.retailer,
                    products: retailerResult.products.map((p: Omit<Product, 'id' | 'retailerId' | 'createdAt' | 'updatedAt'>) => ({
                        name: p.name,
                        price: p.attributes.regularPrice,
                        category: p.category
                    }))
                })), 'success');
            } else {
                logger.error(result.error || 'Unknown error');
            }
        } catch (error) {
            logger.error(`Command failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    });
}

startCLI().catch(error => {
    logger.error(`CLI startup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
});