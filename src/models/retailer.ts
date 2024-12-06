// src/models/retailer.ts

export interface Retailer {
    id: string;              // UUID
    name: string;
    base_url: string;
    rate_limit: number;      // requests per minute
    createdAt: Date;
    updatedAt: Date;
  }
  
  // Type for creating a new retailer (without auto-generated fields)
  export type CreateRetailerInput = Omit<Retailer, 'id' | 'createdAt' | 'updatedAt'>;
  
  // Type for updating a retailer (all fields optional)
  export type UpdateRetailerInput = Partial<CreateRetailerInput>;