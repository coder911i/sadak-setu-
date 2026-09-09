# Sadak Setu Backend - Production Dockerfile
# Build Stage: Compile TypeScript + Generate Prisma Client
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for native modules (prisma requires openssl)
RUN apk add --no-cache openssl

# 1. Install npm dependencies FIRST (better layer caching)
COPY package*.json ./
RUN npm ci

# 2. Copy Prisma schema and generate Prisma Client BEFORE TypeScript compilation
#    TypeScript code imports from @prisma/client, so the generated client must exist first.
COPY prisma ./prisma/
RUN npx prisma generate

# 3. Copy source code and build TypeScript
#    (npm prebuild will also run prisma generate - idempotent, no harm)
COPY tsconfig.json ./
COPY src ./src/
RUN npm run build

# --- Runtime Stage: Production image without devDependencies ---
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl

ENV NODE_ENV=production

# Copy package manifests and install production-only deps
COPY package*.json ./
RUN npm ci --omit=dev

# Re-copy Prisma schema + regenerate client (ensure generated client matches runtime Node version)
COPY prisma ./prisma/
RUN npx prisma generate

# Copy compiled JS from builder stage
COPY --from=builder /app/dist ./dist/

# Upload directory for local storage provider
RUN mkdir -p ./uploads

EXPOSE 5000

# Healthcheck (hits the /health endpoint)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "dist/server.js"]
