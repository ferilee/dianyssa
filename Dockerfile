# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

# Install build tools required by native modules (node-pty uses node-gyp)
RUN apk add --no-cache python3 make g++ gcc linux-headers

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Skip Puppeteer Chromium download during install (we use system Chromium)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /app

# Copy dependency manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install all dependencies (dev + prod needed for build)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# ─── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:22-alpine AS runner

# Install runtime system dependencies:
# - build tools needed to re-link native modules (node-pty)
# - Chromium for Puppeteer PDF generation
RUN apk add --no-cache \
    python3 make g++ gcc linux-headers \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    font-noto \
    font-noto-emoji

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Tell Puppeteer to use the installed system Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

# Copy dependency manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install production dependencies only (native modules will be compiled here)
RUN pnpm install --frozen-lockfile --prod

# Copy built output from builder stage
# - build/     → React Router client-side output
# - .output/   → Nitro server bundle (agent-native preset "node")
# - .react-router/ → React Router manifest & type declarations
COPY --from=builder /app/build ./build
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/.react-router ./.react-router

# Create data directory for SQLite persistence
RUN mkdir -p /app/data

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["pnpm", "start"]
