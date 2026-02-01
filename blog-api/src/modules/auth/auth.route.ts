import { Router } from 'express';
import AuthController from './auth.controller.js';
import { validate, validateParams } from '../../common/middlewares/validation.middleware.js';
import { RegisterSchema } from './dto/register.dto.js';
import { LoginSchema } from './dto/login.dto.js';
import { authenticate } from '@/common/middlewares/auth.middleware.js';
import { familySchema } from './dto/family.dto.js';

const router = Router();

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a new user
 *     description: Create a new user account with username, email, and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           examples:
 *             user:
 *               summary: Regular user registration
 *               value:
 *                 username: johndoe
 *                 email: john@example.com
 *                 password: SecureP@ss123
 *                 fullName: John Doe
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               success: true
 *               data:
 *                 user:
 *                   id: 550e8400-e29b-41d4-a716-446655440000
 *                   username: johndoe
 *                   email: john@example.com
 *                   role: USER
 *                   createdAt: 2024-01-15T10:30:00.000Z
 *                   updatedAt: 2024-01-15T10:30:00.000Z
 *                 accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *               message: User registered successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest400'
 *       409:
 *         $ref: '#/components/responses/Conflict409'
 *       500:
 *         $ref: '#/components/responses/ServerError500'
 */
router.post('/register', validate(RegisterSchema), AuthController.register);
router.post('/login', validate(LoginSchema), AuthController.login);
router.get('/refresh', AuthController.refresh);
router.get('/logout', AuthController.logout);

router.post('/logout-all', authenticate, AuthController.logoutAll);
router.get('/sessions', authenticate, AuthController.getSessions);
router.delete('/sessions/:family', authenticate, validateParams(familySchema), AuthController.revokeSession);

export default router;