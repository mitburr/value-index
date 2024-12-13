import { describe, test, expect } from "bun:test";
import { settings } from "@/services/shared/config/settings";

describe("Settings Configuration", () => {
  test("should load database settings correctly", () => {
    // Test database configuration completeness
    expect(settings.database).toBeDefined();
    expect(typeof settings.database.user).toBe("string");
    expect(typeof settings.database.password).toBe("string");
    expect(typeof settings.database.host).toBe("string");
    expect(typeof settings.database.port).toBe("number");
    expect(typeof settings.database.database).toBe("string");
  });

  test("should load test database settings correctly", () => {
    // Test test database configuration completeness
    expect(settings.testDatabase).toBeDefined();
    expect(typeof settings.testDatabase.user).toBe("string");
    expect(typeof settings.testDatabase.password).toBe("string");
    expect(typeof settings.testDatabase.host).toBe("string");
    expect(typeof settings.testDatabase.port).toBe("number");
    expect(typeof settings.testDatabase.database).toBe("string");
  });

  test("should have different databases for test and production", () => {
    // Ensure we don't accidentally use production DB in tests
    expect(settings.database.database).not.toBe(settings.testDatabase.database);
  });

  test("should load logging settings with defaults", () => {
    expect(settings.logging).toBeDefined();
    expect(settings.logging.level).toBeDefined();
    expect(settings.logging.file).toBeDefined();
  });
});