import { describe, it, expect } from "vitest";
import {
  createServiceRequestSchema,
  updateServiceRequestStatusSchema,
  createServiceCategorySchema,
} from "./schemas";

describe("createServiceRequestSchema", () => {
  it("accepts valid input with only required fields", () => {
    const result = createServiceRequestSchema.safeParse({
      projectDetails: "Build me a website",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty projectDetails", () => {
    const result = createServiceRequestSchema.safeParse({ projectDetails: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing projectDetails entirely", () => {
    const result = createServiceRequestSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("updateServiceRequestStatusSchema", () => {
  it("accepts any of the 8 fixed status values", () => {
    const statuses = [
      "SUBMITTED",
      "UNDER_REVIEW",
      "QUOTATION_SENT",
      "APPROVED",
      "REJECTED",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
    ];
    for (const toStatus of statuses) {
      expect(updateServiceRequestStatusSchema.safeParse({ toStatus }).success).toBe(true);
    }
  });

  it("rejects a status value outside the fixed list", () => {
    const result = updateServiceRequestStatusSchema.safeParse({ toStatus: "MADE_UP_STATUS" });
    expect(result.success).toBe(false);
  });
});

describe("createServiceCategorySchema", () => {
  it("accepts a valid lowercase-hyphenated slug", () => {
    const result = createServiceCategorySchema.safeParse({
      title: "Web Development",
      slug: "web-development",
      description: "Building websites",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a slug with uppercase letters or spaces", () => {
    const result = createServiceCategorySchema.safeParse({
      title: "Web Development",
      slug: "Web Development",
      description: "Building websites",
    });
    expect(result.success).toBe(false);
  });
});
