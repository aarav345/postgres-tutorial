// common/utils/jwt.util.ts
import type { Request, Response } from 'express';
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import jwtConfig from '../../config/jwt.config.js';
import type { JwtPayload } from '../types/jwt-payload.interface.js';
import { AppError } from '../errors/app.error.js';


export class JwtUtil {
    private static readonly REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';
    
    private static readonly COOKIE_OPTIONS = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
    };

    /**
     * Generate access token (keep existing)
     */
    static generateAccessToken(payload: JwtPayload): string {
        const options: SignOptions = {
            expiresIn: jwtConfig.accessTokenExpiry,
        };

        return jwt.sign(
            payload,
            jwtConfig.accessTokenSecret as Secret,
            options
        );
    }

    /**
     * Verify access token (keep existing)
     */
    static verifyAccessToken(token: string): JwtPayload {
        try {
            return jwt.verify(token, jwtConfig.accessTokenSecret) as JwtPayload;
        } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new AppError('Access token has expired', 401);
        }
        if (error instanceof jwt.JsonWebTokenError) {
            throw new AppError('Invalid access token', 401);
        }
        throw new AppError('Token verification failed', 401);
        }
    }

    /**
     * Extract token from Authorization header (keep existing)
     */
    static extractTokenFromHeader(authHeader?: string): string | null {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
        }
        return authHeader.substring(7);
    }

    /**
     * Set refresh token in httpOnly cookie
     */
    static setRefreshTokenCookie(res: Response, refreshToken: string): void {
        res.cookie(
            this.REFRESH_TOKEN_COOKIE_NAME,
            refreshToken,
            this.COOKIE_OPTIONS
        );
    }


    /**
     * Get refresh token from cookie
     */
    static getRefreshTokenFromCookie(req: Request): string | undefined {

        if (!req.cookies) return undefined;

        const token: unknown = req.cookies[this.REFRESH_TOKEN_COOKIE_NAME];

        if (typeof token === 'string') return token;

        return undefined;
    }

    /**
     * Clear refresh token cookie
     */
    static clearRefreshTokenCookie(res: Response): void {
        res.clearCookie(this.REFRESH_TOKEN_COOKIE_NAME, {
            httpOnly: this.COOKIE_OPTIONS.httpOnly,
            secure: this.COOKIE_OPTIONS.secure,
            sameSite: this.COOKIE_OPTIONS.sameSite,
            path: this.COOKIE_OPTIONS.path,
        });
    }

    /**
     * Extract metadata from request
     */
    static extractMetadata(req: Request): { ipAddress?: string; userAgent?: string } {
        return {
            ipAddress: (req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress) as string,
            userAgent: req.headers['user-agent'],
        };
    }
}