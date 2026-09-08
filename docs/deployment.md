# Sadak Setu — Production Deployment Guide

## Architecture Overview
- **Frontend**: Next.js / Vite SPA deployed on **Vercel** or **Netlify**.
- **Backend API**: Node.js Express server on **Render**, **Railway**, **Fly.io**, or **AWS ECS**.
- **Database**: **NeonDB Serverless PostgreSQL** with connection pooling.
- **AI Microservice**: Python FastAPI container on **AWS ECS / GCP Cloud Run / RunPod** (with optional GPU acceleration).
- **Media Assets**: **Cloudflare R2** or **AWS S3** with CDN distribution.

---

## 1. NeonDB PostgreSQL Setup
1. Create a project at [Neon.tech](https://neon.tech).
2. Copy the pooled connection string:
   ```bash
   DATABASE_URL="postgresql://<user>:<password>@<endpoint>.us-east-2.aws.neon.tech/sadak_setu?sslmode=require"
   ```
3. Run migrations and seed:
   ```bash
   npx prisma migrate deploy
   npm run prisma:seed
   ```

---

## 2. Backend Deployment (Docker / VPS / Container)

### Dockerfile
```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
COPY . .
RUN npm run prisma:generate
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
EXPOSE 5000
CMD ["npm", "start"]
```

---

## 3. Environment Variables Checklist
Ensure the following variables are configured in your production host:
- `NODE_ENV=production`
- `PORT=5000`
- `DATABASE_URL=...`
- `JWT_SECRET=...`
- `JWT_REFRESH_SECRET=...`
- `AI_MODE=live`
- `AI_SERVICE_URL=https://ai.sadaksetu.gov.in`
- `STORAGE_PROVIDER=r2` (or `s3`)
- `STORAGE_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com`
- `STORAGE_BUCKET=sadak-setu-production`
- `STORAGE_ACCESS_KEY=...`
- `STORAGE_SECRET_KEY=...`
- `CORS_ORIGIN=https://app.sadaksetu.gov.in`
