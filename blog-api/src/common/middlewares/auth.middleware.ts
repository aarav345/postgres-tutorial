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

    console.log("token:", token)

    if (!token) {
        ResponseUtil.error(res, 'Access token is required', 401);
        return;
    }

    const decoded = JwtUtil.verifyAccessToken(token);

    console.log("decoded", decoded);
    
    // Attach user info to request
    req.user = {
        userId: decoded.userId,
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