import { agentNative } from "@agent-native/core/vite";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import fs from "node:fs";
import path from "node:path";

const reactRouterPlugins = reactRouter as unknown as () => any[];
const agentNativePlugins = agentNative as unknown as (
  options?: Parameters<typeof agentNative>[0],
) => any[];

/**
 * Post-process the bundled @puppeteer/browsers CJS-to-ESM chunk.
 * Even with externals, Nitro may still inline this transitive dependency.
 * Its CJS source uses `__dirname`, which does not exist in ESM at runtime
 * and causes `ReferenceError: __dirname is not defined in ES module scope`.
 * `import.meta.dirname` is the ESM equivalent and is available in Node >=20.11.
 */
const puppeteerDirnamePolyfill = (): import("vite").Plugin => ({
  name: "puppeteer-dirname-polyfill",
  apply: "build",
  enforce: "post",
  async closeBundle() {
    const outputDir = path.resolve(process.cwd(), ".output/server/_libs");
    if (!fs.existsSync(outputDir)) return;

    const files = fs.readdirSync(outputDir);
    const target = files.find(
      (f) => f.startsWith("@puppeteer/browsers") && f.endsWith(".mjs"),
    );
    if (!target) return;

    const filePath = path.join(outputDir, target);
    const original = fs.readFileSync(filePath, "utf-8");
    if (!original.includes("__dirname")) return;

    // Replace bare __dirname identifiers only (not occurrences inside strings).
    const patched = original.replace(
      /(?<![\w$.])__dirname(?![\w$])/g,
      "import.meta.dirname",
    );

    fs.writeFileSync(filePath, patched, "utf-8");
    console.log(`[puppeteer-dirname-polyfill] Patched __dirname in ${target}`);
  },
});

export default defineConfig({
  // Mark puppeteer packages as external in Vite's SSR context as well.
  // This is a best-effort hint; the post-build plugin handles the case
  // where Nitro still inlines @puppeteer/browsers.
  ssr: {
    external: ["puppeteer", "puppeteer-core", "@puppeteer/browsers"],
  },
  plugins: [
    ...reactRouterPlugins(),
    ...agentNativePlugins({
      ssrStubs: ["shiki"],
      nitro: {
        externals: {
          external: ["puppeteer", "puppeteer-core", "@puppeteer/browsers"],
        },
      },
    }),
    puppeteerDirnamePolyfill(),
  ],
});
