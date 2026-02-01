import type { Request, Response, NextFunction } from 'express';
import { Prisma } from '../../generated/prisma';
import { ZodError } from 'zod';
import { AppError } from '../errors/app.error';
import { logger } from '../logger/logger';

interface ValidationError {
  field: string;
  message: string;
  code: string;
}

const errorHandler = (
  err: Error | AppError | ZodError,
  req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  // Get correlation ID and logger from request
  const correlationId = req.correlationId;
  const requestLogger = req.logger || logger;

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const errors: ValidationError[] = err.issues.map((error) => ({
      field: error.path.join('.'),
      message: error.message,
      code: error.code,
    }));

    requestLogger.warn(
      {
        correlationId,
        validationErrors: errors,
        path: req.path,
        method: req.method,
      },
      'Validation error'
    );

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
      ...(correlationId && { correlationId }),
    });
  }

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    let message = 'Database error occurred';
    let statusCode = 400;

    // Handle specific Prisma error codes
    switch (err.code) {
      case 'P2002':
        message = 'Duplicate entry';
        statusCode = 409;
        requestLogger.warn(
          {
            correlationId,
            prismaCode: err.code,
            target: err.meta?.target,
            path: req.path,
            method: req.method,
          },
          `Duplicate entry: ${(err.meta?.target as string[])?.[0] || 'unknown field'}`
        );
        return res.status(statusCode).json({
          success: false,
          message,
          error: `${(err.meta?.target as string[])?.[0] || 'Field'} already exists`,
          ...(correlationId && { correlationId }),
        });

      case 'P2025':
        message = 'Resource not found';
        statusCode = 404;
        requestLogger.warn(
          {
            correlationId,
            prismaCode: err.code,
            path: req.path,
            method: req.method,
          },
          'Resource not found'
        );
        return res.status(statusCode).json({
          success: false,
          message,
          ...(correlationId && { correlationId }),
        });

      case 'P2003':
        message = 'Foreign key constraint failed';
        statusCode = 400;
        requestLogger.warn(
          {
            correlationId,
            prismaCode: err.code,
            meta: err.meta,
            path: req.path,
            method: req.method,
          },
          'Foreign key constraint violation'
        );
        break;

      default:
        message = 'Database operation failed';
        requestLogger.error(
          {
            correlationId,
            prismaCode: err.code,
            meta: err.meta,
            path: req.path,
            method: req.method,
          },
          `Prisma error: ${err.code}`
        );
    }

    return res.status(statusCode).json({
      success: false,
      message,
      ...(correlationId && { correlationId }),
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    requestLogger.warn(
      {
        correlationId,
        path: req.path,
        method: req.method,
      },
      'Invalid token'
    );

    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      ...(correlationId && { correlationId }),
    });
  }

  if (err.name === 'TokenExpiredError') {
    requestLogger.warn(
      {
        correlationId,
        path: req.path,
        method: req.method,
      },
      'Token expired'
    );

    return res.status(401).json({
      success: false,
      message: 'Token expired',
      ...(correlationId && { correlationId }),
    });
  }

  // Handle custom AppError
  if (err instanceof AppError) {
    const statusCode = err.statusCode || 500;

    // Log based on severity
    if (statusCode >= 500) {
      requestLogger.error(
        {
          correlationId,
          err,
          statusCode,
          path: req.path,
          method: req.method,
        },
        err.message
      );
    } else {
      requestLogger.warn(
        {
          correlationId,
          statusCode,
          message: err.message,
          path: req.path,
          method: req.method,
        },
        err.message
      );
    }

    return res.status(statusCode).json({
      success: false,
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      ...(correlationId && { correlationId }),
    });
  }

  // Handle unexpected errors
  const errorWithStatus = err as Error & { statusCode?: number };
  const statusCode = typeof errorWithStatus.statusCode === 'number' 
    ? errorWithStatus.statusCode 
    : 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message || 'Internal server error';

  requestLogger.error(
    {
      correlationId,
      err,
      statusCode,
      path: req.path,
      method: req.method,
      stack: err.stack,
    },
    `Unexpected error: ${err.message || 'Unknown error'}`
  );

  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    ...(correlationId && { correlationId }),
  });
};

export default errorHandler;