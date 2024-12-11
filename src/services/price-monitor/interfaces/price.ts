// src/models/price.ts

export interface PriceHistory {
    id: string;              // UUID
    productId: string;       // UUID reference to product
    price: number;
    currency: string;        // 3-letter currency code
    isAvailable: boolean;
    metadata: Record<string, unknown>;  // JSONB data
    timestamp: Date;
  }
  
  // Type for creating a new price history entry
  export type CreatePriceHistoryInput = Omit<PriceHistory, 'id' | 'timestamp'>;
  
  // Type for price analysis
  export interface PriceAnalysis {
    averagePrice: number;
    lowestPrice: number;
    highestPrice: number;
    priceChange: number;     // Percentage change from first to last price
    availability: number;    // Percentage of time product was available
  }