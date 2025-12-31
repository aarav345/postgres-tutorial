import { Request, Response, NextFunction } from 'express';
import { Role } from '../../generated/prisma';
import { MESSAGES } from '../constants/messages.constant';
import { UnauthorizedError, ForbiddenError } from '../errors/app.error';

export const authorize = (...allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError(MESSAGES.AUTH.UNAUTHORIZED);
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError(MESSAGES.AUTH.FORBIDDEN);
    }

    next();
  };
};
