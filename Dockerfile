# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

# Install build tools required by native modules (node-pty uses node-gyp)
RUN apk add --no-cache python3 make g++ gcc linux-headers

# Install pnpm
RUN corepack enable && corepack prepare pnpm@11.9.0 --activate

# Skip Puppeteer Chromium download during install
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /app

# Copy dependency manifests FIRST (cache layer — only invalidated when lockfile changes)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install ALL dependencies (dev + prod) — cached unless lockfile changes
RUN pnpm install --frozen-lockfile

# Copy source code (invalidates cache only when source changes)
COPY . .

# Build the application
RUN pnpm build

# Patch the bundled @puppeteer/browsers CJS-to-ESM chunk.
# Even with externals, Nitro still inlines this transitive dependency, and its
# CommonJS source uses `__dirname`, which is undefined in ESM at runtime
# (`ReferenceError: __dirname is not defined in ES module scope`).
# `import.meta.dirname` is the ESM equivalent and is available in Node >=20.11.
RUN node -e "\
  const fs = require('fs'); \
  const path = require('path'); \
  const dir = path.join('/app/.output/server/_libs', '@puppeteer'); \
  if (!fs.existsSync(dir)) process.exit(0); \
  const file = fs.readdirSync(dir).find(f => f.startsWith('browsers') && f.endsWith('.mjs')); \
  if (!file) process.exit(0); \
  const fp = path.join(dir, file); \
  const orig = fs.readFileSync(fp, 'utf-8'); \
  const patched = orig.replace(/(?<![\\w$.])__dirname(?![\\w$])/g, 'import.meta.dirname'); \
  if (patched !== orig) { \
    fs.writeFileSync(fp, patched); \
    console.log('Patched __dirname in', fp); \
  } \
"

# ─── Stage 2: Prune dev dependencies ─────────────────────────────────────────
FROM builder AS pruner

# Remove devDependencies in-place to get a clean prod-only node_modules
RUN pnpm prune --prod

# ─── Stage 3: Production runner ───────────────────────────────────────────────
FROM node:22-alpine AS runner

# Install runtime system dependencies
RUN apk add --no-cache \
    # Needed to re-link native modules (node-pty, better-sqlite3)
    python3 make g++ gcc linux-headers \
    # Chromium for Puppeteer PDF generation
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    font-noto \
    font-noto-emoji \
    curl

# Install pnpm (needed to run `pnpm start` → agent-native start)
RUN corepack enable && corepack prepare pnpm@11.9.0 --activate

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

# Copy package manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy pruned node_modules from pruner (no re-download needed!)
COPY --from=pruner /app/node_modules ./node_modules

# Copy built output
# - build/   → React Router client-side assets
# - .output/ → Nitro server bundle (agent-native preset "node")
COPY --from=builder /app/build ./build
COPY --from=builder /app/.output ./.output

# Create data directory for SQLite persistence and switch to non-root user
RUN mkdir -p /app/data && chown -R node:node /app

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

USER node

# Use pnpm start → agent-native start which correctly handles
# ESM/CJS interop for puppeteer's __dirname usage
CMD ["pnpm", "start"]

