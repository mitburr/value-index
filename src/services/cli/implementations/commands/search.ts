import {Command, CommandResult, SearchOptions} from '../../interfaces/command';
import { RetailerService } from '../../../retailer-integration/interfaces/retailerService';
import { Product } from '../../../retailer-integration/interfaces/product';

type SearchResult = {
  retailer: string;
  products: Omit<Product, 'id' | 'retailerId' | 'createdAt' | 'updatedAt'>[];
};

export class SearchCommand implements Command<SearchResult[]> {
  constructor(private retailers: Map<string, RetailerService>) {}

  usage = 'search [-r retailer] [-l limit] -p <...search terms>';
  description = 'Search products. Example: search -p iphone 15 pro -r bestbuy -l 5';

  private parseFlags(args: string[]): SearchOptions {
    let i = 0;
    const options: SearchOptions = { query: [] };

    while (i < args.length) {
      switch (args[i]) {
        case '-r':
          options.retailer = args[++i];
          break;
        case '-l':
          options.limit = parseInt(args[++i], 10);
          break;
        case '-p':
          i++;
          // Collect all terms until next flag or end
          while (i < args.length && !args[i].startsWith('-')) {
            options.query.push(args[i++]);
          }
          continue;
        default:
          throw new Error(`Unknown flag: ${args[i]}`);
      }
      i++;
    }

    return options;
  }

  validate(args: string[]): boolean {
    try {
      const options = this.parseFlags(args);
      return options.query.length > 0;
    } catch {
      return false;
    }
  }


  async execute(...args: string[]): Promise<CommandResult<SearchResult[]>> {
    try {
      const options = this.parseFlags(args);
      const query = options.query.join(' ');

      const targetRetailers = options.retailer
        ? [[options.retailer, this.retailers.get(options.retailer)]]
        : Array.from(this.retailers.entries());
      const results: SearchResult[] = [];

      if (retailerName) {
            const service = this.retailers.get(retailerName);
            if (!service) {
                return {
                    success: false,
                    error: `Retailer ${retailerName} not found`
                };
            }
            const response = await service.searchProducts({ query });
            if (response.data) {
                results.push({
                    retailer: retailerName,
                    products: response.data
                });
            }
        } else {
            // Handle all retailers
            for (const [name, service] of this.retailers) {
                const response = await service.searchProducts({ query });
                if (response.data) {
                    results.push({
                        retailer: name,
                        products: response.data
                    });
                }
            }
        }

        return {
            success: true,
            data: results
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}
}