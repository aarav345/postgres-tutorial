import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PostsController } from '../../../src/modules/post/post.controller';
import PostsService from '../../../src/modules/post/post.service';
import { PostHelpers } from '../../helpers/posts-helpers';
import type { Response } from 'express';

vi.mock('@/modules/posts/post.service');

describe('PostsController', () => {
    let controller: PostsController;
    let res: Partial<Response>;
    let next: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.clearAllMocks();
        controller = new PostsController();
        next = vi.fn();

        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        };
    });

    // ─── Helper to build mock request ──────────────────────────────────
    function mockReq(overrides: {
        body?: any;
        query?: any;
        params?: any;
        user?: { userId: number; role: string };
    } = {}): any {
        return {
            validatedBody: overrides.body,
            validatedQuery: overrides.query ?? {},
            validatedParams: overrides.params ?? {},
            params: overrides.params ?? {},
            query: overrides.query ?? {},
            user: overrides.user ?? { userId: 1, role: 'USER' },
        };
    }

    // ─────────────────────────────────────────────────────────────────────
    // createPost
    // ─────────────────────────────────────────────────────────────────────
    describe('createPost', () => {
        it('should create post and return 201', async () => {
        const dto = PostHelpers.mockCreatePostDto();
        const created = PostHelpers.mockPost();

        vi.spyOn(PostsService, 'create').mockResolvedValue(created);

        await controller.createPost(
            mockReq({ body: dto, user: { userId: 1, role: 'USER' } }),
            res as Response,
            next
        );

        expect(PostsService.create).toHaveBeenCalledWith(dto, 1);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalled();
        });

        it('should pass authorId from authenticated user', async () => {
        const dto = PostHelpers.mockCreatePostDto();

        vi.spyOn(PostsService, 'create').mockResolvedValue(PostHelpers.mockPost());

        await controller.createPost(
            mockReq({ body: dto, user: { userId: 42, role: 'USER' } }),
            res as Response,
            next
        );

        expect(PostsService.create).toHaveBeenCalledWith(dto, 42);
        });
    });

    // ─────────────────────────────────────────────────────────────────────
    // getAllPosts
    // ─────────────────────────────────────────────────────────────────────
    describe('getAllPosts', () => {
        it('should return paginated posts', async () => {
        const posts = PostHelpers.mockPosts(3);
        const paginated = PostHelpers.mockPaginationResult(posts, 1, 10, 3);

        vi.spyOn(PostsService, 'findAll').mockResolvedValue(paginated);

        await controller.getAllPosts(
            mockReq({ query: { page: 1, limit: 10 } }),
            res as Response,
            next
        );

        expect(PostsService.findAll).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalled();
        });

        it('should pass all query filters to service', async () => {
        vi.spyOn(PostsService, 'findAll').mockResolvedValue(
            PostHelpers.mockPaginationResult([], 1, 10, 0)
        );

        const query = {
            page: 2,
            limit: 5,
            search: 'node',
            categoryId: 1,
            authorId: 3,
            published: true,
            featured: true,
        };

        await controller.getAllPosts(mockReq({ query }), res as Response, next);

        expect(PostsService.findAll).toHaveBeenCalledWith(
            expect.objectContaining({
            search: 'node',
            categoryId: 1,
            authorId: 3,
            published: true,
            featured: true,
            })
        );
        });
    });

    // ─────────────────────────────────────────────────────────────────────
    // getPublishedPosts
    // ─────────────────────────────────────────────────────────────────────
    describe('getPublishedPosts', () => {
        it('should return published posts', async () => {
        const posts = [PostHelpers.mockPublishedPost()];

        vi.spyOn(PostsService, 'findPublished').mockResolvedValue(
            PostHelpers.mockPaginationResult(posts, 1, 10, 1)
        );

        await controller.getPublishedPosts(
            mockReq({ query: { page: 1, limit: 10 } }),
            res as Response,
            next
        );

        expect(PostsService.findPublished).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalled();
        });
    });

    // ─────────────────────────────────────────────────────────────────────
    // getFeaturedPosts
    // ─────────────────────────────────────────────────────────────────────
    describe('getFeaturedPosts', () => {
        it('should return featured posts with default limit', async () => {
        const posts = [PostHelpers.mockFeaturedPost()];

        vi.spyOn(PostsService, 'findFeatured').mockResolvedValue(posts);

        await controller.getFeaturedPosts(
            mockReq({ query: {} }),
            res as Response,
            next
        );

        expect(PostsService.findFeatured).toHaveBeenCalledWith(5);
        });

        it('should use limit from query when provided', async () => {
        vi.spyOn(PostsService, 'findFeatured').mockResolvedValue([]);

        await controller.getFeaturedPosts(
            mockReq({ query: { limit: '3' } }),
            res as Response,
            next
        );

        expect(PostsService.findFeatured).toHaveBeenCalledWith(3);
        });
    });

    // ─────────────────────────────────────────────────────────────────────
    // getPopularPosts
    // ─────────────────────────────────────────────────────────────────────
    describe('getPopularPosts', () => {
        it('should return popular posts with defaults', async () => {
        vi.spyOn(PostsService, 'findPopular').mockResolvedValue([]);

        await controller.getPopularPosts(
            mockReq({ query: {} }),
            res as Response,
            next
        );

        expect(PostsService.findPopular).toHaveBeenCalledWith({ limit: 10, days: 30 });
        });

        it('should use custom limit and days from query', async () => {
        vi.spyOn(PostsService, 'findPopular').mockResolvedValue([]);

        await controller.getPopularPosts(
            mockReq({ query: { limit: '5', days: '7' } }),
            res as Response,
            next
        );

        expect(PostsService.findPopular).toHaveBeenCalledWith({ limit: 5, days: 7 });
        });
    });

    // ─────────────────────────────────────────────────────────────────────
    // getPostById
    // ─────────────────────────────────────────────────────────────────────
    describe('getPostById', () => {
        it('should return post by ID', async () => {
        const post = PostHelpers.mockPost();

        vi.spyOn(PostsService, 'findById').mockResolvedValue(post);

        await controller.getPostById(
            mockReq({ params: { id: '1' }, query: {} }),
            res as Response,
            next
        );

        expect(PostsService.findById).toHaveBeenCalledWith(1, false);
        });

        it('should pass includeRelations when query param is true', async () => {
        vi.spyOn(PostsService, 'findById').mockResolvedValue(PostHelpers.mockPostWithRelations());

        await controller.getPostById(
            mockReq({ params: { id: '1' }, query: { includeRelations: 'true' } }),
            res as Response,
            next
        );

        expect(PostsService.findById).toHaveBeenCalledWith(1, true);
        });
    });

    // ─────────────────────────────────────────────────────────────────────
    // getPostBySlug
    // ─────────────────────────────────────────────────────────────────────
    describe('getPostBySlug', () => {
        it('should return post by slug', async () => {
        const post = PostHelpers.mockPost();

        vi.spyOn(PostsService, 'findBySlug').mockResolvedValue(post);
        vi.spyOn(PostsService, 'incrementViewCount').mockResolvedValue(post);

        await controller.getPostBySlug(
            mockReq({ params: { slug: 'test-post' }, query: {} }),
            res as Response,
            next
        );

        expect(PostsService.findBySlug).toHaveBeenCalledWith('test-post', false);
        });

        it('should increment view count after fetching', async () => {
        const post = PostHelpers.mockPost({ id: 5 });

        vi.spyOn(PostsService, 'findBySlug').mockResolvedValue(post);
        vi.spyOn(PostsService, 'incrementViewCount').mockResolvedValue(post);

        await controller.getPostBySlug(
            mockReq({ params: { slug: 'test-post' }, query: {} }),
            res as Response,
            next
        );

        expect(PostsService.incrementViewCount).toHaveBeenCalledWith(5);
        });

        it('should not fail if view count increment fails', async () => {
        const post = PostHelpers.mockPost();

        vi.spyOn(PostsService, 'findBySlug').mockResolvedValue(post);
        vi.spyOn(PostsService, 'incrementViewCount').mockRejectedValue(new Error('DB error'));

        // Should still resolve and return the post
        await controller.getPostBySlug(
            mockReq({ params: { slug: 'test-post' }, query: {} }),
            res as Response,
            next
        );

        expect(res.json).toHaveBeenCalled();
        });
    });

    // ─────────────────────────────────────────────────────────────────────
    // getRelatedPosts
    // ─────────────────────────────────────────────────────────────────────
    describe('getRelatedPosts', () => {
        it('should return related posts', async () => {
        const post = PostHelpers.mockPost({ id: 1, categoryId: 2 });
        const related = PostHelpers.mockRelatedPosts(1, 2, 3);

        vi.spyOn(PostsService, 'findById').mockResolvedValue(post);
        vi.spyOn(PostsService, 'findRelated').mockResolvedValue(related);

        await controller.getRelatedPosts(
            mockReq({ params: { id: '1' }, query: {} }),
            res as Response,
            next
        );

        expect(PostsService.findRelated).toHaveBeenCalledWith(1, 2, 5);
        });

        it('should use custom limit from query', async () => {
        const post = PostHelpers.mockPost({ id: 1, categoryId: 2 });

        vi.spyOn(PostsService, 'findById').mockResolvedValue(post);
        vi.spyOn(PostsService, 'findRelated').mockResolvedValue([]);

        await controller.getRelatedPosts(
            mockReq({ params: { id: '1' }, query: { limit: '3' } }),
            res as Response,
            next
        );

        expect(PostsService.findRelated).toHaveBeenCalledWith(1, 2, 3);
        });
    });

    // ─────────────────────────────────────────────────────────────────────
    // getPostsByAuthor
    // ─────────────────────────────────────────────────────────────────────
    describe('getPostsByAuthor', () => {
        it('should return posts by author', async () => {
        const posts = PostHelpers.mockPosts(2, { authorId: 5 });

        vi.spyOn(PostsService, 'findByAuthor').mockResolvedValue(
            PostHelpers.mockPaginationResult(posts, 1, 10, 2)
        );

        await controller.getPostsByAuthor(
            mockReq({ params: { authorId: '5' }, query: { page: 1, limit: 10 } }),
            res as Response,
            next
        );

        expect(PostsService.findByAuthor).toHaveBeenCalledWith(5, expect.any(Object));
        });
    });

    // ─────────────────────────────────────────────────────────────────────
    // getPostsByCategory
    // ─────────────────────────────────────────────────────────────────────
    describe('getPostsByCategory', () => {
        it('should return posts by category', async () => {
        const posts = PostHelpers.mockPosts(2, { categoryId: 3 });

        vi.spyOn(PostsService, 'findByCategory').mockResolvedValue(
            PostHelpers.mockPaginationResult(posts, 1, 10, 2)
        );

        await controller.getPostsByCategory(
            mockReq({ params: { categoryId: '3' }, query: { page: 1, limit: 10 } }),
            res as Response,
            next
        );

        expect(PostsService.findByCategory).toHaveBeenCalledWith(3, expect.any(Object));
        });
    });

    // ─────────────────────────────────────────────────────────────────────
    // getPostStatistics
    // ─────────────────────────────────────────────────────────────────────
    describe('getPostStatistics', () => {
        it('should return statistics without authorId filter', async () => {
        const stats = PostHelpers.mockPostStatistics();

        vi.spyOn(PostsService, 'getStatistics').mockResolvedValue(stats);

        await controller.getPostStatistics(
            mockReq({ query: {} }),
            res as Response,
            next
        );

        expect(PostsService.getStatistics).toHaveBeenCalledWith(undefined);
        });

        it('should return statistics filtered by authorId', async () => {
        const stats = PostHelpers.mockPostStatistics({ total: 3 });

        vi.spyOn(PostsService, 'getStatistics').mockResolvedValue(stats);

        await controller.getPostStatistics(
            mockReq({ query: { authorId: '7' } }),
            res as Response,
            next
        );

        expect(PostsService.getStatistics).toHaveBeenCalledWith(7);
        });
    });

    // ─────────────────────────────────────────────────────────────────────
    // updatePost
    // ─────────────────────────────────────────────────────────────────────
    describe('updatePost', () => {
        it('should update post and pass user context', async () => {
        const dto = PostHelpers.mockUpdatePostDto();
        const updated = PostHelpers.mockPost();

        vi.spyOn(PostsService, 'update').mockResolvedValue(updated);

        await controller.updatePost(
            mockReq({
            params: { id: '1' },
            body: dto,
            user: { userId: 3, role: 'ADMIN' },
            }),
            res as Response,
            next
        );

        expect(PostsService.update).toHaveBeenCalledWith(1, dto, 3, 'ADMIN');
        });
    });

    // ─────────────────────────────────────────────────────────────────────
    // publishPost
    // ─────────────────────────────────────────────────────────────────────
    describe('publishPost', () => {
        it('should publish post successfully', async () => {
        const published = PostHelpers.mockPublishedPost();

        vi.spyOn(PostsService, 'publish').mockResolvedValue(published);

        await controller.publishPost(
            mockReq({ params: { id: '1' }, user: { userId: 1, role: 'USER' } }),
            res as Response,
            next
        );

        expect(PostsService.publish).toHaveBeenCalledWith(1, 1, 'USER');
        expect(res.json).toHaveBeenCalled();
        });
    });

    // ─────────────────────────────────────────────────────────────────────
    // unpublishPost
    // ─────────────────────────────────────────────────────────────────────
    describe('unpublishPost', () => {
        it('should unpublish post successfully', async () => {
        const draft = PostHelpers.mockDraftPost();

        vi.spyOn(PostsService, 'unpublish').mockResolvedValue(draft);

        await controller.unpublishPost(
            mockReq({ params: { id: '1' }, user: { userId: 1, role: 'USER' } }),
            res as Response,
            next
        );

        expect(PostsService.unpublish).toHaveBeenCalledWith(1, 1, 'USER');
        });
    });

    // ─────────────────────────────────────────────────────────────────────
    // toggleFeatured
    // ─────────────────────────────────────────────────────────────────────
    describe('toggleFeatured', () => {
        it('should toggle featured status', async () => {
        const featured = PostHelpers.mockFeaturedPost();

        vi.spyOn(PostsService, 'toggleFeatured').mockResolvedValue(featured);

        await controller.toggleFeatured(
            mockReq({ params: { id: '1' } }),
            res as Response,
            next
        );

        expect(PostsService.toggleFeatured).toHaveBeenCalledWith(1);
        });
    });

    // ─────────────────────────────────────────────────────────────────────
    // deletePost
    // ─────────────────────────────────────────────────────────────────────
    describe('deletePost', () => {
        it('should delete post and pass user context', async () => {
        vi.spyOn(PostsService, 'delete').mockResolvedValue(PostHelpers.mockPost());

        await controller.deletePost(
            mockReq({ params: { id: '1' }, user: { userId: 1, role: 'USER' } }),
            res as Response,
            next
        );

        expect(PostsService.delete).toHaveBeenCalledWith(1, 1, 'USER');
        expect(res.json).toHaveBeenCalled();
        });
    });
});