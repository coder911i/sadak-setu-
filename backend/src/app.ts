import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { config } from './config';
import { prisma } from './config/database';
import { swaggerSpec } from './config/swagger';
import apiRouter from './routes';
import { requestIdMiddleware } from './middleware/request-id.middleware';
import { loggerMiddleware } from './middleware/logger.middleware';
import { apiLimiter } from './middleware/rate-limiter.middleware';
import { errorHandler } from './middleware/error.middleware';
import { ApiResponse } from './utils/api-response';

export const createApp = (): Express => {
  const app = express();

  // 1. Security Headers & CORS
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || config.corsOrigin.includes(origin) || config.corsOrigin.includes('*')) {
          callback(null, true);
        } else {
          callback(null, true); // Allow during development
        }
      },
      credentials: true,
    })
  );

  // 2. Request Parsing & Limits
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // 3. Tracing & Logging
  app.use(requestIdMiddleware);
  app.use(loggerMiddleware);

  // 4. Rate Limiting
  app.use('/api', apiLimiter);

  // 5. Static Assets (Local upload directory)
  app.use('/uploads', express.static(path.resolve(config.storage.localUploadDir)));

  // 6. OpenAPI / Swagger Documentation
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // 7. Health & Readiness Checks
  app.get('/health', (_req: Request, res: Response) => {
    return ApiResponse.success(res, {
      status: 'UP',
      uptimeSeconds: process.uptime(),
      timestamp: new Date().toISOString(),
      service: 'sadak-setu-backend',
    });
  });

  app.get('/ready', async (_req: Request, res: Response) => {
    try {
      // Test database connectivity
      await prisma.$queryRaw`SELECT 1`;
      return ApiResponse.success(res, {
        status: 'READY',
        database: 'CONNECTED',
        aiMode: config.ai.mode,
        iotMode: config.iot.mode,
        storageProvider: config.storage.provider,
      });
    } catch (error: any) {
      return ApiResponse.error(res, 'Database connection failed', 503, 'SERVICE_UNAVAILABLE', {
        database: 'DISCONNECTED',
        error: error.message,
      });
    }
  });

  // 8. Versioned API Routes (/api/v1)
  app.use(config.apiPrefix, apiRouter);

  // 9. 404 Route Handler
  app.use((_req: Request, res: Response) => {
    return ApiResponse.notFound(res, 'Requested endpoint does not exist on this server');
  });

  // 10. Global Error Handler
  app.use(errorHandler);

  return app;
};

export default createApp;
