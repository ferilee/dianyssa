import { agentNative } from "@agent-native/core/vite";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

const reactRouterPlugins = reactRouter as unknown as () => any[];
const agentNativePlugins = agentNative as unknown as (
  options?: Parameters<typeof agentNative>[0],
) => any[];

export default defineConfig({
  plugins: [
    ...reactRouterPlugins(),
    ...agentNativePlugins({
      ssrStubs: ["shiki"],
      // Externalize puppeteer so Nitro doesn't bundle CJS packages into ESM
      // (avoids "ReferenceError: __dirname is not defined in ES module scope")
      nitro: {
        externals: {
          external: ["puppeteer", "puppeteer-core", "@puppeteer/browsers"],
        },
      },
    }),
  ],
});
