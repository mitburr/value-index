export interface Retailer {
    id: string;              // UUID
    name: string;
    base_url: string;
    rate_limit: number;      // requests per minute
    createdAt: Date;
    updatedAt: Date;
}
