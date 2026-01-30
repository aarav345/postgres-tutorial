import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PostsService } from '../../../src/modules/posts/post.service';
import PostsRepository from '../../../src/modules/posts/post.repository';
import { PostHelpers } from '../../helpers/posts-helpers';
import { NotFoundError, AlreadyExistsError, AppError } from '../../../src/common/errors/app.error';
import { MESSAGES } from '../../../src/common/constants/messages.constant';

vi.mock('@/modules/posts/post.repository');
vi.mock('@/common/utils/slugify.util', () => ({
    slugify: (text: string) => text.toLowerCase().replace(/\s+/g, '-'),
}));

describe('PostsService', () => {
    let postsService: PostsService;

    beforeEach(() => {
        vi.clearAllMocks();
        postsService = new PostsService();
    });

    describe('create', () => {
        it('should create a post with auto-generated slug', async () => {
            const createDto = PostHelpers.mockCreatePostDto({ slug: undefined });
            const mockPost = PostHelpers.mockPost();

            vi.spyOn(PostsRepository, 'exists').mockResolvedValue(false);
            vi.spyOn(PostsRepository, 'create').mockResolvedValue(mockPost);

            const result = await postsService.create(createDto, 1);

            expect(PostsRepository.exists).toHaveBeenCalledWith('new-test-post');
            expect(PostsRepository.create).toHaveBeenCalled();
            expect(result).toEqual(mockPost);
        });

        it('should create a post with custom slug', async () => {
            const createDto = PostHelpers.mockCreatePostDto({ slug: 'custom-slug' });
            const mockPost = PostHelpers.mockPost({ slug: 'custom-slug' });

            vi.spyOn(PostsRepository, 'exists').mockResolvedValue(false);
            vi.spyOn(PostsRepository, 'create').mockResolvedValue(mockPost);

            const result = await postsService.create(createDto, 1);

            expect(PostsRepository.exists).toHaveBeenCalledWith('custom-slug');
            expect(result).toEqual(mockPost);
        });

        it('should throw AlreadyExistsError when slug already exists', async () => {
            const createDto = PostHelpers.mockCreatePostDto();

            vi.spyOn(PostsRepository, 'exists').mockResolvedValue(true);

            await expect(postsService.create(createDto, 1)).rejects.toThrow(new AlreadyExistsError(MESSAGES.POST.ALREADY_EXISTS));
            expect(PostsRepository.create).not.toHaveBeenCalled();
        });

        it('should set publishedAt when published is true', async () => {
            const createDto = PostHelpers.mockCreatePostDto({ published: true });
            const mockPost = PostHelpers.mockPublishedPost();

            vi.spyOn(PostsRepository, 'exists').mockResolvedValue(false);
            vi.spyOn(PostsRepository, 'create').mockResolvedValue(mockPost);

            await postsService.create(createDto, 1);

            const createCall = vi.mocked(PostsRepository.create).mock.calls[0][0];
            expect(createCall.publishedAt).toBeInstanceOf(Date);
        });

        it('should not set publishedAt when published is false', async () => {
            const createDto = PostHelpers.mockCreatePostDto({ published: false });
            const mockPost = PostHelpers.mockDraftPost();

            vi.spyOn(PostsRepository, 'exists').mockResolvedValue(false);
            vi.spyOn(PostsRepository, 'create').mockResolvedValue(mockPost);

            await postsService.create(createDto, 1);

            const createCall = vi.mocked(PostsRepository.create).mock.calls[0][0];
            expect(createCall.publishedAt).toBeNull();
        });
    });

    describe('findById', () => {
        it('should return post when exists', async () => {
            const mockPost = PostHelpers.mockPost();

            vi.spyOn(PostsRepository, 'findById').mockResolvedValue(mockPost);

            const result = await postsService.findById(1);

            expect(PostsRepository.findById).toHaveBeenCalledWith(1, false);
            expect(result).toEqual(mockPost);
        });

        it('should throw NotFoundError when post does not exist', async () => {
            vi.spyOn(PostsRepository, 'findById').mockResolvedValue(null);

            await expect(postsService.findById(999)).rejects.toThrow(new NotFoundError(MESSAGES.POST.NOT_FOUND));
        });

        it('should pass includeRelations parameter', async () => {
            const mockPost = PostHelpers.mockPostWithRelations();

            vi.spyOn(PostsRepository, 'findById').mockResolvedValue(mockPost);

            await postsService.findById(1, true);

            expect(PostsRepository.findById).toHaveBeenCalledWith(1, true);
        });
    });

    describe('findBySlug', () => {
        it('should return post by slug', async () => {
            const mockPost = PostHelpers.mockPost();

            vi.spyOn(PostsRepository, 'findBySlug').mockResolvedValue(mockPost);

            const result = await postsService.findBySlug('test-post');

            expect(PostsRepository.findBySlug).toHaveBeenCalledWith('test-post', false);
            expect(result).toEqual(mockPost);
        });

        it('should throw NotFoundError when slug does not exist', async () => {
            vi.spyOn(PostsRepository, 'findBySlug').mockResolvedValue(null);

            await expect(postsService.findBySlug('non-existent')).rejects.toThrow(new NotFoundError(MESSAGES.POST.NOT_FOUND));
        });
    });

    describe('findAll', () => {
        it('should return paginated posts', async () => {
            const mockPosts = PostHelpers.mockPosts(5);

            vi.spyOn(PostsRepository, 'findAll').mockResolvedValue(mockPosts);
            vi.spyOn(PostsRepository, 'count').mockResolvedValue(5);

            const result = await postsService.findAll({ page: 1, limit: 10 });

            expect(result.data).toEqual(mockPosts);
            expect(result.pagination.total).toBe(5);
            expect(result.pagination.totalPages).toBe(1);
        });

        it('should filter by published status', async () => {
            const publishedPosts = [PostHelpers.mockPublishedPost()];

            vi.spyOn(PostsRepository, 'findAll').mockResolvedValue(publishedPosts);
            vi.spyOn(PostsRepository, 'count').mockResolvedValue(1);

            await postsService.findAll({ published: true });

            const findAllCall = vi.mocked(PostsRepository.findAll).mock.calls[0][0];
            expect(findAllCall.where?.published).toBe(true);
        });

        it('should filter by categoryId', async () => {
        vi.spyOn(PostsRepository, 'findAll').mockResolvedValue([]);
        vi.spyOn(PostsRepository, 'count').mockResolvedValue(0);

        await postsService.findAll({ categoryId: 1 });

        const findAllCall = vi.mocked(PostsRepository.findAll).mock.calls[0][0];
        expect(findAllCall.where?.categoryId).toBe(1);
        });

        it('should filter by authorId', async () => {
            vi.spyOn(PostsRepository, 'findAll').mockResolvedValue([]);
            vi.spyOn(PostsRepository, 'count').mockResolvedValue(0);

            await postsService.findAll({ authorId: 1 });

            const findAllCall = vi.mocked(PostsRepository.findAll).mock.calls[0][0];
            expect(findAllCall.where?.authorId).toBe(1);
        });

        it('should search in title, excerpt, and content', async () => {
            vi.spyOn(PostsRepository, 'findAll').mockResolvedValue([]);
            vi.spyOn(PostsRepository, 'count').mockResolvedValue(0);

            await postsService.findAll({ search: 'test' });

            const findAllCall = vi.mocked(PostsRepository.findAll).mock.calls[0][0];
            expect(findAllCall.where?.OR).toBeDefined();
        });

        it('should calculate pagination metadata correctly', async () => {
            vi.spyOn(PostsRepository, 'findAll').mockResolvedValue([]);
            vi.spyOn(PostsRepository, 'count').mockResolvedValue(25);

            const result = await postsService.findAll({ page: 2, limit: 10 });

            expect(result.pagination.page).toBe(2);
            expect(result.pagination.limit).toBe(10);
            expect(result.pagination.total).toBe(25);
            expect(result.pagination.totalPages).toBe(3);
            expect(result.pagination.hasNext).toBe(true);
            expect(result.pagination.hasPrev).toBe(true);
        });
    });

    describe('update', () => {
        it('should update post successfully', async () => {
            const existingPost = PostHelpers.mockPost({ authorId: 1 });
            const updateDto = PostHelpers.mockUpdatePostDto();
            const updatedPost = PostHelpers.mockPost({ ...updateDto });

            vi.spyOn(PostsRepository, 'findById').mockResolvedValue(existingPost);
            vi.spyOn(PostsRepository, 'update').mockResolvedValue(updatedPost);

            const result = await postsService.update(1, updateDto, 1, 'USER');

            expect(result).toEqual(updatedPost);
        });

        it('should throw NotFoundError when post does not exist', async () => {
            vi.spyOn(PostsRepository, 'findById').mockResolvedValue(null);

            await expect(postsService.update(999, {}, 1, 'USER')).rejects.toThrow(new NotFoundError(MESSAGES.POST.NOT_FOUND));
        });

        it('should throw error when user is not author and not admin', async () => {
            const existingPost = PostHelpers.mockPost({ authorId: 1 });

            vi.spyOn(PostsRepository, 'findById').mockResolvedValue(existingPost);

            await expect(postsService.update(1, {}, 2, 'USER')).rejects.toThrow(AppError);
        });

        it('should allow author to update their post', async () => {
        const existingPost = PostHelpers.mockPost({ authorId: 1 });
        const updatedPost = PostHelpers.mockPost();

        vi.spyOn(PostsRepository, 'findById').mockResolvedValue(existingPost);
        vi.spyOn(PostsRepository, 'update').mockResolvedValue(updatedPost);

        await postsService.update(1, {}, 1, 'USER');

        expect(PostsRepository.update).toHaveBeenCalled();
        });

        it('should allow admin to update any post', async () => {
            const existingPost = PostHelpers.mockPost({ authorId: 1 });
            const updatedPost = PostHelpers.mockPost();

            vi.spyOn(PostsRepository, 'findById').mockResolvedValue(existingPost);
            vi.spyOn(PostsRepository, 'update').mockResolvedValue(updatedPost);

            await postsService.update(1, {}, 2, 'ADMIN');

            expect(PostsRepository.update).toHaveBeenCalled();
        });

        it('should throw error when slug already exists', async () => {
            const existingPost = PostHelpers.mockPost({ slug: 'old-slug' });

            vi.spyOn(PostsRepository, 'findById').mockResolvedValue(existingPost);
            vi.spyOn(PostsRepository, 'exists').mockResolvedValue(true);

            await expect(
                postsService.update(1, { slug: 'new-slug' }, 1, 'USER')
            ).rejects.toThrow(new AlreadyExistsError(MESSAGES.POST.ALREADY_EXISTS));
        });

        it('should set publishedAt when publishing for first time', async () => {
        const draftPost = PostHelpers.mockDraftPost({ authorId: 1 });
        const publishedPost = PostHelpers.mockPublishedPost();

        vi.spyOn(PostsRepository, 'findById').mockResolvedValue(draftPost);
        vi.spyOn(PostsRepository, 'update').mockResolvedValue(publishedPost);

        await postsService.update(1, { published: true }, 1, 'USER');

        const updateCall = vi.mocked(PostsRepository.update).mock.calls[0][1];
        expect(updateCall.publishedAt).toBeDefined();
        });
    });

    describe('delete', () => {
        it('should delete post successfully', async () => {
        const mockPost = PostHelpers.mockPost({ authorId: 1 });

        vi.spyOn(PostsRepository, 'findById').mockResolvedValue(mockPost);
        vi.spyOn(PostsRepository, 'delete').mockResolvedValue(mockPost);

        const result = await postsService.delete(1, 1, 'USER');

        expect(PostsRepository.delete).toHaveBeenCalledWith(1);
        expect(result).toEqual(mockPost);
        });

        it('should throw NotFoundError when post does not exist', async () => {
            vi.spyOn(PostsRepository, 'findById').mockResolvedValue(null);

            await expect(postsService.delete(999, 1, 'USER')).rejects.toThrow(new NotFoundError(MESSAGES.POST.NOT_FOUND));
        });

        it('should throw error when user is not author and not admin', async () => {
        const mockPost = PostHelpers.mockPost({ authorId: 1 });

        vi.spyOn(PostsRepository, 'findById').mockResolvedValue(mockPost);

        await expect(postsService.delete(1, 2, 'USER')).rejects.toThrow(AppError);
        });
    });

    describe('publish', () => {
        it('should publish draft post', async () => {
            const draftPost = PostHelpers.mockDraftPost({ authorId: 1 });
            const publishedPost = PostHelpers.mockPublishedPost();

            vi.spyOn(PostsRepository, 'findById').mockResolvedValue(draftPost);
            vi.spyOn(PostsRepository, 'publish').mockResolvedValue(publishedPost);

            const result = await postsService.publish(1, 1, 'USER');

            expect(PostsRepository.publish).toHaveBeenCalledWith(1);
            expect(result).toEqual(publishedPost);
        });

        it('should throw error when post is already published', async () => {
            const publishedPost = PostHelpers.mockPublishedPost({ authorId: 1 });

            vi.spyOn(PostsRepository, 'findById').mockResolvedValue(publishedPost);

            await expect(postsService.publish(1, 1, 'USER')).rejects.toThrow(AppError);
        });

        it('should throw error when user not authorized', async () => {
            const draftPost = PostHelpers.mockDraftPost({ authorId: 1 });

            vi.spyOn(PostsRepository, 'findById').mockResolvedValue(draftPost);

            await expect(postsService.publish(1, 2, 'USER')).rejects.toThrow(AppError);
        });
    });

    describe('unpublish', () => {
        it('should unpublish published post', async () => {
            const publishedPost = PostHelpers.mockPublishedPost({ authorId: 1 });
            const unpublishedPost = PostHelpers.mockDraftPost();

            vi.spyOn(PostsRepository, 'findById').mockResolvedValue(publishedPost);
            vi.spyOn(PostsRepository, 'unpublish').mockResolvedValue(unpublishedPost);

            const result = await postsService.unpublish(1, 1, 'USER');

            expect(PostsRepository.unpublish).toHaveBeenCalledWith(1);
            expect(result).toEqual(unpublishedPost);
        });

        it('should throw error when post is already unpublished', async () => {
            const draftPost = PostHelpers.mockDraftPost({ authorId: 1 });

            vi.spyOn(PostsRepository, 'findById').mockResolvedValue(draftPost);

            await expect(postsService.unpublish(1, 1, 'USER')).rejects.toThrow(AppError);
        });
    });

    describe('toggleFeatured', () => {
        it('should toggle featured from false to true', async () => {
            const normalPost = PostHelpers.mockPost({ featured: false });
            const featuredPost = PostHelpers.mockFeaturedPost();

            vi.spyOn(PostsRepository, 'findById').mockResolvedValue(normalPost);
            vi.spyOn(PostsRepository, 'toggleFeatured').mockResolvedValue(featuredPost);

            const result = await postsService.toggleFeatured(1);

            expect(result.featured).toBe(true);
        });

        it('should throw NotFoundError when post does not exist', async () => {
            vi.spyOn(PostsRepository, 'findById').mockResolvedValue(null);

            await expect(postsService.toggleFeatured(999)).rejects.toThrow(new NotFoundError(MESSAGES.POST.NOT_FOUND));
        });
    });

    describe('getStatistics', () => {
        it('should return statistics for all posts', async () => {
            const stats = PostHelpers.mockPostStatistics();

            vi.spyOn(PostsRepository, 'getStatistics').mockResolvedValue(stats);

            const result = await postsService.getStatistics();

            expect(PostsRepository.getStatistics).toHaveBeenCalledWith(undefined);
            expect(result).toEqual(stats);
        });

        it('should return statistics for specific author', async () => {
            const stats = PostHelpers.mockPostStatistics({ total: 5 });

            vi.spyOn(PostsRepository, 'getStatistics').mockResolvedValue(stats);

            const result = await postsService.getStatistics(1);

            expect(PostsRepository.getStatistics).toHaveBeenCalledWith(1);
            expect(result).toEqual(stats);
        });
    });
});