import { asyncHandler } from '@/common/utils/asyncHandler.util';
import { ResponseUtil } from '@/common/utils/response.util';
import { PaginationUtil } from '@/common/utils/pagination.util';
import PostsService from './post.service';
import { MESSAGES } from '@/common/constants/messages.constant';
import type { CreatePostDto } from './dto/create-post.dto';
import type { UpdatePostDto } from './dto/update-post.dto';
import type { QueryPostDto } from './dto/query-post.dto';
import type { PostIdDto } from './dto/post-id.dto';
import type { PostSlugDto } from './dto/post-slug.dto';

export class PostsController {
  // POST /api/v1/posts - Create new post (Authenticated users)
    createPost = asyncHandler<CreatePostDto, undefined, undefined>(
        async (req, res): Promise<void> => {
            const data = req.validatedBody;
            const post = await PostsService.create(data, req.user!.userId);

            ResponseUtil.success(res, post, MESSAGES.POST.CREATED, 201);
        }
    );

    // GET /api/v1/posts - Get all posts (with filters)
    getAllPosts = asyncHandler<undefined, QueryPostDto, undefined>(
        async (req, res): Promise<void> => {
            const { page, limit, search, categoryId, authorId, published, featured } = req.validatedQuery;
            const pagination = PaginationUtil.paginate(page, limit);

            const result = await PostsService.findAll({
                ...pagination,
                search,
                categoryId,
                authorId,
                published,
                featured,
            });

            ResponseUtil.paginated(
                res,
                result.data,
                {
                    page: result.pagination.page,
                    limit: result.pagination.limit,
                    total: result.pagination.total,
                    totalPages: result.pagination.totalPages,
                },
                MESSAGES.POST.FETCHED
            );
        }
    );

    // GET /api/v1/posts/published - Get published posts (Public)
    getPublishedPosts = asyncHandler<undefined, QueryPostDto, undefined>(
        async (req, res): Promise<void> => {
        const { page, limit, search, categoryId, authorId, featured } = req.validatedQuery;
        const pagination = PaginationUtil.paginate(page, limit);

        const result = await PostsService.findPublished({
            ...pagination,
            search,
            categoryId,
            authorId,
            featured,
        });

        ResponseUtil.paginated(
            res,
            result.data,
            {
                page: result.pagination.page,
                limit: result.pagination.limit,
                total: result.pagination.total,
                totalPages: result.pagination.totalPages,
            },
            MESSAGES.POST.FETCHED
        );
        }
    );

    // GET /api/v1/posts/featured - Get featured posts (Public)
    getFeaturedPosts = asyncHandler<undefined, { limit?: string }, undefined>(
        async (req, res): Promise<void> => {
        const limit = req.query.limit ? Number(req.query.limit) : 5;
        const posts = await PostsService.findFeatured(limit);

        ResponseUtil.success(res, posts, MESSAGES.POST.FETCHED);
        }
    );

    // GET /api/v1/posts/popular - Get popular posts (Public)
    getPopularPosts = asyncHandler<undefined, { limit?: string; days?: string }, undefined>(
        async (req, res): Promise<void> => {
        const limit = req.query.limit ? Number(req.query.limit) : 10;
        const days = req.query.days ? Number(req.query.days) : 30;
        
        const posts = await PostsService.findPopular({ limit, days });

        ResponseUtil.success(res, posts, MESSAGES.POST.FETCHED);
        }
    );

    // GET /api/v1/posts/author/:authorId - Get posts by author
    getPostsByAuthor = asyncHandler<undefined, QueryPostDto, { authorId: string }>(
        async (req, res): Promise<void> => {
        const authorId = Number(req.params.authorId);
        const { page, limit, published } = req.validatedQuery;
        const pagination = PaginationUtil.paginate(page, limit);

        const result = await PostsService.findByAuthor(authorId, {
            ...pagination,
            published,
        });

        ResponseUtil.paginated(
            res,
            result.data,
            {
            page: result.pagination.page,
            limit: result.pagination.limit,
            total: result.pagination.total,
            totalPages: result.pagination.totalPages,
            },
            MESSAGES.POST.FETCHED
        );
        }
    );

    // GET /api/v1/posts/category/:categoryId - Get posts by category
    getPostsByCategory = asyncHandler<undefined, QueryPostDto, { categoryId: string }>(
        async (req, res): Promise<void> => {
            const categoryId = Number(req.params.categoryId);
            const { page, limit, published } = req.validatedQuery;
            const pagination = PaginationUtil.paginate(page, limit);

            const result = await PostsService.findByCategory(categoryId, {
                ...pagination,
                published,
            });

            ResponseUtil.paginated(
                res,
                result.data,
                {
                    page: result.pagination.page,
                    limit: result.pagination.limit,
                    total: result.pagination.total,
                    totalPages: result.pagination.totalPages,
                },
                MESSAGES.POST.FETCHED
            );
        }
    );

