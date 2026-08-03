import { describe, expect, it } from "bun:test";
import { patchIntegrationWebhookHandler } from "../scripts/patch-agent-native-core.js";
import { patchBundledIntegrationDispatch } from "../scripts/patch-bundled-integration-dispatch.js";

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

describe("patchBundledIntegrationDispatch", () => {
  const bundledDispatch =
    "let t=process.env.APP_URL||process.env.URL||process.env.DEPLOY_URL||process.env.BETTER_AUTH_URL;";
  const bundle = `function g(){console.error(\`[integrations] Failed to dispatch processor request:\`);${bundledDispatch}}`;

  it("patches the production integration dispatch, not another WEBHOOK_BASE_URL use", () => {
    expect(patchBundledIntegrationDispatch(bundle)).toContain(
      "process.env.WEBHOOK_BASE_URL||process.env.APP_URL||process.env.URL||process.env.DEPLOY_URL||process.env.BETTER_AUTH_URL",
    );
  });

  it("does not patch the bundle twice", () => {
    const once = patchBundledIntegrationDispatch(bundle);

    expect(patchBundledIntegrationDispatch(once)).toBe(once);
  });
});
