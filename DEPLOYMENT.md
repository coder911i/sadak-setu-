# Sadak Setu - Production Deployment Guide

## Overview

This guide covers deploying the complete Sadak Setu system to production environments.

## Architecture

```
┌──────────────────┐
│   FRONTEND       │  Vercel
│   React/Vite     │  https://sadak-setu.vercel.app
└────────┬─────────┘
         │ HTTPS
         ↓
┌──────────────────┐
│   BACKEND API    │  Render
│   Express/TS     │  https://sadak-setu-backend.onrender.com
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│   AI SERVICE     │  Render (Docker)
│   FastAPI/YOLO   │  https://sadak-setu-ai.onrender.com
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│   DATABASE       │  NeonDB
│   PostgreSQL     │  (Serverless PostgreSQL)
└──────────────────┘
```

## Prerequisites

1. **Vercel Account** - For frontend deployment
2. **Render Account** - For backend and AI service deployment
3. **NeonDB Account** - For PostgreSQL database
4. **Cloudflare R2 Account** (Optional) - For object storage
5. **Domain Name** (Optional) - Custom domain

## Step 1: Database Setup (NeonDB)

1. Create a new NeonDB project
2. Create a database named `sadak_setu`
3. Get the connection string (format: `postgresql://<role>:<password>@<host>.neon.tech/<dbname>?sslmode=require&schema=public&connect_timeout=10`)
4. Save the connection string for backend configuration

## Step 2: Backend Deployment (Render)

### 2.1 Prepare Environment Variables

Set these environment variables in Render dashboard:

```bash
NODE_ENV=production
PORT=5000
API_PREFIX=/api/v1
DATABASE_URL=<your-neondb-connection-string>
JWT_SECRET=<generate-with-openssl-rand-base64-64>
JWT_REFRESH_SECRET=<different-64-byte-random-string>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
AI_MODE=mock  # or live when AI service is deployed
AI_SERVICE_URL=https://sadak-setu-ai.onrender.com
AI_TIMEOUT_MS=20000
IOT_MODE=mock
STORAGE_PROVIDER=local  # or r2 when configured
CORS_ORIGIN=https://sadak-setu.vercel.app,https://sadak-setu-*.vercel.app
SCORE_WEIGHT_SEVERITY=0.40
SCORE_WEIGHT_DENSITY=0.30
SCORE_WEIGHT_VIBRATION=0.20
SCORE_WEIGHT_LOCATION=0.10
```

### 2.2 Deploy Backend

1. Connect your GitHub repository to Render
2. Select the `backend` directory as root
3. Use the existing `render.yaml` configuration
4. Deploy to the Singapore region (or closest to your users)
5. Health check: `https://sadak-setu-backend.onrender.com/health`

### 2.3 Run Database Migrations

After deployment, run migrations via Render console:

```bash
cd backend
npx prisma migrate deploy
npx prisma db seed
```

## Step 3: AI Service Deployment (Render)

### 3.1 Prepare Environment Variables

```bash
AI_MODE=mock  # or live when YOLO weights are available
YOLO_MODEL_PATH=/app/models/road-damage/best.pt  # when live
YOLO_DEVICE=cpu  # or gpu if using Standard plan
YOLO_CONF_THRESHOLD=0.25
YOLO_IOU_THRESHOLD=0.45
YOLO_IMAGE_SIZE=640
```

### 3.2 Deploy AI Service

1. Connect GitHub repository to Render
2. Select the `ai-service` directory as root
3. Use Docker runtime with existing `Dockerfile`
4. Deploy to the same region as backend
5. Health check: `https://sadak-setu-ai.onrender.com/health`

## Step 4: Frontend Deployment (Vercel)

### 4.1 Prepare Environment Variables

In Vercel project settings:

```bash
NEXT_PUBLIC_API_URL=https://sadak-setu-backend.onrender.com/api/v1
VITE_API_URL=https://sadak-setu-backend.onrender.com/api/v1
```

### 4.2 Deploy Frontend

1. Connect GitHub repository to Vercel
2. Select the `sadak-setu-` directory as root
3. Use the existing `vercel.json` configuration
4. Deploy
5. Access at: `https://sadak-setu.vercel.app`

## Step 5: Storage Configuration (Optional - Cloudflare R2)

### 5.1 Create R2 Bucket

1. Create a Cloudflare R2 bucket named `sadak-setu-media`
2. Get API credentials (Access Key ID, Secret Access Key)

### 5.2 Update Backend Environment Variables

```bash
STORAGE_PROVIDER=r2
STORAGE_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
STORAGE_BUCKET=sadak-setu-media
STORAGE_ACCESS_KEY=<your-r2-access-key>
STORAGE_SECRET_KEY=<your-r2-secret-key>
STORAGE_REGION=auto
```

### 5.3 Redeploy Backend

Update environment variables and redeploy the backend service.

