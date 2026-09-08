import { Response } from 'express';

export interface ApiResponseEnvelope<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    [key: string]: any;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export class ApiResponse {
  static success<T>(
    res: Response,
    data: T,
    message = 'Operation successful',
    statusCode = 200,
    meta?: ApiResponseEnvelope['meta']
  ) {
    const response: ApiResponseEnvelope<T> = {
      success: true,
      message,
      data,
      ...(meta && { meta }),
    };
    return res.status(statusCode).json(response);
  }

  static created<T>(res: Response, data: T, message = 'Resource created successfully') {
    return this.success(res, data, message, 201);
  }

  static error(
    res: Response,
    message = 'Internal server error',
    statusCode = 500,
    code = 'INTERNAL_ERROR',
    details?: any
  ) {
    const response: ApiResponseEnvelope = {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
    };
    return res.status(statusCode).json(response);
  }

  static badRequest(res: Response, message = 'Bad request', details?: any) {
    return this.error(res, message, 400, 'BAD_REQUEST', details);
  }

  static unauthorized(res: Response, message = 'Unauthorized') {
    return this.error(res, message, 401, 'UNAUTHORIZED');
  }

  static forbidden(res: Response, message = 'Forbidden: Access denied') {
    return this.error(res, message, 403, 'FORBIDDEN');
  }

  static notFound(res: Response, message = 'Resource not found') {
    return this.error(res, message, 404, 'NOT_FOUND');
  }

  static conflict(res: Response, message = 'Conflict with existing resource') {
    return this.error(res, message, 409, 'CONFLICT');
  }

  static unprocessable(res: Response, message = 'Validation failed', details?: any) {
    return this.error(res, message, 422, 'VALIDATION_ERROR', details);
  }
}
