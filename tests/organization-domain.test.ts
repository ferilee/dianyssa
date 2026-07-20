import { describe, expect, it } from "bun:test";
import { canManageOrganization, organizationRoleSchema, organizationSchema } from "../domain/organization";

describe("organization domain", () => {
  it("validates tenant identifiers and organization roles", () => {
    expect(organizationSchema.parse({ id: "8dd9a7bb-3f31-45b4-a4f2-247debeea4a0", name: "SMA Harapan", slug: "sma-harapan" }).slug).toBe("sma-harapan");
    expect(() => organizationSchema.parse({ id: "bad", name: "S", slug: "Bad Slug" })).toThrow();
    expect(canManageOrganization(organizationRoleSchema.parse("school_admin"))).toBe(true);
    expect(canManageOrganization(organizationRoleSchema.parse("teacher"))).toBe(false);
  });
});