    // GET /api/v1/posts/statistics - Get post statistics
    getPostStatistics = asyncHandler<undefined, { authorId?: string }, undefined>(
        async (req, res): Promise<void> => {
            const authorId = req.query.authorId ? Number(req.query.authorId) : undefined;
            const statistics = await PostsService.getStatistics(authorId);

            ResponseUtil.success(res, statistics, MESSAGES.POST.STATISTICS_FETCHED);
        }
    );

    // GET /api/v1/posts/:id - Get post by ID
    getPostById = asyncHandler<undefined, { includeRelations?: string }, PostIdDto>(
        async (req, res): Promise<void> => {
            const { id } = req.validatedParams;
            const includeRelations = req.query.includeRelations === 'true';

            const post = await PostsService.findById(Number(id), includeRelations);

            ResponseUtil.success(res, post, MESSAGES.POST.FETCHED);
        }
    );

    // GET /api/v1/posts/slug/:slug - Get post by slug
    getPostBySlug = asyncHandler<undefined, { includeRelations?: string }, PostSlugDto>(
        async (req, res): Promise<void> => {
            const { slug } = req.validatedParams;
            const includeRelations = req.query.includeRelations === 'true';

            const post = await PostsService.findBySlug(slug, includeRelations);

            // Increment view count (fire and forget)
            PostsService.incrementViewCount(post.id).catch(() => {
                // Silently fail - don't block response
            });

            ResponseUtil.success(res, post, MESSAGES.POST.FETCHED);
        }
    );

    // GET /api/v1/posts/:id/related - Get related posts
    getRelatedPosts = asyncHandler<undefined, { limit?: string }, PostIdDto>(
        async (req, res): Promise<void> => {
            const { id } = req.validatedParams;
            const limit = req.query.limit ? Number(req.query.limit) : 5;

            const post = await PostsService.findById(Number(id));
            const relatedPosts = await PostsService.findRelated(post.id, post.categoryId, limit);

            ResponseUtil.success(res, relatedPosts, MESSAGES.POST.FETCHED);
        }
    );

    // PUT /api/v1/posts/:id - Update post
    updatePost = asyncHandler<UpdatePostDto, undefined, PostIdDto>(
        async (req, res): Promise<void> => {
            const { id } = req.validatedParams;
            const data = req.validatedBody;

            const updatedPost = await PostsService.update(
                Number(id),
                data,
                req.user!.userId,
                req.user!.role
            );

            ResponseUtil.success(res, updatedPost, MESSAGES.POST.UPDATED);
        }
    );

    // PUT /api/v1/posts/:id/publish - Publish post
    publishPost = asyncHandler<undefined, undefined, PostIdDto>(
        async (req, res): Promise<void> => {
            const { id } = req.validatedParams;

            const post = await PostsService.publish(
                Number(id),
                req.user!.userId,
                req.user!.role
            );

            ResponseUtil.success(res, post, MESSAGES.POST.PUBLISHED);
        }
    );

    // PUT /api/v1/posts/:id/unpublish - Unpublish post
    unpublishPost = asyncHandler<undefined, undefined, PostIdDto>(
        async (req, res): Promise<void> => {
            const { id } = req.validatedParams;

            const post = await PostsService.unpublish(
                Number(id),
                req.user!.userId,
                req.user!.role
            );

            ResponseUtil.success(res, post, MESSAGES.POST.UNPUBLISHED);
        }
    );

    // PUT /api/v1/posts/:id/toggle-featured - Toggle featured status (Admin only)
    toggleFeatured = asyncHandler<undefined, undefined, PostIdDto>(
        async (req, res): Promise<void> => {
            const { id } = req.validatedParams;

            const post = await PostsService.toggleFeatured(Number(id));

            ResponseUtil.success(res, post, MESSAGES.POST.FEATURED_TOGGLED);
        }
    );

    // DELETE /api/v1/posts/:id - Delete post
    deletePost = asyncHandler<undefined, undefined, PostIdDto>(
        async (req, res): Promise<void> => {
            const { id } = req.validatedParams;

            await PostsService.delete(Number(id), req.user!.userId, req.user!.role);

            ResponseUtil.success(res, null, MESSAGES.POST.DELETED);
        }
    );
}

export default new PostsController();