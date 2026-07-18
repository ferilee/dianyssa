import { agentNative } from "@agent-native/core/vite";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import fs from "node:fs";
import path from "node:path";

const reactRouterPlugins = reactRouter as unknown as () => any[];
const agentNativePlugins = agentNative as unknown as (
  options?: Parameters<typeof agentNative>[0],
) => any[];

const patchPuppeteerDirname = (serverDir: string) => {
  const outputDir = path.resolve(serverDir, "_libs");
  if (!fs.existsSync(outputDir)) return;

  const walk = (dir: string): string[] => {
    let results: string[] = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat && stat.isDirectory()) {
        results = results.concat(walk(filePath));
      } else {
        results.push(filePath);
      }
    });
    return results;
  };

  const files = walk(outputDir);
  for (const filePath of files) {
    if (filePath.includes("puppeteer") && (filePath.endsWith(".mjs") || filePath.endsWith(".js"))) {
      const original = fs.readFileSync(filePath, "utf-8");
      if (original.includes("__dirname")) {
        // Replace bare __dirname identifiers only (not occurrences inside strings).
        const patched = original.replace(
          /(?<![\w$.])__dirname(?![\w$])/g,
          "import.meta.dirname",
        );

        fs.writeFileSync(filePath, patched, "utf-8");
        console.log(`[puppeteer-dirname-polyfill] Patched __dirname in ${path.relative(outputDir, filePath)}`);
      }
    }
  }
};

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
    patchPuppeteerDirname(path.resolve(process.cwd(), ".output/server"));
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
        hooks: {
          compiled(nitro) {
            patchPuppeteerDirname(nitro.options.output.serverDir);
          },
        },
      },
    }),
    puppeteerDirnamePolyfill(),
  ],
});
