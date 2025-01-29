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

export interface BestBuyApiSearchResponse {
  from: number;
  to: number;
  currentPage: number;
  total: number;
  totalPages: number;
  queryTime: string;
  totalTime: string;
  partial: boolean;
  products: BestBuyProductResponse[];
}


export interface BestBuyConfig {
  apiKey: string;
  baseUrl: string;
  rateLimit: number;
  retailerId: string;
  testMode?: boolean;
}