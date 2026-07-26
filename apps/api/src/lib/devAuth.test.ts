import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { isDevLoginEnabled } from "./devAuth";

/**
 * This is arguably the single most important test in the whole
 * backend — devAuth.ts's own file header calls it "the single most
 * dangerous file in the entire backend if misconfigured". These tests
 * exist to catch a regression in the double-guard logic itself
 * (e.g. someone "simplifying" it to a single condition later).
 */
describe("isDevLoginEnabled", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalFlag = process.env.ENABLE_DEV_LOGIN;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    process.env.ENABLE_DEV_LOGIN = originalFlag;
  });

  it("is disabled when both conditions are unset (the default)", () => {
    delete process.env.NODE_ENV;
    delete process.env.ENABLE_DEV_LOGIN;
    expect(isDevLoginEnabled()).toBe(false);
  });

  it("is disabled when NODE_ENV is production, even if the flag is true", () => {
    process.env.NODE_ENV = "production";
    process.env.ENABLE_DEV_LOGIN = "true";
    expect(isDevLoginEnabled()).toBe(false);
  });

  it("is disabled when the flag is unset, even in development", () => {
    process.env.NODE_ENV = "development";
    delete process.env.ENABLE_DEV_LOGIN;
    expect(isDevLoginEnabled()).toBe(false);
  });

  it("is disabled when the flag is any value other than the exact string 'true'", () => {
    process.env.NODE_ENV = "development";
    process.env.ENABLE_DEV_LOGIN = "1";
    expect(isDevLoginEnabled()).toBe(false);
  });

  it("is enabled ONLY when both conditions are explicitly satisfied", () => {
    process.env.NODE_ENV = "development";
    process.env.ENABLE_DEV_LOGIN = "true";
    expect(isDevLoginEnabled()).toBe(true);
  });
});
