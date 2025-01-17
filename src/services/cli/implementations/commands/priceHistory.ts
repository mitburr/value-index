
// implementations/commands/priceHistory.ts
import { Command } from '../../interfaces/command';
import { PriceHistoryResponse } from '../../types/responses';
import { Retailer } from '../../../retailer-integration/interfaces/retailer';

export class PriceHistoryCommand implements Command<PriceHistoryResponse> {
  constructor(private retailerService: Retailer) {}

  description = 'Get price history for a product';
  usage = 'history <sku> <retailer>';

  validate(...args: unknown[]): boolean {
    const [sku, retailer] = args;
    return typeof sku === 'string' && typeof retailer === 'string';
  }

  async execute(sku: string, retailer: string): Promise<PriceHistoryResponse> {
    const response = await this.retailerService.getCurrentPrice(sku);

    if (response.warning) {
      throw new Error(response.warning.message);
    }

    return {
      type: 'priceHistory',
      sku,
      retailer,
      prices: [{
        date: new Date(),
        price: response.data || 0
      }]
    };
  }
}