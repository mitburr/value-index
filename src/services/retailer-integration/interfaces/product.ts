export interface Product {
  id: string;
  retailerId: string;
  externalId: string;
  name: string;
  category: string;
  attributes: Record<string, unknown>;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

