import { describe, it, expect } from "vitest";
import { generateRefreshTokenValue, hashToken } from "./hash";

describe("hash.ts", () => {
  it("generateRefreshTokenValue produces a long, non-empty hex string", () => {
    const token = generateRefreshTokenValue();
    expect(token).toMatch(/^[0-9a-f]+$/);
    expect(token.length).toBeGreaterThanOrEqual(64); // 48 bytes -> 96 hex chars, comfortably above 64
  });

  it("generateRefreshTokenValue produces different values each call", () => {
    const a = generateRefreshTokenValue();
    const b = generateRefreshTokenValue();
    expect(a).not.toBe(b);
  });

  it("hashToken is deterministic for the same input", () => {
    const raw = "some-raw-refresh-token-value";
    expect(hashToken(raw)).toBe(hashToken(raw));
  });

  it("hashToken produces different hashes for different inputs", () => {
    expect(hashToken("value-a")).not.toBe(hashToken("value-b"));
  });

  it("hashToken never returns the raw input itself", () => {
    const raw = "some-raw-refresh-token-value";
    expect(hashToken(raw)).not.toBe(raw);
  });
});
