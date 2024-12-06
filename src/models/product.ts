export interface Product {
    id: number;
    retailerId: number;
    externalId: string;
    name: string;
    category?: string;
    attributes: Record<string, unknown>;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}