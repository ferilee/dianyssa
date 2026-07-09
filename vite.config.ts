import { agentNative } from "@agent-native/core/vite";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

const reactRouterPlugins = reactRouter as unknown as () => any[];
const agentNativePlugins = agentNative as unknown as (
  options?: Parameters<typeof agentNative>[0],
) => any[];

export default defineConfig({
  // Mark puppeteer packages as external in Vite's SSR context as well
  // This prevents both Vite and Nitro from bundling CJS packages into ESM,
  // which causes "ReferenceError: __dirname is not defined in ES module scope"
  ssr: {
    external: ["puppeteer", "puppeteer-core", "@puppeteer/browsers"],
  },
  plugins: [
    ...reactRouterPlugins(),
    ...agentNativePlugins({
      ssrStubs: ["shiki"],
      // Externalize puppeteer in Nitro's rollup bundler
      nitro: {
        externals: {
          external: ["puppeteer", "puppeteer-core", "@puppeteer/browsers"],
        },
      },
    }),
  ],
});
