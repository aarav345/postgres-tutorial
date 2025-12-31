import { Router } from 'express';
import AuthController from './auth.controller';
import { registerValidation, loginValidation, refreshTokenValidation } from './auth.validation';
import { validate } from '../../common/middlewares/validation.middleware';
import { authenticate } from '../../common/middlewares/auth.middleware';

const router = Router();

router.post('/register', registerValidation, validate, AuthController.register);
router.post('/login', loginValidation, validate, AuthController.login);
router.post('/refresh', refreshTokenValidation, validate, AuthController.refreshToken);
router.get('/profile', authenticate, AuthController.getProfile);
router.post('/logout', authenticate, AuthController.logout);

export default router;