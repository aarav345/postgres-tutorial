import type { Request, Response, NextFunction } from 'express';
import type { z } from 'zod';
import { ResponseUtil } from '../utils/response.util.js';

export interface ValidatedRequest <
  TBody = undefined,
  TQuery = undefined,
  TParams = undefined
> extends Request {
  validatedBody: TBody;
  validatedQuery: TQuery;
  validatedParams: TParams;
}

export const validate = <T extends z.ZodSchema>(schema: T) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    
    if (!result.success) {
      const flattenedErrors = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));
      return ResponseUtil.error(res, 'Validation error', 400, flattenedErrors);
    }
    
    (req as ValidatedRequest<z.infer<T>, undefined, undefined>).validatedBody = result.data;
    next();
  };
export const validateQuery = <T extends z.ZodSchema>(schema: T) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    
    if (!result.success) {
      const flattenedErrors = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));
      return ResponseUtil.error(res, 'Validation error', 400, flattenedErrors);
    }
    
    (req as ValidatedRequest<undefined, z.infer<T>, undefined>).validatedQuery = result.data;
    next();
  };

  export const validateParams = <T extends z.ZodSchema>(schema: T) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);
    
    if (!result.success) {
      const flattenedErrors = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));
      return ResponseUtil.error(res, 'Validation error', 400, flattenedErrors);
    }
    
    (req as ValidatedRequest<undefined, undefined, z.infer<T>>).validatedParams = result.data;
    next();
  };
