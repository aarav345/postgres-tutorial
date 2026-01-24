import { Router } from 'express';
import CategoriesController from './category.controller';
import { authenticate } from '@/common/middlewares/auth.middleware';
import { authorize } from '@/common/middlewares/roles.middleware';
import { validate, validateParams, validateQuery } from '@/common/middlewares/validation.middleware';
import { Role } from '@/generated/prisma';
import { CreateCategorySchema } from './dto/create-category.dto';
import { UpdateCategorySchema } from './dto/update-category.dto';
import { QueryCategorySchema } from './dto/query-category.dto';
import { CategoryIdSlugSchema } from './dto/id-slug.dto';

const router = Router();

// Public routes
// Get all categories
router.get(
    '/',
    validateQuery(QueryCategorySchema),
    CategoriesController.getAllCategories
);

// Get popular categories
router.get('/popular', CategoriesController.getPopularCategories);

// Get categories with published posts
router.get('/with-posts', CategoriesController.getCategoriesWithPosts);

// Get category by slug
router.get(
    '/slug/:slug',
    validateParams(CategoryIdSlugSchema),
    CategoriesController.getCategoryBySlug
);


// Create category (Admin only)
router.post(
    '/',
    authenticate,
    authorize(Role.ADMIN),
    validate(CreateCategorySchema),
    CategoriesController.createCategory
);

// Get category statistics (Admin only)
router.get('/statistics', authenticate, authorize(Role.ADMIN), CategoriesController.getCategoryStatistics);

// Update category (Admin only)
router.put(
    '/:id',
    authenticate,
    authorize(Role.ADMIN),
    validateParams(CategoryIdSlugSchema),
    validate(UpdateCategorySchema),
    CategoriesController.updateCategory
);

// Delete category (Admin only)
router.delete(
    '/:id',
    authenticate,
    authorize(Role.ADMIN),
    validateParams(CategoryIdSlugSchema),
    CategoriesController.deleteCategory
);


// Get category by ID public route
router.get(
    '/:id',
    validateParams(CategoryIdSlugSchema),
    CategoriesController.getCategoryById
);

export default router;