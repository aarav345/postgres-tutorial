import { Router } from 'express';
import AuthController from './auth.controller.js';
import { validate } from '../../common/middlewares/validation.middleware.js';
import { RegisterSchema } from './dto/register.dto.js';
import { LoginSchema } from './dto/login.dto.js';
import { authenticate } from '@/common/middlewares/auth.middleware.js';

const router = Router();

router.post('/register', validate(RegisterSchema), AuthController.register);
router.post('/login', validate(LoginSchema), AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/logout', AuthController.logout);

router.post('/logout-all', authenticate, AuthController.logoutAll);
router.get('/sessions', authenticate, AuthController.getSessions);
router.delete('/sessions/:family', authenticate, AuthController.revokeSession);

export default router;