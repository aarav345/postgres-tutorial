import type { Request, Response, NextFunction } from 'express';
import type { ValidationError as ExpressValidationError } from 'express-validator';
import { validationResult } from 'express-validator';

export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array().map((err: ExpressValidationError) => {
        const field = err.type === 'field' ? (err).path : 'unknown';
        const message = typeof err.msg === 'string' ? err.msg : String(err.msg);

        return {
          field,
          message
        }
      }),
    });
    return;
  }
  
  next();
};
