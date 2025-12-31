import { Router } from 'express';
import userRoutes from '../modules/users/users.route';
import authRoutes from '../modules/auth/auth.route';

const router = Router();

// Module routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

// API info
router.get('/', (_req, res) => {
    res.json({
        message: 'Blog API',
        version: '1.0.0',
        endpoints: {
        auth: '/api/v1/auth',
        users: '/api/v1/users',
        },
    });
});

export default router;

