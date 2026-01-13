import { Router } from 'express';
import UsersController from './users.controller';
import { authenticate } from '../../common/middlewares/auth.middleware';
import { authorize } from '../../common/middlewares/roles.middleware';
import { validate, validateParams, validateQuery } from '../../common/middlewares/validation.middleware';
import { Role } from '../../generated/prisma';
import { QueryUserSchema } from './dto/query-user.dto';
import { ChangePasswordDtoSchema } from './dto/change-password.dto';
import { UserIdSchema } from './dto/user-id.dto';
import { UpdateUserDtoSchema } from './dto/update-user.dto';
import { UsernameSchema } from './dto/username.dto';

const router = Router();

// Public routes
router.get('/username/:username', validateParams(UsernameSchema), UsersController.getUserByUsername);

// Protected routes (require authentication)
router.use(authenticate);

// Get current user profile
router.get('/me', UsersController.getCurrentUser);

// Get all users (Admin only)
router.get(
  '/',
  authorize(Role.ADMIN),
  validateQuery(QueryUserSchema),
  UsersController.getAllUsers
);

// Get user by ID
router.get(
  '/:id',
  validateParams(UserIdSchema),
  UsersController.getUserById
);

// Update user
router.put(
  '/:id',
  validateParams(UserIdSchema),
  validate(UpdateUserDtoSchema),
  UsersController.updateUser
);

// Change password
router.put(
  '/:id/password',
  validateParams(UserIdSchema),
  validate(ChangePasswordDtoSchema),
  UsersController.changePassword
);


// Delete user (Admin only)
router.delete(
  '/:id',
  authorize(Role.ADMIN),
  validateParams(UserIdSchema),
  UsersController.deleteUser
);

export default router;