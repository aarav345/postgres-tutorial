import { Router } from 'express';
import PostsController from './post.controller';
import { authenticate } from '@/common/middlewares/auth.middleware';
import { authorize } from '@/common/middlewares/roles.middleware';
import { validate, validateParams, validateQuery } from '@/common/middlewares/validation.middleware';
import { Role } from '@/generated/prisma';
import { CreatePostDtoSchema } from './dto/create-post.dto';
import { UpdatePostDtoSchema } from './dto/update-post.dto';
import { QueryPostDtoSchema } from './dto/query-post.dto';
import { PostIdSchema } from './dto/post-id.dto';
import { PostSlugSchema } from './dto/post-slug.dto';

const router = Router();

// ===== PUBLIC ROUTES =====
// Get published posts
router.get(
    '/published',
    validateQuery(QueryPostDtoSchema),
    PostsController.getPublishedPosts
);

// Get featured posts
router.get('/featured', PostsController.getFeaturedPosts);

// Get popular posts
router.get('/popular', PostsController.getPopularPosts);

// Get post by slug (must be before /:id to avoid conflicts)
router.get(
    '/slug/:slug',
    validateParams(PostSlugSchema),
    PostsController.getPostBySlug
);

// Get posts by author
router.get(
    '/author/:authorId',
    validateQuery(QueryPostDtoSchema),
    PostsController.getPostsByAuthor
);

// Get posts by category
router.get(
    '/category/:categoryId',
    validateQuery(QueryPostDtoSchema),
    PostsController.getPostsByCategory
);


// Create new post (any authenticated user can create)
router.post(
    '/',
    authenticate,
    validate(CreatePostDtoSchema),
    PostsController.createPost
);

// Get all posts (with filters, for admin/author dashboard)
router.get(
    '/',
    authenticate,
    validateQuery(QueryPostDtoSchema),
    PostsController.getAllPosts
);

// Get post statistics
router.get('/statistics', authenticate, PostsController.getPostStatistics);

// Get post by ID
router.get(
    '/:id',
    validateParams(PostIdSchema),
    PostsController.getPostById
);

// Get related posts
router.get(
    '/:id/related',
    validateParams(PostIdSchema),
    PostsController.getRelatedPosts
);


// Update post (author or admin)
router.put(
    '/:id',
    authenticate,
    validateParams(PostIdSchema),
    validate(UpdatePostDtoSchema),
    PostsController.updatePost
);

// Publish post (author or admin)
router.put(
    '/:id/publish',
    authenticate,
    validateParams(PostIdSchema),
    PostsController.publishPost
);

// Unpublish post (author or admin)
router.put(
    '/:id/unpublish',
    authenticate,
    validateParams(PostIdSchema),
    PostsController.unpublishPost
);

// Toggle featured status (Admin only)
router.put(
    '/:id/toggle-featured',
    authenticate,
    authorize(Role.ADMIN),
    validateParams(PostIdSchema),
    PostsController.toggleFeatured
);

// Delete post (author or admin)
router.delete(
    '/:id',
    authenticate,
    validateParams(PostIdSchema),
    PostsController.deletePost
);

export default router;