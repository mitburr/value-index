// src/tests/services/price-monitor/tracked-product-repository.test.ts
import { describe, test, expect, beforeAll, beforeEach, afterEach, afterAll } from "bun:test";
import { TrackedProductRepository } from "services/price-monitor/repositories/tracked-product-repository.ts";
import { TestDatabase } from '../../utils/testDb';
import { Pool } from "pg";

describe("TrackedProductRepository", () => {
  let repo: TrackedProductRepository;
  let retailerId: string;

  // Using TypeScript's type inference for test fixtures
  const testValidationRules = {
    exactNameMatch: "iPhone 15 Pro Max",
    priceRange: {
      min: 999,
      max: 1299
    },
    requiredTerms: ["iPhone", "Pro Max"],
    excludedTerms: ["case", "AppleCare"]
  };

  beforeAll(async () => {
    await TestDatabase.initialize();
    const pool = TestDatabase.getPool();
    repo = new TrackedProductRepository(pool);
  });

  beforeEach(async () => {
    await TestDatabase.cleanTestData();  // Clear before each test

    const result = await TestDatabase.getPool().query<{ id: string }>(
      `INSERT INTO retailers (name, base_url, rate_limit)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [`Best Buy ${Date.now()}`, 'https://api.bestbuy.com/v1', 60]  // Unique name per test
    );
    retailerId = result.rows[0].id;
  });

  afterEach(async () => {
    await TestDatabase.getPool().query('DELETE FROM tracked_products');
    await TestDatabase.getPool().query('DELETE FROM retailers');
  });

  afterAll(async () => {
    await TestDatabase.cleanup();
  });

  test("should create tracked product", async () => {
    const product = await repo.create({
      sku: "6525421",
      retailerId,
      name: "iPhone 15 Pro Max",
      productId: '',
      validationRules: testValidationRules
    });

    expect(product.id).toBeDefined();
    expect(product.validationRules).toEqual(testValidationRules);
  });

  test("should enforce unique retailer-sku constraint", async () => {
    const createProduct = async () => repo.create({
      sku: "6525421",
      retailerId,
      name: "iPhone 15 Pro Max",
      productId: '',
      validationRules: testValidationRules
    });

    await createProduct();
    await expect(createProduct()).rejects.toThrow();
  });

  test("should update validation rules", async () => {
    const product = await repo.create({
      sku: "6525421",
      retailerId,
      name: "iPhone 15 Pro Max",
      productId: '',
      validationRules: testValidationRules
    });

    const newRules = {
      ...testValidationRules,
      priceRange: { min: 899, max: 1399 }
    };

    const updated = await repo.update(product.id, {
      validationRules: newRules
    });

    expect(updated?.validationRules).toEqual(newRules);
  });


  test("should find products by retailer", async () => {
    await Promise.all([
      repo.create({
        sku: "6525421",
        retailerId,
        name: "iPhone 15 Pro Max",
        productId: '',
        validationRules: testValidationRules
      }),
      repo.create({
        sku: "6525422",
        retailerId,
        name: "iPhone 15 Pro",
        productId: '',
        validationRules: { ...testValidationRules, exactNameMatch: "iPhone 15 Pro" }
      })
    ]);

    const products = await repo.findByRetailerId(retailerId);
    expect(products).toHaveLength(2);
    expect(products[0].validationRules).toBeDefined();
  });

  // Need to test validation rules in tracked-product-repository.test.ts
  test("should validate price ranges", async () => {
    const product = await repo.create({
      sku: "6525421",
      retailerId,
      name: "Test Product",
      productId: '',
      validationRules: {
        priceRange: { min: 100, max: 200 }
      }
    });

    expect(product.validationRules.priceRange.min).toBe(100);
  });
});