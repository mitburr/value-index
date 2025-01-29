import { describe, test, expect } from "bun:test";
import { settings } from "@/services/shared/config/settings";

describe("Settings Configuration", () => {
  describe("Database Settings", () => {
    test("should have correct database settings structure", () => {
      expect(settings.database).toBeDefined();
      expect(typeof settings.database.user).toBe('string');
      expect(typeof settings.database.password).toBe('string');
      expect(typeof settings.database.host).toBe('string');
      expect(typeof settings.database.port).toBe('number');
      expect(typeof settings.database.database).toBe('string');

      // Verify non-empty values
      expect(settings.database.user.length).toBeGreaterThan(0);
      expect(settings.database.password.length).toBeGreaterThan(0);
      expect(settings.database.host.length).toBeGreaterThan(0);
      expect(settings.database.database.length).toBeGreaterThan(0);
    });
  });

  describe("Retailer Settings", () => {
    test("should have correct Best Buy settings structure", () => {
      expect(settings.retailers.bestbuy).toBeDefined();
      expect(typeof settings.retailers.bestbuy.apiKey).toBe('string');
      expect(typeof settings.retailers.bestbuy.baseUrl).toBe('string');
      expect(typeof settings.retailers.bestbuy.rateLimit).toBe('number');

      // Verify non-empty values
      expect(settings.retailers.bestbuy.apiKey.length).toBeGreaterThan(0);
      expect(settings.retailers.bestbuy.baseUrl.length).toBeGreaterThan(0);
    });

    test("should have reasonable rate limit", () => {
      expect(settings.retailers.bestbuy.rateLimit).toBeGreaterThan(0);
      expect(settings.retailers.bestbuy.rateLimit).toBeLessThanOrEqual(60);
    });
  });

  describe("Settings Validation", () => {
    test("database URL should be properly formatted", () => {
      expect(settings.database.host).toMatch(/^[a-zA-Z0-9.-]+$/);
      expect(settings.database.port).toBeGreaterThan(0);
      expect(settings.database.port).toBeLessThan(65536); // Valid port range
    });

    test("Best Buy URL should be properly formatted", () => {
      expect(settings.retailers.bestbuy.baseUrl).toMatch(/^https?:\/\//);
      expect(settings.retailers.bestbuy.baseUrl.endsWith('/')).toBe(true);
    });
  });
});