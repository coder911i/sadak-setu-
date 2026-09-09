# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig*.json ./
COPY src/ ./src/
COPY prisma/ ./prisma/

RUN npm run build
RUN npx prisma generate

# ---- Production stage ----
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY prisma/ ./prisma/

EXPOSE 3000

# Run prisma deploy then start server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
