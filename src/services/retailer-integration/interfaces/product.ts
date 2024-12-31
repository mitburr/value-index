export interface Product {
  id: string;
  retailerId: string;
  externalId: string;
  name: string;
  category: string;
  attributes: {
    manufacturer: string;
    modelNumber: string;
    description: string;
    image: string;
    regularPrice: number;
    inStoreAvailability: boolean;
    onlineAvailability: boolean;
    categoryPath: string[];
  };
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}