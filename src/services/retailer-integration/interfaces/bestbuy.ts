export interface BestBuyProductResponse {
  sku: string;
  name: string;
  salePrice: number;
  regularPrice: number;
  categoryPath: string[];
  modelNumber: string;
  description: string;
  manufacturer: string;
  image: string;
  inStoreAvailability: boolean;
  onlineAvailability: boolean;
}


export interface BestBuyConfig {
  apiKey: string;
  baseUrl: string;
  rateLimit: number;
  testMode?: boolean;
}