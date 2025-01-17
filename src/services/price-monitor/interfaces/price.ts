export interface PriceRecord {
  id: string;
  productId: string;
  price: number;
  currency: string;
  isAvailable: boolean;
  metadata: Record<string, unknown>;
  timestamp: Date;
}

export type CreatePriceRecord = Omit<PriceRecord, 'id' | 'timestamp'>;