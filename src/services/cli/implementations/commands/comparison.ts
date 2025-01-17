// implementations/commands/comparison.ts
import { Command } from '../../interfaces/command';
import { ComparisonResponse } from '../../types/responses';
import { Retailer } from '../../../retailer-integration/interfaces/retailer';

export class ComparisonCommand implements Command<ComparisonResponse> {
  constructor(private retailerServices: Map<string, Retailer>) {}

  description = 'Compare prices across retailers';
  usage = 'compare <query>';

  validate(...args: unknown[]): boolean {
    const [query] = args;
    return typeof query === 'string' && query.length > 0;
  }

  async execute(query: string): Promise<ComparisonResponse> {
    const results: Record<string, number> = {};
    let bestPrice = { retailer: '', price: Infinity };

    for (const [retailer, service] of this.retailerServices) {
      const response = await service.searchProducts({ query, pageSize: 1 });

      if (response.data?.[0]) {
        const price = response.data[0].attributes.regularPrice;
        results[retailer] = price;

        if (price < bestPrice.price) {
          bestPrice = { retailer, price };
        }
      }
    }

    return {
      type: 'comparison',
      query,
      results,
      bestPrice
    };
  }
}