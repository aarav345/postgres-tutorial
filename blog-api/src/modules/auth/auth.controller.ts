import type { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler.util.js';
import { ResponseUtil } from '../../common/utils/response.util.js';
import AuthService from './auth.service.js';
import { MESSAGES } from '../../common/constants/messages.constant.js';
import type { RegisterDto } from './dto/register.dto.js';
import type { LoginDto } from './dto/login.dto.js';
import type { RefreshTokenDto } from './dto/refresh-token.dto.js';

export class AuthController {
  register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data = req.body as RegisterDto;
    const result = await AuthService.register(data);
    ResponseUtil.success(res, result, MESSAGES.AUTH.REGISTER_SUCCESS, 201);
  });

  login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body as LoginDto;
    const result = await AuthService.login(email, password);
    ResponseUtil.success(res, result, MESSAGES.AUTH.LOGIN_SUCCESS);
  });

  refreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body as RefreshTokenDto;
    const result = await AuthService.refreshToken(refreshToken);
    ResponseUtil.success(res, result, 'Token refreshed successfully');
  });

  getProfile = asyncHandler( (req: Request, res: Response): void => {
    const user = req.user ;
    ResponseUtil.success(res, user, 'Profile fetched successfully');
  });

  logout = asyncHandler((_req: Request, res: Response): void => {
    // In a real app, you might want to blacklist the token
    ResponseUtil.success(res, null, MESSAGES.AUTH.LOGOUT_SUCCESS);
  });
}

export default new AuthController();
