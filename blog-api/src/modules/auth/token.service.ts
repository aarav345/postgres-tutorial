import crypto from "crypto";
import prisma from '../../database/prisma.client.js';
import { AppError } from "@/common/errors/app.error.js";
import type { User } from "@/generated/prisma/index.js";

export class RefreshTokenService {
    static async createRefreshToken(
        userId: number,
        family?: string,
        metadata?: {
        ipAddress?: string;
        userAgent?: string;
        }
    ): Promise<string> {
        const token = crypto.randomBytes(40).toString("hex");
        const tokenFamily = family ?? crypto.randomBytes(16).toString("hex");

        await prisma.refreshToken.create({
            data: {
                token,
                userId,
                family: tokenFamily,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                ipAddress: metadata?.ipAddress,
                userAgent: metadata?.userAgent,
            },
        });

        return token;
    }


    static async rotateRefreshToken(
        token: string,
        metadata?: { ipAddress?: string; userAgent?: string }
    ): Promise<{ userId: number, token: string, user: User}> {
        const storedToken = await prisma.refreshToken.findUnique({
            where: { token },
            include: { user: true },
        });

        if (!storedToken) {
            throw new AppError('Invalid Refresh Token', 401);
        }

        // Token expired
        if (storedToken.expiresAt < new Date()) {
            await prisma.refreshToken.delete({ where: { id: storedToken.id } });
            throw new AppError('Refresh token has expired', 401);
        }


        // Token reuse detected - potential breach
        if (storedToken.used) {
            console.warn(`Token reuse detected for user ${storedToken.userId}, family ${storedToken.family}`);

            // Invalidate entire token family
            await prisma.refreshToken.deleteMany({
                where: {
                    family: storedToken.family
                }
            });

            throw new AppError('Token reuse detected. All sessions have been invalidated.', 401);
        }


        // Mark old token as used
        await prisma.refreshToken.update({
            where: { id: storedToken.id },
            data: {
                used: true,
                usedAt: new Date()
            }
        });

        // Generate new token in the same family
        const newToken = await this.createRefreshToken(
            Number(storedToken.userId),
            storedToken.family,
            metadata
        )

        return {
            userId: storedToken.userId,
            token: newToken,
            user: storedToken.user
        }
    }

    /**
   * Revoke all refresh tokens for a user
   */
    static async revokeAllUserTokens(userId: number): Promise<void> {
        await prisma.refreshToken.deleteMany({
            where: { userId }
        })
    }


    /**
   * Revoke specific token family
   */
    static async revokeTokenFamily(tokenFamily: string): Promise<void> {
        await prisma.refreshToken.deleteMany({
            where: { family: tokenFamily }
        })
    }

    /**
   * Clean up expired tokens (run as cron job)
   */
    static async cleanUpExpiredTokens(): Promise<number> {
        const result = await prisma.refreshToken.deleteMany({
            where: {
                expiresAt: { lt: new Date() },
            }
        });

        return result.count;
    }

    /**
   * Get user's active sessions
   */
    static async getUserSessions(userId: number) {
        return await prisma.refreshToken.findMany({
            where: {
                userId,
                used: false,
                expiresAt: { gt: new Date() }
            },
            select: {
                id: true,
                family: true,
                createdAt: true,
                expiresAt: true,
                ipAddress: true,
                userAgent: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }


    /**
   * Revoke specific session
   */
    static async revokeSession(userId: number, family: string): Promise<void> {
        await prisma.refreshToken.deleteMany({
            where: { userId, family }
        })
    }


}
