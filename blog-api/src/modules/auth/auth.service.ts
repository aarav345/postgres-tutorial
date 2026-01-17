import { BcryptUtil } from '../../common/utils/bcrypt.util.js';
import { MESSAGES } from '../../common/constants/messages.constant.js';
import { UsersService } from '../users/users.service.js';
import type { RegisterDto } from './dto/register.dto.js';
import type { User } from '../../generated/prisma';
import { AppError, UnauthorizedError } from '../../common/errors/app.error.js';
import { JwtUtil } from '@/common/utils/jwt.util.js';
import { RefreshTokenService } from './token.service.js';
import type { AuthResponse } from './interfaces/auth-response.interface.js';
import prisma from '@/database/prisma.client.js';

export class AuthService {
  private usersService: UsersService;

  constructor() {
    this.usersService = new UsersService();

  }

  async register(data: RegisterDto): Promise<Omit<User, 'password'>> {
    const { email, username, password } = data;

    // Check if user exists
    const existingUser = await this.usersService.findByEmailOrUsername(email, username);
    if (existingUser) {
      throw new AppError(MESSAGES.USER.ALREADY_EXISTS, 409);
    }

    // Hash password
    const hashedPassword = await BcryptUtil.hash(password);

    // Create user
    const user = await this.usersService.create({
      email,
      username,
      password: hashedPassword,
      role: 'USER',
    });

    return this.sanitizeUser(user);
  }

  async login(email: string, password: string, metadata?: { ipAddress?: string; userAgent?: string } ): Promise<AuthResponse> {

    // Find user
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedError(MESSAGES.AUTH.INVALID_CREDENTIALS);
    }

    // Verify password
    const isPasswordValid = await BcryptUtil.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError(MESSAGES.AUTH.INVALID_CREDENTIALS);
    }

    // Generate access tokens
    const accessToken = JwtUtil.generateAccessToken({
      userId: user.id,
      role: user.role,
    });


    // generate refresh tokens database stored
    const refreshToken = await RefreshTokenService.createRefreshToken(user.id, undefined, metadata);

    return {
      user: this.sanitizeUser(user),
      accessToken: accessToken,
      refreshToken: refreshToken,
    }
  }

  /**
   * Refresh - rotates refresh token and generates new access token
   */
  async refreshTokens(
    oldRefreshToken: string,
    metadata?: { ipAddress?: string; userAgent?: string }
  ) {
    // 1. Rotate refresh token (validates + creates new one)
    const { userId, token, user } = await RefreshTokenService.rotateRefreshToken(
      oldRefreshToken,
      metadata
    );

    // 2. Generate new access token
    const accessToken = JwtUtil.generateAccessToken({
      userId: userId,
      role: user.role,
    });

    return {
      accessToken,
      refreshToken: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Logout - revokes refresh token family
   */
  async logout(refreshToken: string) {
    const token = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (token) {
      await RefreshTokenService.revokeTokenFamily(token.family);
    }
  }

  /**
   * Logout all devices
   */
  async logoutAll(userId: number) {
    await RefreshTokenService.revokeAllUserTokens(userId);
  }


  private sanitizeUser(user: User): Omit<User, 'password'> {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}

export default new AuthService();