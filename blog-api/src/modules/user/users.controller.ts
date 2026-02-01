import { asyncHandler } from '../../common/utils/asyncHandler.util.js';
import { ResponseUtil } from '../../common/utils/response.util.js';
import { PaginationUtil } from '../../common/utils/pagination.util.js';
import UsersService from './users.service.js';
import { MESSAGES } from '../../common/constants/messages.constant.js';
import type { UpdateUserDto } from './dto/update-user.dto.js';
import type { ChangePasswordDto } from './dto/change-password.dto.js';
import type { QueryUserDto } from './dto/query-user.dto.js';
import type { UserIdDto } from './dto/user-id.dto.js';
import type { UsernameDto } from './dto/username.dto.js';
import AuthService from '../auth/auth.service.js';
import { JwtUtil } from '@/common/utils/jwt.util.js';




export class UsersController {

  // GET /api/v1/users - Get all users (Admin only)
  getAllUsers = asyncHandler<undefined, QueryUserDto, undefined>(
    async (req, res): Promise<void> => {
      const { page, limit, role, search } = req.validatedQuery;
      const pagination = PaginationUtil.paginate(page, limit);
      
      const result = await UsersService.findAll({
        ...pagination,
        role,
        search,
      });

      ResponseUtil.paginated(
        res,
        result.users,
        {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit),
        },
        MESSAGES.USER.USERS_FETCHED
      );
    }
  );

  // GET /api/v1/users/:id - Get user by ID
  getUserById = asyncHandler<undefined, undefined, UserIdDto>(
    async (req, res): Promise<void> => {
      const { id } = req.validatedParams;
      const user = await UsersService.findById(Number(id));
      
      ResponseUtil.success(
        res,
        UsersService.sanitizeUser(user),
        MESSAGES.USER.USERS_FETCHED
      );
    }
  );

  // GET /api/v1/users/me - Get current user profile
  getCurrentUser = asyncHandler(
    async (req, res): Promise<void> => {
      const user = await UsersService.findById(req.user!.userId);
      
      ResponseUtil.success(
        res,
        UsersService.sanitizeUser(user),
        MESSAGES.USER.PROFILE_FETCHED
      );
    }
  );

  // PUT /api/v1/users/:id - Update user
  updateUser = asyncHandler<UpdateUserDto, undefined, UserIdDto>(
    async (req, res): Promise<void> => {
      const { id } = req.validatedParams;
      const data = req.validatedBody;
      
      const updatedUser = await UsersService.update(
        Number(id),
        data,
        req.user!.userId,
        req.user!.role
      );

      ResponseUtil.success(
        res,
        UsersService.sanitizeUser(updatedUser),
        MESSAGES.USER.UPDATED
      );
    }
  );

  // PUT /api/v1/users/:id/password - Change password
  changePassword = asyncHandler<ChangePasswordDto, undefined, UserIdDto>(
    async (req, res): Promise<void> => {
      const { id } = req.validatedParams;
      const { currentPassword, newPassword } = req.validatedBody;

      await UsersService.changePassword(
        Number(id),
        currentPassword,
        newPassword,
        Number(req.user!.userId)
      );

      await AuthService.logoutAll(Number(req.user!.userId));
      JwtUtil.clearRefreshTokenCookie(res);

      ResponseUtil.success(res, null, MESSAGES.USER.PASSWORD_CHANGED);
    }
  );

  // DELETE /api/v1/users/:id - Delete user (Admin only)
  deleteUser = asyncHandler<undefined, undefined, UserIdDto>(
    async (req, res): Promise<void> => {
      const { id } = req.validatedParams;
      
      await UsersService.delete(Number(id), req.user!.role);

      ResponseUtil.success(res, null, MESSAGES.USER.DELETED);
    }
  );

  // GET /api/v1/users/username/:username - Get user by username
  getUserByUsername = asyncHandler<undefined, undefined, UsernameDto>(
    async (req, res): Promise<void> => {
      const { username } = req.validatedParams;
      const user = await UsersService.findByUsername(username);

      if (!user) {
        ResponseUtil.error(res, MESSAGES.USER.NOT_FOUND, 404);
        return;
      }

      ResponseUtil.success(
        res,
        UsersService.sanitizeUser(user),
        MESSAGES.USER.USERS_FETCHED
      );
    }
  );
}


export default new UsersController();
