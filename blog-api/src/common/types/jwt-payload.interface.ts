import { Role } from '../../generated/prisma';

export interface JwtPayload {
    id: number;
    email: string;
    username: string;
    role: Role;
}

export interface RefreshTokenPayload {
    id: number;
}
