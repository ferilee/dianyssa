import { describe, expect, it } from "bun:test";
import { patchIntegrationWebhookHandler } from "../scripts/patch-agent-native-core.js";

const publicBaseUrlChain = `process.env.APP_URL ||
    process.env.URL ||
    process.env.DEPLOY_URL ||
    process.env.BETTER_AUTH_URL`;

describe("patchIntegrationWebhookHandler", () => {
  it("prefers WEBHOOK_BASE_URL for the integration self-dispatch", () => {
    const source = `const fromEnv =\n    ${publicBaseUrlChain};`;

    expect(patchIntegrationWebhookHandler(source)).toContain(
      `process.env.WEBHOOK_BASE_URL ||\n    ${publicBaseUrlChain}`,
    );
  });

  it("is idempotent", () => {
    const source = `const fromEnv =\n    ${publicBaseUrlChain};`;
    const once = patchIntegrationWebhookHandler(source);

    expect(patchIntegrationWebhookHandler(once)).toBe(once);
  });
});
