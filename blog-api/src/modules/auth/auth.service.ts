import { BcryptUtil } from '../../common/utils/bcrypt.util';
import { JwtUtil } from '../../common/utils/jwt.util';
import { MESSAGES } from '../../common/constants/messages.constant';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { AuthResponse } from './interfaces/auth-response.interface';
import { User } from '../../generated/prisma';
import { AppError, UnauthorizedError } from '../../common/errors/app.error';
import { JwtPayload } from '../../common/types/jwt-payload.interface';

export class AuthService {
  private usersService: UsersService;

  constructor() {
    this.usersService = new UsersService();
  }

  async register(data: RegisterDto): Promise<AuthResponse> {
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

    // Generate tokens
    const tokens = this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async login(email: string, password: string): Promise<AuthResponse> {
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

    // Generate tokens
    const tokens = this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const decoded = JwtUtil.verifyRefreshToken(refreshToken);
      
      const user = await this.usersService.findById(decoded.id);
      if (!user) {
        throw new AppError(MESSAGES.USER.NOT_FOUND, 404);
      }

      const tokens = this.generateTokens(user);
      
      return {
        user: this.sanitizeUser(user),
        ...tokens,
      };
    } catch (error) {
      throw new UnauthorizedError(MESSAGES.AUTH.TOKEN_INVALID);
    }
  }

  private generateTokens(user: User): { accessToken: string; refreshToken: string } {
    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    const accessToken = JwtUtil.generateAccessToken(payload);
    const refreshToken = JwtUtil.generateRefreshToken({ id: user.id });

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: User): Omit<User, 'password'> {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}

export default new AuthService();