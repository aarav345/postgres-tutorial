import { asyncHandler } from '../../common/utils/asyncHandler.util.js';
import { ResponseUtil } from '../../common/utils/response.util.js';
import AuthService from './auth.service.js';
import { MESSAGES } from '../../common/constants/messages.constant.js';
import type { RegisterDto } from './dto/register.dto.js';
import type { LoginDto } from './dto/login.dto.js';
import type { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { JwtUtil } from '@/common/utils/jwt.util.js';

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

  refreshToken = asyncHandler<RefreshTokenDto, undefined, undefined>(
    async (req, res): Promise<void> => {
      const { refreshToken } = req.validatedBody;
      const metadata = JwtUtil.extractMetadata(req);
      const result = await AuthService.refreshTokens(refreshToken, metadata);
      ResponseUtil.success(res, result, 'Token refreshed successfully');
    }
  );


    /**
   * Refresh - Controller just handles HTTP layer
   */
  // static async refresh(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const oldRefreshToken = JwtUtil.getRefreshTokenFromCookie(req);

  //     if (!oldRefreshToken) {
  //       throw new AppError('Refresh token not found', 401);
  //     }

  //     const metadata = JwtUtil.extractMetadata(req);

  //     // Service does all the business logic
  //     const result = await AuthService.refreshTokens(oldRefreshToken, metadata);

  //     // Controller handles HTTP response
  //     JwtUtil.setRefreshTokenCookie(res, result.refreshToken);

  //     res.json({
  //       accessToken: result.accessToken,
  //       user: result.user,
  //     });
  //   } catch (error) {
  //     JwtUtil.clearRefreshTokenCookie(res);
  //     next(error);
  //   }
  // }

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

  

}

export default new AuthController();