import { Router } from 'express';
import UsersController from './users.controller';
import { authenticate } from '../../common/middlewares/auth.middleware';
import { authorize } from '../../common/middlewares/roles.middleware';
import { validate } from '../../common/middlewares/validation.middleware';
import { Role } from '../../generated/prisma';
import {
  updateUserValidation,
  changePasswordValidation,
  queryUsersValidation,
  userIdValidation,
} from './users.validation';

const router = Router();

// Public routes
router.get('/username/:username', UsersController.getUserByUsername);

// Protected routes (require authentication)
router.use(authenticate);

// Get current user profile
router.get('/me', UsersController.getCurrentUser);

// Get all users (Admin only)
router.get(
  '/',
  authorize(Role.ADMIN),
  queryUsersValidation,
  validate,
  UsersController.getAllUsers
);

// Get user by ID
router.get(
  '/:id',
  userIdValidation,
  validate,
  UsersController.getUserById
);

// Update user
router.put(
  '/:id',
  userIdValidation,
  updateUserValidation,
  validate,
  UsersController.updateUser
);

// Change password
router.put(
  '/:id/password',
  userIdValidation,
  changePasswordValidation,
  validate,
  UsersController.changePassword
);

// Delete user (Admin only)
router.delete(
  '/:id',
  authorize(Role.ADMIN),
  userIdValidation,
  validate,
  UsersController.deleteUser
);

export default router;