import type { Role } from '../../src/generated/prisma';
import { JwtUtil } from '../../src/common/utils/jwt.util';
import { RefreshTokenService } from '../../src/modules/auth/token.service';

export class TestHelpers {
    /**
     * Generate a mock user object
     */
    static mockUser(overrides = {}) {
        return {
            id: 1,
            email: 'test@example.com',
            username: 'testuser',
            password: 'Password123!',
            role: 'USER' as Role,
            passwordChangedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...overrides,
        };
    }

    /**
     * Generate a mock admin user
     */
    static mockAdmin(overrides = {}) {
        return this.mockUser({
            id: 2,
            email: 'admin@example.com',
            password: 'Admin123!',
            username: 'admin',
            role: 'ADMIN' as Role,
            ...overrides,
        });
    }

    static mockUserWithCount(
    overrides: Partial<{
        id: number;
        email: string;
        username: string;
        role: Role;
        createdAt: Date;
        updatedAt: Date;
        _count: {
            posts: number;
            comments: number;
        };
    }> = {}
    ) {
    return {
            id: 1,
            email: 'test@example.com',
            username: 'testuser',
            role: 'USER' as Role,
            createdAt: new Date(),
            updatedAt: new Date(),
            _count: {
                posts: 0,
                comments: 0,
            },
        ...overrides,
        };
    }


    static mockAdminWithCount(
    overrides: Partial<{
        id: number;
        email: string;
        username: string;
        role: Role;
        createdAt: Date;
        updatedAt: Date;
        _count: {
            posts: number;
            comments: number;
        };
    }> = {}
    ) {
    return {
            id: 1,
            email: 'admin@example.com',
            username: 'adminuser',
            role: 'ADMIN' as Role,
            createdAt: new Date(),
            updatedAt: new Date(),
            _count: {
                posts: 0,
                comments: 0,
            },
        ...overrides,
        };
    }


    /**
     * Generate a valid JWT token for testing
     */
    static generateToken(userId: number, role: Role = 'USER'): string {
        return JwtUtil.generateAccessToken({ userId, role });
    }

    /**
     * Generate a refresh token for testing
     */
    static async generateRefreshToken(userId: number): Promise<string> {
        return RefreshTokenService.createRefreshToken(
            userId, undefined
        );
    }

    /**
     * Create authorization header
     */
    static authHeader(token: string): { Authorization: string } {
        return { Authorization: `Bearer ${token}` };
    }

    /**
     * Mock pagination result
     */
    static mockPaginationResult<T>(items: T[], total: number, page = 1, limit = 10) {
        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
}