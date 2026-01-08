import type { Secret, SignOptions } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';
import jwtConfig from '../../config/jwt.config';
import type { JwtPayload, RefreshTokenPayload } from '../types/jwt-payload.interface';

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
        return jwt.sign(payload, jwtConfig.refreshTokenSecret as Secret, {
        expiresIn: jwtConfig.refreshTokenExpiry,
        });
    }

    static verifyAccessToken(token: string): JwtPayload {
        return jwt.verify(token, jwtConfig.accessTokenSecret) as JwtPayload;
    }

    static verifyRefreshToken(token: string): RefreshTokenPayload {
        return jwt.verify(token, jwtConfig.refreshTokenSecret) as RefreshTokenPayload;
    }

    static decode(token: string): unknown {
        return jwt.decode(token);
    }
}
