import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ApiResponse } from '../utils/api-response';

export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  logger.error(`Unhandled Error on ${req.method} ${req.originalUrl}: ${err.message}`, {
    requestId: req.id,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
  });

  // Handle Multer upload errors
  if (err.name === 'MulterError') {
    return ApiResponse.badRequest(res, `File upload error: ${err.message}`);
  }

  // Handle Prisma known errors
  if (err.code === 'P2002') {
    return ApiResponse.conflict(res, 'A resource with this unique field already exists.');
  }

  if (err.code === 'P2025') {
    return ApiResponse.notFound(res, 'Record not found.');
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  const errorCode = err.code || 'SERVER_ERROR';

  return ApiResponse.error(res, message, statusCode, errorCode);
};
