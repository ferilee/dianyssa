import { describe, it, expect, mock } from "bun:test";
import { createIdeTechClient } from "../lib/idetech-client";

describe("createIdeTechClient", () => {
  it("includes Authorization header from session token", async () => {
    globalThis.fetch = mock(async () =>
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    );

    const client = createIdeTechClient("test-token-123");
    await client.get("/api/admin/blogs");

    const calls = globalThis.fetch.mock.calls;
    expect(calls.length).toBe(1);
    const [, init] = calls[0];
    expect(init?.headers?.["Authorization"]).toBe("Bearer test-token-123");
  });
});