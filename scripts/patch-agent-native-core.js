import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const integrationHandlerPath = path.resolve(
  process.cwd(),
  "node_modules/@agent-native/core/corpus/core/src/integrations/webhook-handler.ts",
);

const publicBaseUrlChain = `process.env.APP_URL ||
    process.env.URL ||
    process.env.DEPLOY_URL ||
    process.env.BETTER_AUTH_URL`;

const internalBaseUrlChain = `process.env.WEBHOOK_BASE_URL ||
    ${publicBaseUrlChain}`;

/**
 * Agent Native self-dispatches each incoming integration event so processing
 * happens outside the webhook response. On a self-hosted Docker deployment,
 * sending that request through APP_URL can require hairpin access to the
 * public reverse proxy and time out. WEBHOOK_BASE_URL lets it stay on the
 * Docker network instead (for example http://dianyssa-agent:3000).
 */
export function patchIntegrationWebhookHandler(source) {
  if (source.includes(internalBaseUrlChain)) return source;

  const matches = source.split(publicBaseUrlChain).length - 1;
  if (matches !== 1) {
    throw new Error(
      `[patch-agent-native-core] Expected one integration dispatch URL chain, found ${matches}. ` +
        "Review the installed @agent-native/core version before building.",
    );
  }

  return source.replace(publicBaseUrlChain, internalBaseUrlChain);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (!fs.existsSync(integrationHandlerPath)) {
    throw new Error(
      `[patch-agent-native-core] Integration handler not found: ${integrationHandlerPath}`,
    );
  }

  const original = fs.readFileSync(integrationHandlerPath, "utf8");
  const patched = patchIntegrationWebhookHandler(original);

  if (patched === original) {
    console.log("[patch-agent-native-core] WEBHOOK_BASE_URL patch already applied.");
  } else {
    fs.writeFileSync(integrationHandlerPath, patched, "utf8");
    console.log("[patch-agent-native-core] Patched integration self-dispatch base URL.");
  }
}
