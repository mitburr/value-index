import { expect, test, describe, beforeAll, beforeEach, afterEach, afterAll } from "bun:test";
import { ProductRepository } from "../db/repositories/products";
import { Product } from "../models/product";
import { TestDatabase } from './utils/testDb';

describe("ProductRepository", () => {
  let repo: ProductRepository;
  let retailerId: number;

  // Type for test data with readonly properties
  type TestRetailer = Readonly<{
    name: string;
    base_url: string;
    rate_limit: number;
  }>;

  const testRetailer: TestRetailer = {
    name: "Test Retailer",
    base_url: "http://test.com",
    rate_limit: 60
  };

  // Using Pick and Omit for precise type control
  type CreateProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;

  // Initialize test database once before all tests
  beforeAll(async () => {
    await TestDatabase.initialize();
  });

  // Clean up database connection after all tests
  afterAll(async () => {
    await TestDatabase.cleanup();
  });

  beforeEach(async () => {
    // Get fresh repository instance with test pool
    repo = new ProductRepository(TestDatabase.getPool());
    
    // Insert test retailer
    const result = await repo.dbPool.query<{ id: number }>(
      `INSERT INTO retailers (name, base_url, rate_limit)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [testRetailer.name, testRetailer.base_url, testRetailer.rate_limit]
    );
    retailerId = result.rows[0].id;
  });

  afterEach(async () => {
    // Clean up test data
    await TestDatabase.getPool().query('DELETE FROM products');
    await TestDatabase.getPool().query('DELETE FROM retailers');
  });

  test("should handle duplicate external IDs", async () => {
    const product: CreateProductInput = {
      retailerId,
      externalId: "DUPLICATE",
      name: "Test Product",
      category: "Test Category",
      attributes: { color: "blue" },
      active: true
    };

    await repo.create(product);
    
    // Using unknown type for error handling
    const duplicateAttempt = repo.create(product) as Promise<unknown>;
    await expect(duplicateAttempt).rejects.toThrow();
  });

  test("should find products by category", async () => {
    // Using Record utility type for attributes
    type ProductAttributes = Record<string, string>;
    
    const products = await Promise.all([
      repo.create({
        retailerId,
        externalId: "CAT1",
        name: "Product 1",
        category: "Electronics",
        attributes: { type: "laptop" } as ProductAttributes,
        active: true
      }),
      repo.create({
        retailerId,
        externalId: "CAT2",
        name: "Product 2",
        category: "Electronics",
        attributes: { type: "phone" } as ProductAttributes,
        active: true
      })
    ]);

    const found = await repo.findByCategory("Electronics");
    expect(found.length).toBe(2);
  });

  test("should handle product deactivation", async () => {
    const product = await repo.create({
      retailerId,
      externalId: "DEACTIVATE",
      name: "Test Product",
      category: "Test",
      attributes: {},
      active: true
    });

    const deactivated = await repo.update(product.id, { active: false });
    expect(deactivated?.active).toBe(false);
  });
});