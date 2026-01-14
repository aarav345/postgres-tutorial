import { asyncHandler } from '../../common/utils/asyncHandler.util.js';
import { ResponseUtil } from '../../common/utils/response.util.js';
import AuthService from './auth.service.js';
import { MESSAGES } from '../../common/constants/messages.constant.js';
import type { RegisterDto } from './dto/register.dto.js';
import type { LoginDto } from './dto/login.dto.js';
import { JwtUtil } from '@/common/utils/jwt.util.js';
import { AppError } from '@/common/errors/app.error.js';
import { RefreshTokenService } from './token.service.js';


export class AuthController {
  register = asyncHandler<RegisterDto, undefined, undefined>(
    async (req, res): Promise<void> => {
      const data = req.validatedBody;
      const result = await AuthService.register(data);

      ResponseUtil.success(res, result, MESSAGES.AUTH.REGISTER_SUCCESS, 201);
    }
  );

  login = asyncHandler<LoginDto, undefined, undefined>(
    async (req, res): Promise<void> => {
      const { email, password } = req.validatedBody;
      const metadata = JwtUtil.extractMetadata(req);

      const result = await AuthService.login(email, password, metadata);

      // Controller handles HTTP response
      JwtUtil.setRefreshTokenCookie(res, result.refreshToken);

      ResponseUtil.success(res, result, MESSAGES.AUTH.LOGIN_SUCCESS);
    }
  );


    /**
   * Refresh - Controller just handles HTTP layer
   */
  refresh = asyncHandler(
    async (req, res): Promise<void> => {
      const oldRefreshToken = JwtUtil.getRefreshTokenFromCookie(req);

      if (!oldRefreshToken) {
        throw new AppError('Refresh token not found', 401);
      }

      const metadata = JwtUtil.extractMetadata(req);

      try {
        // Service does all the business logic
        const result = await AuthService.refreshTokens(oldRefreshToken, metadata);

        // Set new refresh token in cookie
        JwtUtil.setRefreshTokenCookie(res, result.refreshToken);

        // Return new access token
        ResponseUtil.success(
          res,
          {
            accessToken: result.accessToken,
            user: result.user,
          },
          MESSAGES.AUTH.REFRESH_SUCCESS
        );
      } catch (error) {
        // Clear cookie on error
        JwtUtil.clearRefreshTokenCookie(res);
        throw error;
      }
    }
  );

  logout = asyncHandler(
    async (req, res): Promise<void> => {
      const refreshToken = JwtUtil.getRefreshTokenFromCookie(req);

      if (refreshToken) {
        await AuthService.logout(refreshToken);
      }

      JwtUtil.clearRefreshTokenCookie(res);

      ResponseUtil.success(res, null, MESSAGES.AUTH.LOGOUT_SUCCESS);
    }
  );



  /**
   * Logout from all devices
   */
  logoutAll = asyncHandler(
    async (req, res): Promise<void> => {
      const userId = req.user?.userId;

      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      await AuthService.logoutAll(userId);
      JwtUtil.clearRefreshTokenCookie(res);

      ResponseUtil.success(res, null, MESSAGES.AUTH.LOGOUT_ALL_SUCCESS);
    }
  );

  /**
   * Get active sessions for current user
   */
  getSessions = asyncHandler(
    async (req, res): Promise<void> => {
      const userId = req.user?.userId;

      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const sessions = await RefreshTokenService.getUserSessions(userId);

      ResponseUtil.success(res, { sessions }, 'Sessions retrieved successfully');
    }
  );

  /**
   * Revoke specific session by family ID
   */
  revokeSession = asyncHandler(
    async (req, res): Promise<void> => {
      const userId = req.user?.userId;
      const { family } = req.params;

      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      await RefreshTokenService.revokeSession(userId, family);

      ResponseUtil.success(res, null, 'Session revoked successfully');
    }
  );

  

}

export default new AuthController();