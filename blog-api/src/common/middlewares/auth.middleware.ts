// common/middlewares/auth.middleware.ts
import type { Request, Response, NextFunction } from 'express';
import { JwtUtil } from '../utils/jwt.util';
import { ResponseUtil } from '../utils/response.util';

export const authenticate = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
    const token = JwtUtil.extractTokenFromHeader(req.headers.authorization);

    if (!token) {
        ResponseUtil.error(res, 'Access token is required', 401);
        return;
    }

    const decoded = JwtUtil.verifyAccessToken(token);
    
    // Attach user info to request
    req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
    };

    next();
    } catch (error) {
        if (error instanceof Error) {
            ResponseUtil.error(res, error.message, 401);
        } else {
            ResponseUtil.error(res, 'Authentication failed', 401);
        }
    }
};