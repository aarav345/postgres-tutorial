import type { Request, Response, NextFunction } from 'express';
import type { z } from 'zod';
import { ResponseUtil } from '../utils/response.util.js';

export const validate =
  (schema: z.ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const flattenedErrors = result.error.issues.map((issue) => ({
        path: issue.path,
        message: issue.message,
      }));


      return ResponseUtil.error(
        res,
        'Validation error',
        400,
        flattenedErrors
      );
    }

    // ✅ overwrite body with validated & sanitized data
    req.body = result.data;
    next();
  };
