// types/responses.ts
export type CommandResponse = SearchResponse | PriceHistoryResponse | ComparisonResponse;

export interface SearchResponse {
  type: 'search';
  retailer: string;
  products: {
    name: string;
    price: number;
    sku: string;
  }[];
}

export interface PriceHistoryResponse {
  type: 'priceHistory';
  sku: string;
  retailer: string;
  prices: {
    date: Date;
    price: number;
  }[];
}

export interface ComparisonResponse {
  type: 'comparison';
  query: string;
  results: Record<string, number>;
  bestPrice: {
    retailer: string;
    price: number;
  };
}