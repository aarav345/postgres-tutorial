import type { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler.util';
import { ResponseUtil } from '../../common/utils/response.util';
import { PaginationUtil } from '../../common/utils/pagination.util';
import UsersService from './users.service';
import { MESSAGES } from '../../common/constants/messages.constant';
import type { UpdateUserDto } from './dto/update-user.dto';
import type { ChangePasswordDto } from './dto/change-password.dto';


export class UsersController {

    // GET /api/v1/users - Get all users (Admin only)
    getAllUsers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { page, limit } = req.query;
    const pagination = PaginationUtil.paginate(Number(page), Number(limit));
    
    const result = await UsersService.findAll({
        ...pagination,
        ...req.query,
    });

    const sanitizedUsers = result.users.map(user => 
        UsersService.sanitizeUser(user as any)
    );

    ResponseUtil.paginated(
        res,
        sanitizedUsers,
        {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: Math.ceil(result.total / result.limit),
        },
        'Users fetched successfully'
        );
    });

  // GET /api/v1/users/:id - Get user by ID
    getUserById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const user = await UsersService.findById(Number(id));
        
        ResponseUtil.success(
        res,
        UsersService.sanitizeUser(user),
        'User fetched successfully'
        );
    });

  // GET /api/v1/users/me - Get current user profile
    getCurrentUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const user = await UsersService.findById(req.user!.id);
        
        ResponseUtil.success(
        res,
        UsersService.sanitizeUser(user),
        'Profile fetched successfully'
        );
    });

  // PUT /api/v1/users/:id - Update user
    updateUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const data: UpdateUserDto = req.body;
        
        const updatedUser = await UsersService.update(
        Number(id),
        data,
        req.user!.id,
        req.user!.role
        );

        ResponseUtil.success(
        res,
        UsersService.sanitizeUser(updatedUser),
        MESSAGES.USER.UPDATED
        );
    });

  // PUT /api/v1/users/:id/password - Change password
    changePassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const { currentPassword, newPassword }: ChangePasswordDto = req.body;

        await UsersService.changePassword(
        Number(id),
        currentPassword,
        newPassword,
        req.user!.id
        );

        ResponseUtil.success(res, null, MESSAGES.USER.PASSWORD_CHANGED);
    });

  // DELETE /api/v1/users/:id - Delete user (Admin only)
    deleteUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        
        await UsersService.delete(Number(id), req.user!.role);

        ResponseUtil.success(res, null, MESSAGES.USER.DELETED);
    });

  // GET /api/v1/users/username/:username - Get user by username
    getUserByUsername = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const { username } = req.params;
        const user = await UsersService.findByUsername(username);

        if (!user) {
        ResponseUtil.error(res, MESSAGES.USER.NOT_FOUND, 404);
        return;
        }

        ResponseUtil.success(
        res,
        UsersService.sanitizeUser(user),
        'User fetched successfully'
        );
    });
    }

export default new UsersController();
