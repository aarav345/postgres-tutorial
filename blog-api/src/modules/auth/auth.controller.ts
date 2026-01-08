import type { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler.util';
import { ResponseUtil } from '../../common/utils/response.util';
import AuthService from './auth.service';
import { MESSAGES } from '../../common/constants/messages.constant';
import type { RegisterDto } from './dto/register.dto';
import type { LoginDto } from './dto/login.dto';

export class AuthController {
  register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data: RegisterDto = req.body;
    const result = await AuthService.register(data);
    ResponseUtil.success(res, result, MESSAGES.AUTH.REGISTER_SUCCESS, 201);
  });

  login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password }: LoginDto = req.body;
    const result = await AuthService.login(email, password);
    ResponseUtil.success(res, result, MESSAGES.AUTH.LOGIN_SUCCESS);
  });

  refreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;
    const result = await AuthService.refreshToken(refreshToken);
    ResponseUtil.success(res, result, 'Token refreshed successfully');
  });

  getProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = req.user;
    ResponseUtil.success(res, user, 'Profile fetched successfully');
  });

  logout = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    // In a real app, you might want to blacklist the token
    ResponseUtil.success(res, null, MESSAGES.AUTH.LOGOUT_SUCCESS);
  });
}

export default new AuthController();
