import type { Role } from '../../generated/prisma';

export interface JwtPayload {
    userId: number;        // Primary identifier
    role: Role;           // For authorization
}

export interface RefreshTokenPayload {
    userId: number;        // Only identifier
}