## Step 6: Verification

### 6.1 Health Checks

```bash
# Backend health
curl https://sadak-setu-backend.onrender.com/health

# AI service health
curl https://sadak-setu-ai.onrender.com/health

# Frontend access
# Open https://sadak-setu.vercel.app in browser
```

### 6.2 Authentication Test

1. Open the frontend application
2. Login with demo credentials:
   - Email: `admin@sadaksetu.gov.in`
   - Password: `SadakSetu@2026`
3. Verify dashboard loads with real data

### 6.3 API Endpoints Test

```bash
# Login
curl -X POST https://sadak-setu-backend.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sadaksetu.gov.in","password":"SadakSetu@2026"}'

# Get roads (with token)
curl https://sadak-setu-backend.onrender.com/api/v1/roads \
  -H "Authorization: Bearer <your-token>"
```

## Step 7: Custom Domain (Optional)

### 7.1 Configure Custom Domain

1. Add custom domain in Vercel for frontend
2. Add custom domain in Render for backend
3. Update CORS_ORIGIN in backend environment variables
4. Update NEXT_PUBLIC_API_URL in frontend environment variables

## Step 8: Monitoring and Logging

### 8.1 Render Monitoring

- Access Render dashboard for logs
- Monitor CPU, memory, and response times
- Set up alerts for failures

### 8.2 Vercel Analytics

- Enable Vercel Analytics for frontend
- Monitor page loads and user interactions

### 8.3 NeonDB Monitoring

- Monitor database connections
- Set up alerts for connection limits
- Review query performance

## Troubleshooting

### Backend Issues

- **Database Connection**: Verify DATABASE_URL is correct and NeonDB is accessible
- **CORS Errors**: Check CORS_ORIGIN includes your frontend domain
- **AI Service**: Ensure AI_MODE=mock if AI service is not deployed

### Frontend Issues

- **API Errors**: Verify NEXT_PUBLIC_API_URL is correct
- **Authentication**: Check JWT_SECRET is set in backend
- **Build Failures**: Check build logs in Vercel

### AI Service Issues

- **Timeout**: Increase AI_TIMEOUT_MS if processing takes longer
- **Memory**: Upgrade to Standard plan for GPU access
- **Model Loading**: Ensure YOLO weights are available when AI_MODE=live

## Security Checklist

- [ ] JWT_SECRET and JWT_REFRESH_SECRET are strong random strings
- [ ] DATABASE_URL uses SSL (sslmode=require)
- [ ] CORS_ORIGIN is restricted to production domains only
- [ ] API keys and secrets are not exposed in frontend code
- [ ] Rate limiting is enabled (configured in backend)
- [ ] Security headers are configured (Helmet.js)
- [ ] Database backups are enabled in NeonDB
- [ ] Log monitoring is set up

## Cost Estimates

### Render (Free Tier)
- Backend: Free (Starter plan)
- AI Service: Free (Starter plan)
- **Total: $0/month**

### Render (Production)
- Backend: ~$7/month (Standard plan)
- AI Service: ~$25/month (Standard plan with GPU)
- **Total: ~$32/month**

### Vercel (Hobby)
- Frontend: Free (Hobby plan)
- **Total: $0/month**

### NeonDB (Free Tier)
- Database: Free (0.5GB storage, 100 hours compute)
- **Total: $0/month**

### Cloudflare R2 (Free Tier)
- Storage: Free (10GB)
- Egress: Free (1GB/month)
- **Total: $0/month**

### Total Cost (Free Tier): $0/month
### Total Cost (Production): ~$32/month

## Scaling Considerations

### When to Scale Up

- **Backend**: Upgrade when CPU usage > 80% or response times > 2s
- **AI Service**: Upgrade when inference time > 5s or queue builds up
- **Database**: Upgrade when storage > 80% or connection limits reached
- **Frontend**: Vercel automatically scales, no manual scaling needed

### Load Balancing

- Render automatically handles load balancing
- Consider multiple backend instances for high traffic
- Use database connection pooling for high concurrency

## Backup and Recovery

### Database Backups

- NeonDB provides automatic daily backups
- Enable point-in-time recovery for critical data
- Export backups regularly for additional safety

### Application Backups

- All code is in Git repository
- Environment variables are stored in Render/Vercel
- Document any manual configurations

## Maintenance

### Regular Tasks

- Review logs weekly for errors
- Monitor database storage usage
- Update dependencies monthly
- Review and rotate secrets quarterly
- Test backup restoration quarterly

### Updates

- Backend: Push to main branch, Render auto-deploys
- Frontend: Push to main branch, Vercel auto-deploys
- Database: Run migrations via Render console
- AI Service: Rebuild when model weights change

## Support

For issues or questions:
- Backend Logs: Render Dashboard
- Frontend Logs: Vercel Dashboard
- Database: NeonDB Console
- Documentation: See `/docs` directory