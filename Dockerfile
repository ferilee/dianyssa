# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

# Install build tools required by native modules (node-pty uses node-gyp)
RUN apk add --no-cache python3 make g++ gcc linux-headers

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

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

# ─── Stage 2: Prune dev dependencies ─────────────────────────────────────────
FROM builder AS pruner

# Remove devDependencies in-place to get a clean prod-only node_modules
RUN pnpm prune --prod

# ─── Stage 3: Production runner ───────────────────────────────────────────────
FROM node:22-alpine AS runner

# Install only runtime system dependencies
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
    font-noto-emoji

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

# Create data directory for SQLite persistence
RUN mkdir -p /app/data

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", ".output/server/index.mjs"]
