import { describe, it, expect, mock, beforeEach, afterEach } from "bun:test";
import action from "../actions/link-idetech-account";

describe("link-idetech-account", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = mock(async () =>
      new Response(
        JSON.stringify({ user: { id: "u_123", email: "admin@example.com" }, token: "tok_abc" }),
        { status: 200 }
      )
    );
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("stores session mapping after successful login", async () => {
    const result = await action.run(
      { telegramUserId: "tg_1", email: "admin@example.com" },
      { userEmail: "bot" } as any
    );

    expect(result.status).toBe("success");
    expect(result.ideTechUserId).toBe("u_123");
  });
});