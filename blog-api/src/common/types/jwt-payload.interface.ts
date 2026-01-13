import type { Role } from '../../generated/prisma';

export interface JwtPayload {
    userId: number;        // Primary identifier
    email: string;         // For user context
    role: Role;           // For authorization
}

export interface RefreshTokenPayload {
    userId: number;        // Only identifier
    tokenVersion?: number; // For invalidation
    // Absolute minimum - just for refresh
}