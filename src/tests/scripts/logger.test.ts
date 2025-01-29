// src/tests/scripts/logger.test.ts
import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { logger } from "@/services/shared/utils/logger";

describe("Logger", () => {
  let messages: string[] = [];

  // Store original console methods
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;
  const originalDebug = console.debug;

  beforeEach(() => {
    messages = [];
    // Mock console methods
    console.log = (msg: string) => messages.push(msg);
    console.warn = (msg: string) => messages.push(msg);
    console.error = (msg: string) => messages.push(msg);
    console.debug = (msg: string) => messages.push(msg);
  });

  afterEach(() => {
    // Restore original console methods
    console.log = originalLog;
    console.warn = originalWarn;
    console.error = originalError;
    console.debug = originalDebug;
    messages = [];
  });

  describe("Basic Logging", () => {
    test("should log info messages with emoji", () => {
      logger.info("Test message");
      expect(messages.some(msg =>
        msg.includes("ℹ️") &&
        msg.includes("Test message")
      )).toBe(true);
    });

    test("should log error messages with emoji", () => {
      logger.error("Error message");
      expect(messages.some(msg =>
        msg.includes("❌") &&
        msg.includes("Error message")
      )).toBe(true);
    });

    test("should log success messages with emoji", () => {
      logger.success("Success message");
      expect(messages.some(msg =>
        msg.includes("✅") &&
        msg.includes("Success message")
      )).toBe(true);
    });
  });

  describe("Section Logging", () => {
    test("should format section start", () => {
      logger.startSection("Test Section");
      expect(messages.some(msg =>
        msg.includes("🚀") &&
        msg.includes("=== Starting: Test Section ===")
      )).toBe(true);
    });

    test("should format section end", () => {
      logger.endSection("Test Section");
      expect(messages.some(msg =>
        msg.includes("🏁") &&
        msg.includes("=== Completed: Test Section ===")
      )).toBe(true);
    });
  });

  describe("List Logging", () => {
    test("should format simple array", () => {
      logger.list("Test List", [1, 2, 3]);
      expect(messages.some(msg =>
        msg.includes("Test List:") &&
        msg.includes("1") &&
        msg.includes("2") &&
        msg.includes("3")
      )).toBe(true);
    });

    test("should format nested objects", () => {
      logger.list("Test Objects", [{ name: "test", value: 123 }]);
      expect(messages.some(msg =>
        msg.includes("name: test") &&
        msg.includes("value: 123")
      )).toBe(true);
    });
  });

  describe("Special Logging", () => {
    test("should log database queries", () => {
      const query = "SELECT * FROM test";
      logger.dbQuery(query);
      expect(messages.some(msg =>
        msg.includes(query) &&
        msg.includes("🗃️")
      )).toBe(true);
    });

    test("should log test suite events", () => {
      const suiteName = "Test Suite";
      logger.testStart(suiteName);
      expect(messages.some(msg =>
        msg.includes(suiteName) &&
        msg.includes("🧪")
      )).toBe(true);

      logger.testEnd(suiteName);
      expect(messages.some(msg =>
        msg.includes(suiteName) &&
        msg.includes("🧪")
      )).toBe(true);
    });
  });
});