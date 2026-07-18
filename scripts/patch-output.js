import fs from 'node:fs';
import path from 'node:path';

const serverDir = path.resolve(process.cwd(), '.output/server');
const outputDir = path.resolve(serverDir, '_libs');

if (!fs.existsSync(outputDir)) {
  console.log(`[patch-output] Directory not found: ${outputDir}`);
  process.exit(0);
}

const walk = (dir) => {
  let results = [];
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
let patchedCount = 0;

for (const filePath of files) {
  // Patch ALL .js and .mjs files under _libs that contain __dirname
  if (filePath.endsWith('.mjs') || filePath.endsWith('.js')) {
    const original = fs.readFileSync(filePath, 'utf-8');
    if (original.includes('__dirname')) {
      const patched = original.replace(
        /(?<![\w$.])__dirname(?![\w$])/g,
        'import.meta.dirname'
      );
      if (patched !== original) {
        fs.writeFileSync(filePath, patched, 'utf-8');
        console.log(`[patch-output] Patched __dirname in ${path.relative(serverDir, filePath)}`);
        patchedCount++;
      }
    }
  }
}

console.log(`[patch-output] Done. Patched ${patchedCount} file(s).`);
