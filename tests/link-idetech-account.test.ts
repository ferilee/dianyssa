import { describe, it, expect } from "bun:test";
import action from "../actions/link-idetech-account";

describe("link-idetech-account", () => {
  it("rejects a caller that does not have a Telegram identity", async () => {
    await expect(
      action.run(
        { email: "admin@example.com" },
        { userEmail: "bot", caller: "tool" },
      ),
    ).rejects.toThrow("authenticated Telegram user");
  });
});
