import { Router } from 'express';
import userRoutes from '../modules/user/users.route.js';
import authRoutes from '../modules/auth/auth.route.js';
import categoryRoutes from '../modules/category/category.route.js';
import postRoutes from '../modules/post/post.route.js';

const router = Router();

// Module routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/posts', postRoutes);


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

