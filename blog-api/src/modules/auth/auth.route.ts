import { Router } from 'express';
import AuthController from './auth.controller.js';
import { validate } from '../../common/middlewares/validation.middleware.js';
import { authenticate } from '../../common/middlewares/auth.middleware.js';
import { RegisterSchema } from './dto/register.dto.js';
import { LoginSchema } from './dto/login.dto.js';
import { RefreshTokenSchema } from './dto/refresh-token.dto.js';

const router = Router();

router.post('/register', validate(RegisterSchema), AuthController.register);
router.post('/login', validate(LoginSchema), AuthController.login);
router.post('/refresh', validate(RefreshTokenSchema), AuthController.refreshToken);
router.get('/profile', authenticate, AuthController.getProfile);
router.post('/logout', authenticate, AuthController.logout);

export default router;