// src/tests/scripts/verify-env.test.ts
import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { verifyEnv } from "@/services/shared/utils/verify-env";

describe("Environment Verification", () => {
  // Store original env variables
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Clear all environment variables we care about
    ['POSTGRES_USER', 'POSTGRES_PASSWORD', 'POSTGRES_HOST', 'POSTGRES_PORT', 'POSTGRES_DB', 'POSTGRES_TEST_DB']
      .forEach(key => {
        delete process.env[key];
      });
  });

  afterEach(() => {
    // Restore original environment variables
    process.env = { ...originalEnv };
  });

  describe("Required Variables", () => {
    test("should pass when all required variables are present", async () => {
      process.env.POSTGRES_USER = "test_user";
      process.env.POSTGRES_PASSWORD = "test_password";
      process.env.POSTGRES_HOST = "localhost";
      process.env.POSTGRES_PORT = "5432";
      process.env.POSTGRES_DB = "test_db";
      process.env.POSTGRES_TEST_DB = "test_db_test";

      await expect(verifyEnv(true)).resolves.toBeUndefined();
    });

    test("should throw error when POSTGRES_USER is missing", async () => {
      process.env.POSTGRES_PASSWORD = "test_password";
      process.env.POSTGRES_HOST = "localhost";
      process.env.POSTGRES_PORT = "5432";
      process.env.POSTGRES_DB = "test_db";
      process.env.POSTGRES_TEST_DB = "test_db_test";

      await expect(verifyEnv(true)).rejects.toThrow();
    });

    test("should throw error when POSTGRES_PASSWORD is missing", async () => {
      process.env.POSTGRES_USER = "test_user";
      process.env.POSTGRES_HOST = "localhost";
      process.env.POSTGRES_PORT = "5432";
      process.env.POSTGRES_DB = "test_db";
      process.env.POSTGRES_TEST_DB = "test_db_test";

      await expect(verifyEnv(true)).rejects.toThrow();
    });

    test("should throw error when multiple variables are missing", async () => {
      process.env.POSTGRES_PORT = "5432";
      process.env.POSTGRES_DB = "test_db";

      await expect(verifyEnv(true)).rejects.toThrow();
    });
  });

  describe("Error Handling", () => {
    test("should handle empty environment variables", async () => {
      process.env.POSTGRES_USER = "";
      process.env.POSTGRES_PASSWORD = "test_password";
      process.env.POSTGRES_HOST = "localhost";
      process.env.POSTGRES_PORT = "5432";
      process.env.POSTGRES_DB = "test_db";
      process.env.POSTGRES_TEST_DB = "test_db_test";

      await expect(verifyEnv(true)).rejects.toThrow();
    });

    test("should handle undefined environment variables", async () => {
      process.env.POSTGRES_PASSWORD = "test_password";
      process.env.POSTGRES_HOST = "localhost";
      process.env.POSTGRES_PORT = "5432";
      process.env.POSTGRES_DB = "test_db";
      process.env.POSTGRES_TEST_DB = "test_db_test";

      await expect(verifyEnv(true)).rejects.toThrow();
    });
  });

  describe("Variable Formats", () => {
    test("should accept valid database names", async () => {
      process.env.POSTGRES_USER = "test_user";
      process.env.POSTGRES_PASSWORD = "test_password";
      process.env.POSTGRES_HOST = "localhost";
      process.env.POSTGRES_PORT = "5432";
      process.env.POSTGRES_DB = "valid_database_name_123";
      process.env.POSTGRES_TEST_DB = "valid_test_db_name_123";

      await expect(verifyEnv(true)).resolves.toBeUndefined();
    });

    test("should accept various host formats", async () => {
      const validHosts = [
        "localhost",
        "127.0.0.1",
        "db.example.com",
        "test-db.local"
      ];

      for (const host of validHosts) {
        process.env.POSTGRES_USER = "test_user";
        process.env.POSTGRES_PASSWORD = "test_password";
        process.env.POSTGRES_HOST = host;
        process.env.POSTGRES_PORT = "5432";
        process.env.POSTGRES_DB = "test_db";
        process.env.POSTGRES_TEST_DB = "test_db_test";

        await expect(verifyEnv(true)).resolves.toBeUndefined();
      }
    });
  });
});