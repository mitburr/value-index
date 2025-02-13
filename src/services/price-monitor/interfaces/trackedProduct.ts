export type ValidationRule = {
 exactNameMatch?: string;
 priceRange?: {
   min: number;
   max: number;
 };
 requiredTerms?: string[];
 excludedTerms?: string[];
};

export interface TrackedProduct {
 id: string;
 sku: string;
 retailerId: string;
 productId: string,
 name: string;
 // Using discriminated union pattern for validation
 validationRules: ValidationRule;
 createdAt: Date;
 updatedAt: Date;
}

// Type guard for runtime validation
export function isValidPrice(price: number, rule?: ValidationRule['priceRange']): boolean {
 if (!rule) return true;
 return price >= rule.min && price <= rule.max;
}