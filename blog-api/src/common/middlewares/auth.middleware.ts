import { Request, Response, NextFunction } from 'express';
import { JwtUtil } from '../utils/jwt.util';
import { MESSAGES } from '../constants/messages.constant';
import { UnauthorizedError } from '../errors/app.error';

export const authenticate = async (
    req: Request,
    _res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedError(MESSAGES.AUTH.TOKEN_REQUIRED);
        }

        const token = authHeader.substring(7);
        const decoded = JwtUtil.verifyAccessToken(token);

        req.user = decoded;
        next();
    } catch (error) {
        next(new UnauthorizedError(MESSAGES.AUTH.TOKEN_INVALID));
    }
};


