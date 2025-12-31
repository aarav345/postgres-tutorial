import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import jwtConfig from '../../config/jwt.config';
import { JwtPayload, RefreshTokenPayload } from '../types/jwt-payload.interface';

export class JwtUtil {
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

    static generateRefreshToken(payload: RefreshTokenPayload): string {
        return jwt.sign(payload, jwtConfig.refreshTokenSecret, {
        expiresIn: jwtConfig.refreshTokenExpiry,
        });
    }

    static verifyAccessToken(token: string): JwtPayload {
        try {
        return jwt.verify(token, jwtConfig.accessTokenSecret) as JwtPayload;
        } catch (error) {
        throw new Error('Invalid or expired token');
        }
    }

    static verifyRefreshToken(token: string): RefreshTokenPayload {
        try {
        return jwt.verify(token, jwtConfig.refreshTokenSecret) as RefreshTokenPayload;
        } catch (error) {
        throw new Error('Invalid or expired refresh token');
        }
    }

    static decode(token: string): any {
        return jwt.decode(token);
    }
}
